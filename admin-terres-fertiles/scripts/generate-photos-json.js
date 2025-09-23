const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src/assets/PHOTOS_REFERENCES');
const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
fs.writeFileSync(
  path.join(__dirname, '../src/assets/photos.json'),
  JSON.stringify(files, null, 2)
); 