const fs = require('fs');
const csv = require('csv-parser');

const results = [];

fs.createReadStream('newdump.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    fs.writeFileSync('newdump.json', JSON.stringify(results, null, 2));
    console.log('Conversion complete! newdump.json created.');
  })
  .on('error', (error) => {
    console.error('Error reading the CSV file:', error);
  });
