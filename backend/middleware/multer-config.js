const multer = require('multer');
const path = require('path');
const fs = require('fs');

const imagesDir = path.join(__dirname, '../images');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const name = file.originalname.split(' ').join('_');
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '_' + name);
  }
});

module.exports = multer({ storage }).any();
