const XLSX = require('xlsx');
const path = process.argv[2] || 'onu_type.xlsx';
const workbook = XLSX.readFile(path);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const range = XLSX.utils.decode_range(sheet['!ref']);
const headers = [];
for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + '1';
    if (sheet[address]) headers.push(sheet[address].v);
}
console.log(headers);
