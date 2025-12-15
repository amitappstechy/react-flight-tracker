const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.xls') || f.endsWith('.xlsx'));

files.forEach(file => {
    console.log(`\n--- ${file} ---`);
    try {
        const workbook = XLSX.readFile(path.join(dataDir, file));
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (jsonData.length > 0) {
            console.log('Headers:', jsonData[0]);
            console.log('First Row:', jsonData[1]);
        } else {
            console.log('Empty sheet');
        }
    } catch (e) {
        console.log('Error reading file:', e.message);
    }
});
