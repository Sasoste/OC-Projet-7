const multer = require("multer");

const imgFilter = function (req, file, callback) {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if(!allowedTypes.includes(file.mimetype)) {
        return callback(new Error("Type de fichier non pris en charge"), false);
    }
    callback(null, true); 
};

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage, 
    fileFilter: imgFilter,
});

module.exports = upload.single("image");