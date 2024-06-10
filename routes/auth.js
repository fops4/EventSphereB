const express = require('express');
const router = express.Router();
const connection = require('../database');

// Route pour déconnexion
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
      }
      res.clearCookie('connect.sid'); // Nom du cookie de session
      res.status(200).json({ message: 'Déconnexion réussie' });
    });
  } else {
    res.clearCookie('authToken'); // Nom du cookie d'authentification
    res.status(200).json({ message: 'Déconnexion réussie' });
  }
});

// Middleware de gestion des erreurs
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur' });
});

module.exports = router;
