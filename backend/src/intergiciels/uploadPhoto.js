const multer = require("multer");
const path = require("path");

const stockage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads/hopitaux")),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});

module.exports = multer({ stockage, storage: stockage });