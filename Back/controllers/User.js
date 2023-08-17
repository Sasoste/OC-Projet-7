const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    console.log("Tentative de connexion avec l'email:", req.body.email);
    
    User.findOne({email: req.body.email})
    .then(user => {
        if(user === null) {
            console.log("Aucun utilisateur trouvé avec cet email");
            res.status(401).json({ message: 'Identifiant ou mot de passe incorrect' })
        } else {
            console.log("Utilisateur trouvé, vérification du mot de passe...");
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid) {
                    console.log("Mot de passe incorrect");
                    res.status(401).json({ message: 'Identifiant ou mot de passe incorrect' })
                } else {
                    console.log("Connexion réussie");
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            "RANDOM_TOKEN_SECRET",
                            { expiresIn: '24h' }
                        )
                    });
                }
            })
            .catch(error => {
                console.error("Erreur lors de la comparaison des mots de passe:", error);
                res.status(500).json({ error });
            });
        }
    })
    .catch(error => {
        console.error("Erreur lors de la recherche de l'utilisateur:", error);
        res.status(500).json({ error });
    });
};