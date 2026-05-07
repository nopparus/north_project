const XLSX = require('/home/nopparus2/www/app5/node_modules/xlsx');
const path = require('path');
const workbook = XLSX.readFile(path.join(__dirname, '../ONU.xlsx'), { sheetRows: 5 });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);
console.log('Columns:', Object.keys(data[0] || {}));
console.log('Sample Row:', data[0]);
