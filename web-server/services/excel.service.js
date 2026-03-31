const ExcelJS = require('exceljs');

class ExcelService {
  /**
   * Tạo file Excel từ dữ liệu
   * @param {string} sheetName - Tên của sheet
   * @param {Array} columns - Danh sách các cột [{header: 'Tên', key: 'name', width: 20}]
   * @param {Array} rows - Dữ liệu từng dòng
   * @returns {Promise<ExcelJS.Workbook>}
   */
  async generateExcel(sheetName, columns, rows) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Cấu hình các cột
    worksheet.columns = columns;

    // Định dạng Header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4F81BD' },
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Thêm dữ liệu
    worksheet.addRows(rows);

    // Kẻ bảng (Borders) cho toàn bộ dữ liệu
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Tự động bật bộ lọc (AutoFilter)
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columns.length },
    };

    return workbook;
  }
}

module.exports = new ExcelService();
