const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const connection = require('./../database'); // Assurez-vous que ce chemin est correct

router.post('/resetpassword', async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et nouveau mot de passe sont requis' });
  }

  try {
    const sqlSelectUser = `SELECT * FROM utilisateurs WHERE email = ?`;
    connection.query(sqlSelectUser, [email], async (err, results) => {
      if (err) {
        console.error('Erreur lors de la recherche de l\'utilisateur :', err);
        return next(err); 
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      const user = results[0];

      // Hashage du nouveau mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Mettre à jour le mot de passe dans la base de données
      const sqlUpdatePassword = `UPDATE utilisateurs SET password = ? WHERE email = ?`;
      connection.query(sqlUpdatePassword, [hashedPassword, email], (err, results) => {
        if (err) {
          console.error('Erreur lors de la mise à jour du mot de passe :', err);
          return next(err); 
        }

        console.log('Mot de passe mis à jour avec succès');
        res.status(200).json({ message: 'Mot de passe mis à jour avec succès' });
      });
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
