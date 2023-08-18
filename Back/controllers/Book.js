const Book = require("../models/Book");
const fs = require("fs");

// Créer un nouveau livre
exports.createBook = (req, res, next) => {
  // Transforme l'objet JSON en objet JS
  const bookObject = JSON.parse(req.body.book);
  // Retire l'id et l'userid de base crée par mongoDB
  delete bookObject._id;
  delete bookObject._userId;
  // Crée le nouveau livre avec l'userId de l'utilisateur
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/${req.file.path}`,
  });
  // Sauvegarde le nouveau livre dans la base de données ou renvoie un message d'erreur
  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Livre enregistré" });
    })
    .catch((error) => {
      console.error(error);
      res.status(400).json({ error });
    });
};

// Fonction pour modifier un livre
exports.modifyBook = (req, res, next) => {
  // Création d'un objet avec les nouvelles données du livre
  const updateInfos = {
    title: req.body.title,
    author: req.body.author,
    year: req.body.year,
    genre: req.body.genre,
  };

  // Recherche du livre par son id
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) return res.status(404).json({ message: "Livre pas trouvé" });
      if (book.userId.toString() !== req.auth.userId.toString()) {
        return res.status(403).json({ message: "Non autorisé" });
      }
      // S'il y a une image, on met à jour l'url 
      if (req.file) {
        updateInfos.imageUrl = `${req.protocol}://${req.get("host")}/${
          req.file.path
        }`;
        // S'il y a déjà une image on la supprime
        if (book.imageUrl) {
          const filename = book.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, (error) => {
            if (error)
              console.error("Erreur de suppression de l'ancienne image", error);
          });
        }
      }
      // Mise à jour du livre dans la base de données
      return Book.updateOne(
        { _id: req.params.id, userId: req.auth.userId },
        { $set: updateInfos }
      );
    })
    // Vérification que la modification se soit bien faite
    .then((result) => {
      if (result.nModified === 0) {
        return res.status(404).json({ message: "Modification non autorisée" });
      } else {
        res.status(200).json({ message: "Livre modifié" });
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

// Fonction pour supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        // Extraction du nom du fichier image puis suppression de l'image
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, (error) => {
          if (error) {
            console.error("Erreur dans la suppression de l'image:", error);
          } else {
            // Si la suppression de l'image est ok, on supprime le livre
            Book.deleteOne({ _id: req.params.id })
              .then(() => {
                res.status(200).json({ message: "Livre supprimé" });
              })
              .catch((error) => res.status(401).json({ error }));
          }
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// Cherche un livre dans la base de données
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(404).json({ error }));
};

// Cherche tous les livres dans la base de données
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Fonction pour noter les livres
exports.ratingBook = (req, res, next) => {
  // Récupère l'id du livre
  const bookId = req.url.split("/")[1];
  // Récupère les données utilisateur et note
  const { userId, rating } = req.body;

  Book.findOne({ _id: bookId })
    .then((book) => {
      // Vérification si l'utilisateur a déjà noté le livre
      if (book.ratings.some((rating) => rating.userId === userId)) {
        return res
          .status(400)
          .json({ error: "L'utilisateur a déjà noté le livre" });
      }

      // Si l'utilisateur a pas noté, on rajoute la nouvelle note
      return Book.findOneAndUpdate(
        { _id: bookId },
        { $push: { ratings: { userId, grade: rating } } },
        { new: true }
      );
    })
    // On calcule la note moyenne du livre
    .then((updated) => {
      const ratingsSum = updated.ratings.reduce((acc, r) => acc + r.grade, 0);
      updated.averageRating = (ratingsSum / updated.ratings.length).toFixed(0);
      return updated.save();
    })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};
// Fonction qui cherche les livres, les trie par note décroissante et retourne les 3 premiers
exports.bestRatings = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};
