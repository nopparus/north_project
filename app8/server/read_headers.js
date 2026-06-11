const xlsx = require('xlsx');
const filePath = '/home/nopparus2/www/app8/ONU Recoards.xlsx';
try {
  const workbook = xlsx.readFile(filePath, { sheetRows: 1 });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const headers = xlsx.utils.sheet_to_json(worksheet, { header: 1 })[0];
  console.log(JSON.stringify(headers));
} catch(e) {
  console.error("Error reading file:", e);
}
