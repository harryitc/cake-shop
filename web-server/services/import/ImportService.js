const ExcelJS = require('exceljs');
const ImportHistory = require('../../schemas/ImportHistory.schema.js');
const { IMPORT_MODES, IMPORT_STATUS } = require('../../config/constants');

class ImportService {
  /**
   * Thực thi tiến trình Import
   * @param {Buffer} buffer - Buffer của file Excel tải lên
   * @param {Object} config - Cấu hình mapping & logic cho thực thể (Entity)
   * @param {String} mode - Chế độ import: UPSERT, INSERT_ONLY, UPDATE_ONLY
   * @param {String} userId - ID người thực hiện
   */
  async execute(buffer, config, mode = IMPORT_MODES.UPSERT, userId) {
    const startTime = Date.now();
    const history = await ImportHistory.create({
      userId,
      entityType: config.entity,
      fileName: 'Import_' + config.entity + '_' + startTime,
      importMode: mode,
      status: IMPORT_STATUS.PROCESSING
    });

    const stats = { total: 0, success: 0, failed: 0, skipped: 0 };
    const errors = [];
    const batchSize = config.batchSize || 500;
    let batch = [];

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.getWorksheet(1); // Mặc định đọc sheet đầu tiên

      // 1. Xác định Header Mapping (DB Field -> Column Number)
      const headerRow = worksheet.getRow(1);
      const headerMap = {}; 
      headerRow.eachCell((cell, colNumber) => {
        let value = cell.value;
        if (value && typeof value === 'object') {
          value = value.text || value.result || value.toString();
        }
        const title = typeof value === 'string' ? value.trim() : value;
        
        Object.entries(config.mapping).forEach(([excelHeader, dbField]) => {
          if (excelHeader === title) {
            headerMap[dbField] = colNumber;
          }
        });
      });

      // 2. Duyệt qua các dòng dữ liệu (Bắt đầu từ dòng 2)
      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        if (!row || !row.values || row.values.length === 0) continue;

        stats.total++;
        const rowData = {};
        
        // Trích xuất dữ liệu dựa trên Mapping
        Object.entries(headerMap).forEach(([dbField, colIndex]) => {
          let cellValue = row.getCell(colIndex).value;
          // Chuẩn hóa dữ liệu (trim nếu là string)
          if (typeof cellValue === 'string') {
            cellValue = cellValue.trim();
          } else if (cellValue && typeof cellValue === 'object' && cellValue.text) {
            cellValue = cellValue.text.trim();
          }
          rowData[dbField] = cellValue;
        });

        // Validation & Transformation Hook
        try {
          // Transform logic (vd: tìm ID từ tên)
          if (config.transform) {
            await config.transform(rowData);
          }

          // Validate logic (Joi hoặc custom)
          if (config.validate) {
            const { error, value } = config.validate(rowData);
            if (error) throw new Error(error.message);
            batch.push({ _row: i, ...value });
          } else {
            batch.push({ _row: i, ...rowData });
          }
        } catch (err) {
          stats.failed++;
          errors.push({ row: i, rawData: rowData, message: err.message });
        }

        // 3. Xử lý Batch khi đủ số lượng
        if (batch.length >= batchSize) {
          await this.processBatch(batch, config, mode, stats, errors);
          batch = []; // Reset batch
        }
      }

      // Xử lý các dòng còn lại
      if (batch.length > 0) {
        await this.processBatch(batch, config, mode, stats, errors);
      }

      // 4. Hoàn tất và cập nhật lịch sử
      history.status = IMPORT_STATUS.COMPLETED;
      history.stats = stats;
      history.errors = errors;
      history.duration = Date.now() - startTime;
      await history.save();

