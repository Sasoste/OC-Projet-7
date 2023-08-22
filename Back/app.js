const express = require("express");
const app = express();
const mongoose = require("mongoose"); 
const booksRoutes = require("./routes/Book");
const userRoutes = require("./routes/User");
const path = require("path");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

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
  );
  next();
});

// Limite le nombre d'action à 100 toutes les 15 minutes. 
const limiter = rateLimit({
  windowsMs: 15*60*1000,
  max: 100, 
  message: "Vous avez atteint le nombre limite de requêtes, rééssayer dans 15 minutes"
})

// Connecte au serveur mongoose
mongoose.connect(process.env.MONGODB_URI,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Les middlewares
app.use(limiter); // Applique la limitation  
app.use(express.json()); // Parse les corps de requête au format JSON
app.use("/images", express.static(path.join(__dirname, "images"))); // Envoie la bonne image par rapport à l'URL
app.use("/api/books", booksRoutes); // Utilise les routes pour les livres
app.use("/api/auth", userRoutes); // Utilise les routes pour les users


module.exports = app;
