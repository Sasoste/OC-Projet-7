const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); 
const booksRoutes = require("./routes/Book");
const userRoutes = require("./routes/User");
const path = require("path");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const limiter = rateLimit({
  windowsMs: 15*60*1000,
  max: 10, 
  message: "Vous avez atteint le nombre limite de requêtes, rééssayer dans 15 minutes"
})

mongoose.connect(process.env.MONGODB_URI,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(limiter); 


app.use(bodyParser.json());
app.use(express.json());


// header pour CORS, qui permet l'utilisation d'une source différente entre le back et le front
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Accès à l'API depuis n'importe quelle origine
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  ); // AJout des headers
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  ); // Ajout des méthodes
  next();
});

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/books", booksRoutes); 
app.use("/api/auth", userRoutes);


module.exports = app;