      return {
        success: true,
        historyId: history._id,
        stats,
        previewErrors: errors.slice(0, 10) // Trả về 10 lỗi đầu tiên để preview nhanh
      };

    } catch (error) {
      history.status = IMPORT_STATUS.FAILED;
      history.errors.push({ row: 0, message: 'Lỗi hệ thống: ' + error.message });
      await history.save();
      throw error;
    }
  }

  /**
   * Xử lý một đợt (Batch) dữ liệu xuống MongoDB bằng bulkWrite
   */
  async processBatch(batch, config, mode, stats, errors) {
    const operations = [];
    const operationMeta = []; // Mapping index -> metadata (rowIndex, etc.)
    const { model, uniqueKey } = config;
    const mongoose = require('mongoose');

    // Helper kiểm tra ID hợp lệ
    const getValidId = (val) => {
      if (!val) return null;
      if (mongoose.Types.ObjectId.isValid(val)) return val;
      return null;
    };

    // Chuẩn bị cho UPSERT: Tìm xem ID nào thực sự tồn tại trong DB
    let existingIds = new Set();
    if (mode === IMPORT_MODES.UPSERT) {
      const idsToSearch = batch.map(item => getValidId(item[uniqueKey])).filter(id => id);
      if (idsToSearch.length > 0) {
        const existingDocs = await model.find({ [uniqueKey]: { $in: idsToSearch } }, { [uniqueKey]: 1 }).lean();
        existingIds = new Set(existingDocs.map(doc => doc._id.toString()));
      }
    }

    for (const item of batch) {
      const rowIndex = item._row;
      const dataToSave = { ...item };
      delete dataToSave._row; // Loại bỏ field phụ

      const rawId = item[uniqueKey];
      const validId = getValidId(rawId);
      const filter = { [uniqueKey]: validId };

      switch (mode) {
        case IMPORT_MODES.UPSERT:
          if (validId && existingIds.has(validId.toString())) {
            // Có ID và Tồn tại -> Update
            operations.push({
              updateOne: {
                filter,
                update: { $set: dataToSave },
                upsert: false
              }
            });
            operationMeta.push({ rowIndex });
          } else {
            // Không có ID hoặc ID không tồn tại -> Tạo mới (Luôn tự sinh ID)
            const newItem = { ...dataToSave };
            delete newItem[uniqueKey]; // Xóa ID cũ nếu có để MongoDB tự sinh
            operations.push({
              insertOne: { document: newItem }
            });
            operationMeta.push({ rowIndex });
          }
          break;

        case IMPORT_MODES.INSERT_ONLY:
          // Luôn tạo mới và tự sinh ID (Bỏ qua triệt để mọi ID cũ)
          const insertItem = { ...dataToSave };
          delete insertItem[uniqueKey];
          operations.push({
            insertOne: { document: insertItem }
          });
          operationMeta.push({ rowIndex });
          break;

        case IMPORT_MODES.UPDATE_ONLY:
          if (validId) {
            operations.push({
              updateOne: {
                filter,
                update: { $set: dataToSave },
                upsert: false
              }
            });
            operationMeta.push({ rowIndex });
          } else {
            // Không có ID hợp lệ -> Báo lỗi thay vì chỉ skip
            stats.failed++;
            errors.push({
              row: rowIndex,
              rawData: dataToSave,
              message: "Thiếu 'ID Sản phẩm' cho chế độ Cập nhật (Update Only)."
            });
          }
          break;
      }
    }

    if (operations.length > 0) {
      try {
        const result = await model.bulkWrite(operations, { ordered: false });
        
        // Cập nhật thống kê thành công
        // Trong MongoDB driver hiện đại: insertedCount, matchedCount, modifiedCount, upsertedCount
        // Chúng ta tính success = những gì đã được ghi vào DB (thêm mới hoặc khớp để update)
        stats.success += (result.insertedCount || 0) + (result.upsertedCount || 0) + (result.matchedCount || 0);

        // Riêng với UPDATE_ONLY, tính skipped cho những record có ID nhưng không tìm thấy trong DB
        if (mode === IMPORT_MODES.UPDATE_ONLY) {
          const updateOpsCount = operations.filter(op => op.updateOne).length;
          const missedUpdates = updateOpsCount - (result.matchedCount || 0);
          stats.skipped += Math.max(0, missedUpdates);
        }
      } catch (error) {
        // Xử lý lỗi BulkWrite (ví dụ: lỗi Unique constraint)
        if (error.name === 'BulkWriteError' || error.code === 11000) {
          const writeErrors = error.writeErrors || [];
          stats.failed += writeErrors.length;
          
          writeErrors.forEach(err => {
            const op = operations[err.index];
            const meta = operationMeta[err.index];
            const originalRow = meta ? meta.rowIndex : 'N/A';
            const rawData = op.insertOne ? op.insertOne.document : (op.updateOne ? op.updateOne.update.$set : {});
            
            errors.push({
              row: originalRow, 
              rawData,
              message: err.errmsg || 'Lỗi DB: Bản ghi có thể đã tồn tại hoặc dữ liệu không hợp lệ.'
            });
          });

          // Những cái thành công trong đợt lỗi này vẫn được tính
          const result = error.result;
          if (result) {
            stats.success += (result.insertedCount || 0) + (result.upsertedCount || 0) + (result.matchedCount || 0);
          }
        } else {
          // Lỗi nghiêm trọng khác
          throw error;
        }
      }
    }
  }
}

module.exports = new ImportService();
