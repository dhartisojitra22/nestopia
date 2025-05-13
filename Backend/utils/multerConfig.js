// const multer = require('multer');

// const storage = multer.diskStorage({
//     destination: './uploads/',
//     filename: (req, file, cb) => {
//         cb(null, file.originalname); 
//     }
// });

// const upload = multer({ storage }).single('profileImage');

// module.exports = upload;


const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original file name
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter 
}).single('profileImage'); // Change 'profileImage' to 'image' to match the field name in the property route

module.exports = upload;