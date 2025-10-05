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
    cb(null, Date.now() + path.extname(name));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées !'), false);
  }
};

const upload = multer({ storage, fileFilter }).any();

module.exports = (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};
