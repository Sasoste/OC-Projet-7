const Book = require("../models/Book");
const fs = require("fs");

// Créer un nouveau livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/${req.file.path}`, 
   });
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
  const updateInfos = {
    title: req.body.title,
    author: req.body.author,
    year: req.body.year,
    genre: req.body.genre,
  };

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) return res.status(404).json({ message: "Livre pas trouvé" });
      if (book.userId.toString() !== req.auth.userId.toString()) {
        return res.status(403).json({ message: "Non autorisé" });
      }

      if (req.file) {
        updateInfos.imageUrl = `${req.protocol}://${req.get("host")}/${req.file.path}`;
        if (book.imageUrl) {
          const filename = book.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, (error) => {
            if (error) console.error("Erreur de suppression de l'ancienne image", error);
          });
        }
      }

      return Book.updateOne(
        { _id: req.params.id, userId: req.auth.userId },
        { $set: updateInfos }
      );
    })
    .then((result) => {
      if (result.nModified === 0) {
        return res.status(404).json({ message: "Modification non autorisée" });
      } else {
        res.status(200).json({ message: "Livre modifié" });
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          if (error) {
            console.error("Erreur dans la suppression de l'image:", error);
          }
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

  exports.ratingBook = (req, res, next) => {
    const bookId = req.url.split("/")[1];
    const { userId, rating } = req.body; 

    Book.findOne({ _id : bookId })
    .then((book) => {
      if(book.ratings.some((rating) => rating.userId === userId)) {
        return res.status(400).json({ error: "L'utilisateur a déjà noté le livre"});
      }

      return Book.findOneAndUpdate(
        { _id: bookId },
        { $push: { ratings: { userId, grade: rating } } },
        { new: true }
      );
  })

    .then((updated) => {
      const ratingsSum = updated.ratings.reduce((acc, r) => acc + r.grade, 0);
      updated.averageRating = (ratingsSum / updated.ratings.length).toFixed(0);
      return updated.save();
    }) 
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
  }
  
  exports.bestRatings = (req, res, next) => {
    Book.find()
    .sort({ averageRating: -1 }) 
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
}; 
