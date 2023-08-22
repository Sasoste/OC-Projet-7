const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Middleware pour redimensionner les images
const resizeImg = (req, res, next) => {
  // Vérification qu'une fichier a été envoyé
  if (!req.file || !req.file.filename) {
    return next();
  } else {
    // Changement du nom de l'image pour le rendre unique
    const imgName = req.file.filename.replace(/\.[^.]*$/, "");
    const newImgName = `${Date.now()}-${imgName}.webp`;
    const outputPath = path.join("images", newImgName).replace(/\\/g, '/');

    // Sharp pour redimensionner, convertir les images, les sauvegarde selon le chemin
    sharp(req.file.path)
      .resize(206, 260, "cover")
      .webp({ quality: 70 })
      .toFile(outputPath)
      .then(() => {
        // Supression de l'image originale 
        fs.unlink(req.file.path, (error) => {
          if (error) {
            console.error("Erreur lors de la suppression de l'image:", error);
          }
          // Mise à jour du chemin pour accèder à la nouvelle image
          req.file.path = outputPath;
          next();
        });
      })
      .catch((error) => {
        console.error("Erreur lors du traitement de l'image:", error);
        res.status(500).json({ error: "Erreur lors du traitement de l'image" });
      });
  }
};

module.exports = resizeImg;