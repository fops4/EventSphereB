const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const connection = require('./../database'); // Assurez-vous que ce chemin est correct

router.post('/updateprofile', async (req, res, next) => {
  const { email, username, selectedImage } = req.body;
  console.log(email, username, selectedImage);
  if (!email || !username || !selectedImage) {
    return res.status(400).json({ message: 'Email, nom d\'utilisateur et image sélectionnée sont requis' });
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

      // Mettre à jour le mot de passe dans la base de données
      const sqlUpdateProfile = `UPDATE utilisateurs SET username = ?, selectedImage = ? WHERE email = ?`;
      connection.query(sqlUpdateProfile, [username, selectedImage, email], (err, results) => {
        if (err) {
          console.error('Erreur lors de la mise à jour du profil :', err);
          return next(err); 
        }

        console.log('Profil mis à jour avec succès');
        res.status(200).json({ message: 'Profil mis à jour avec succès' });
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
