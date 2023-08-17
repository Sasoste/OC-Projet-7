const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const resizeImg = (req, res, next) => {
  if (!req.file) {
    return next();
  }
  const imgName = req.file.filename
    .replace(/(?:\.(?![^.]+$)|[^\w.])+/g, "")
    .replace(/\.[^/.]+$/, "");
  const newImgName = `${Date.now()}-${imgName}.webp`;
  const outputPath = path.join("images", newImgName);

  sharp(req.file.path)
    .resize(206, 260, "cover")
    .webp({ quality: 70 })
    .toFile(outputPath)
    .then(() => {
      fs.unlink(req.file.path, (error) => {
        if (error) {
          console.error("Erreur lors de la suppression de l'image:", error);
        }
        req.file.path = outputPath;
        next();
      });
    })
    .catch((error) => {
        console.error("Erreur lors du traitement de l'image:", error);
        res.status(500).json({ error: "Erreur lors du traitement de l'image" })
    });
};
module.exports = resizeImg;
