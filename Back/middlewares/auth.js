const jwt = require("jsonwebtoken");

// Permet de vérifier si le JWT est valide, s'il l'est, on ajoute l'userId à la requete pour l'identifier plus facilement plus tard
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId,
        };
        next();
    } catch(error) {
        res.status(401).json({ error });
    }
};