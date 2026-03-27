const ImportHistory = require('../schemas/ImportHistory.schema.js');
const { createError, sendSuccess } = require('../utils/response.utils');
const { HTTP_STATUS, ERROR_CODES } = require('../config/constants');
const ExcelJS = require('exceljs');

const downloadErrors = async (req, res, next) => {
  try {
    const { historyId } = req.params;
    
    const history = await ImportHistory.findById(historyId);
    if (!history) {
      throw createError('Không tìm thấy lịch sử import', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    if (!history.errors || history.errors.length === 0) {
      throw createError('Không có dữ liệu lỗi để tải về', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lỗi Import');

    // Map DB fields back to Excel headers based on cakeImportConfig
    const cakeImportConfig = require('../services/import/configs/cake.import.config');
    const dbToExcelMap = {};
    Object.entries(cakeImportConfig.mapping).forEach(([excelHeader, dbField]) => {
      dbToExcelMap[dbField] = excelHeader;
    });

    // Create headers based on original Excel headers
    const columns = [];
    const excelHeaders = Object.keys(cakeImportConfig.mapping);
    excelHeaders.forEach(header => {
      columns.push({ header: header, key: header, width: 25 });
    });

    // Thêm cột Lỗi vào cuối cùng
    columns.push({ header: 'LỖI CHI TIẾT', key: 'error_message', width: 50 });

    worksheet.columns = columns;

    history.errors.forEach(err => {
      const rowData = {};
      
      // Điền dữ liệu gốc (map ngược từ db field sang excel header)
      if (err.rawData) {
        Object.entries(err.rawData).forEach(([dbField, value]) => {
          const excelHeader = dbToExcelMap[dbField];
          if (excelHeader) {
            let val = value;
            if (typeof val === 'object' && val !== null) {
              val = JSON.stringify(val);
            }
            rowData[excelHeader] = val;
          }
        });
      }

      // Điền lỗi vào cột cuối
      rowData['error_message'] = `Dòng ${err.row}: ${err.message}`;
      
      worksheet.addRow(rowData);
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Error_Report_${history.fileName || historyId}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, entityType } = req.query;
    const query = {};
    if (entityType) query.entityType = entityType;

    const history = await ImportHistory.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ImportHistory.countDocuments(query);

    return sendSuccess(res, {
      items: history,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    }, 'Lấy lịch sử import thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  downloadErrors,
  getHistory
};
