const multer = require("multer");

// Filtre pour le type de fichier image
const imgFilter = function (req, file, callback) {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if(!allowedTypes.includes(file.mimetype)) {
        return callback(new Error("Type de fichier non pris en charge"), false);
    }
    // Acceptation du fichier (null pour dire qu'il n'y a pas d'erreur, true pour accepter le fichier)
    callback(null, true); 
};

// Emplacement où Multer va stocker les images
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "images"); 
    },
    filename: (req, file, callback) => {
      callback(null, file.originalname);
    }
  });

// Configuration multer avec emplacement et filtre
const upload = multer({
    storage: storage, 
    fileFilter: imgFilter,
});

module.exports = upload.single("image");