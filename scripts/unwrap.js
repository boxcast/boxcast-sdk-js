const fs = require('fs');
const { join } = require('path');

const TARGET = './dist';

fs.readdirSync(TARGET).forEach((file) => {
  const entry = join(TARGET, file);
  const output = join(__dirname, '..', file);

  if (fs.existsSync(output)) {
    fs.unlinkSync(output); // Delete existing file
  }

  const stat = fs.statSync(entry);
  if (stat.isFile()) {
    fs.copyFileSync(entry, output); // Copy new file
  }
});
