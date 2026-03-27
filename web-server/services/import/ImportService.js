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

      // 1. Xác định Header
      const headerRow = worksheet.getRow(1);
      const headers = [];
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber] = cell.value;
      });

      // 2. Duyệt qua các dòng dữ liệu (Bắt đầu từ dòng 2)
      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        if (!row.values.length) continue; // Bỏ qua dòng trống

        stats.total++;
        const rowData = {};
        
        // Map Excel Columns to DB Fields
        Object.entries(config.mapping).forEach(([excelHeader, dbField]) => {
          const colIndex = headers.indexOf(excelHeader);
          if (colIndex !== -1) {
            rowData[dbField] = row.getCell(colIndex).value;
          }
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
            batch.push(value);
          } else {
            batch.push(rowData);
          }
        } catch (err) {
          stats.failed++;
          errors.push({ row: i, rawData: rowData, message: err.message });
        }

        // 3. Xử lý Batch khi đủ số lượng
        if (batch.length >= batchSize) {
          await this.processBatch(batch, config, mode, stats);
          batch = []; // Reset batch
        }
      }

      // Xử lý các dòng còn lại
      if (batch.length > 0) {
        await this.processBatch(batch, config, mode, stats);
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
  async processBatch(batch, config, mode, stats) {
    const operations = [];

    for (const item of batch) {
      const filter = { [config.uniqueKey]: item[config.uniqueKey] };
      
      switch (mode) {
        case IMPORT_MODES.UPSERT:
          operations.push({
            updateOne: {
              filter,
              update: { $set: item },
              upsert: true
            }
          });
          break;
        case IMPORT_MODES.INSERT_ONLY:
          operations.push({
            updateOne: {
              filter,
              update: { $setOnInsert: item },
              upsert: true
            }
          });
          break;
        case IMPORT_MODES.UPDATE_ONLY:
          operations.push({
            updateOne: {
              filter,
              update: { $set: item },
              upsert: false
            }
          });
          break;
      }
    }

    if (operations.length > 0) {
      const result = await config.model.bulkWrite(operations, { ordered: false });
      
      // Cập nhật thống kê dựa trên kết quả bulkWrite
      // Lưu ý: bulkWrite kết quả có thể phức tạp để đếm chính xác từng loại (upserted, modified, matched)
      // Tạm thời tính tất cả là thành công nếu không có lỗi ném ra. 
      // Có thể cải tiến đếm chính xác dựa trên result.upsertedCount, result.modifiedCount...
      stats.success += (result.upsertedCount + result.modifiedCount + result.insertedCount || 0);
      
      if (mode === IMPORT_MODES.INSERT_ONLY) {
        // Trong chế độ INSERT_ONLY, những dòng trùng sẽ không được insert và result.matchedCount > 0
        // Chúng ta tính đó là 'skipped'
        stats.skipped += (result.matchedCount || 0);
      }
      
      if (mode === IMPORT_MODES.UPDATE_ONLY) {
        // Trong chế độ UPDATE_ONLY, những dòng không tồn tại sẽ không được xử lý
        // Có thể tính là 'skipped' bằng cách lấy (tổng số - matchedCount)
        const skipped = operations.length - (result.matchedCount || 0);
        stats.skipped += skipped;
        stats.success += (result.modifiedCount || 0); // Chỉ đếm những dòng thực sự cập nhật
      }
    }
  }
}

module.exports = new ImportService();
