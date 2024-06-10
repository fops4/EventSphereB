const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const router = express.Router();
const connection = require('./../database'); // Assurez-vous que ce chemin est correct



// Configure session middleware
router.use(session({
  secret: 'your_secret_key', // Remplacez par une clé secrète sécurisée
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Mettez à true si vous utilisez HTTPS
}));

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe sont requis' });
  }

  try {
    const sql = `SELECT * FROM utilisateurs WHERE email = ?`;
    connection.query(sql, [email], async (err, results) => {
      if (err) {
        console.error('Erreur lors de la recherche de l\'utilisateur :', err);
        return next(err); // Utilise le middleware de gestion des erreurs
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        console.log('Utilisateur connecté avec succès');

        // Démarrer la session
        req.session.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          selectedImage: user.selectedImage,
          // Ajoutez d'autres informations sur l'utilisateur si nécessaire
        };

        return res.status(200).json({ 
          message: 'Connexion réussie',
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            selectedImage: user.selectedImage,
            // Ajoutez d'autres informations sur l'utilisateur si nécessaire
          }
        });
      } else {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
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
