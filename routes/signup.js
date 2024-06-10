const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const router = express.Router();
const connection = require('../database'); // Assurez-vous que ce chemin est correct

function isAlreadyLoggedIn(req, res, next) {
  if (req.session.user) {
    return res.status(403).json({ message: 'Vous êtes déjà connecté' });
  }
  next();
}


// Configure session middleware
router.use(session({
  secret: 'your_secret_key', // Remplacez par une clé secrète sécurisée
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Mettez à true si vous utilisez HTTPS
}));


// Route pour s'inscrire et démarrer une session
router.post('/signUp', async (req, res, next) => {
  const { selectedImage, username, email, password } = req.body;

  if (!selectedImage || !username || !email || !password) {
    return res.status(400).json({ message: 'Image, username, email, et mot de passe sont requis' });
  }

  try {
    // Vérifier si l'email est déjà utilisé
    const checkEmailSql = 'SELECT * FROM utilisateurs WHERE email = ?';
    connection.query(checkEmailSql, [email], async (err, results) => {
      if (err) {
        console.error('Erreur lors de la vérification de l\'email :', err);
        return next(err); // Utilise le middleware de gestion des erreurs
      }

      if (results.length > 0) {
        return res.status(409).json({ message: 'Email déjà utilisé' });
      }

      // Hash du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insérer le nouvel utilisateur
      const insertSql = `INSERT INTO utilisateurs (selectedImage, username, email, password) VALUES (?, ?, ?, ?)`;
      connection.query(insertSql, [selectedImage, username, email, hashedPassword], (err, results) => {
        if (err) {
          console.error('Erreur lors de la création de l\'utilisateur :', err);
          return next(err); // Utilise le middleware de gestion des erreurs
        }

        // Démarrer la session après la création de l'utilisateur
        req.session.user = {
          id: results.insertId, // Utiliser l'ID de l'utilisateur nouvellement créé
          username: username,
          email: email,
          selectedImage: selectedImage,
        };

        console.log('Utilisateur créé avec succès et session démarrée');
        res.status(201).json({ 
          message: 'Utilisateur créé avec succès',
          user: req.session.user
        });
      });
    });
  } catch (error) {
    next(error); // Utilise le middleware de gestion des erreurs
  }
});

// Route pour récupérer les informations de l'utilisateur connecté
router.get('/me', (req, res) => {
  if (req.session.user) {
    return res.status(200).json({ user: req.session.user });
  } else {
    return res.status(401).json({ message: 'Non autorisé' });
  }
});

// Middleware d'authentification
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Non autorisé' });
  }
}

// Exemple de route protégée
router.get('/protected-route', isAuthenticated, (req, res) => {
  res.status(200).json({ message: 'Vous avez accès à cette route protégée', user: req.session.user });
});

// Middleware de gestion des erreurs
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur' });
});

module.exports = router;
