const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'onu_type.xlsx');
const workbook = XLSX.readFile(filePath, { sheetRows: 1 });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];

console.log('Headers found:');
console.log(JSON.stringify(headers, null, 2));
