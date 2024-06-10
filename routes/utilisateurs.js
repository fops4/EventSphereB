const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const connection = require('./../database'); // Assurez-vous que ce chemin est correct

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  console.log(username);
  console.log(email);
  console.log(password);

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
        return res.status(200).json({ message: 'Connexion réussie' });
      } else {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
    });
  } catch (error) {
    next(error); // Utilise le middleware de gestion des erreurs
  }
});

// Middleware de gestion des erreurs
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur' });
});

module.exports = router;
