const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer-config");
const bookCtrl = require("../controllers/Book");
const resizeImg = require("../middlewares/sharp");

router.get("/", bookCtrl.getAllBooks);

router.get("/bestrating", bookCtrl.bestRatings);

router.get("/:id", bookCtrl.getOneBook);

router.post("/", auth, multer, resizeImg, bookCtrl.createBook);

router.post("/:id/rating", auth, bookCtrl.ratingBook);

router.put("/:id", auth, multer, resizeImg, bookCtrl.modifyBook);

router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
