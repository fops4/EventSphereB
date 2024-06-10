const express = require('express');
const router = express.Router();
const connection = require('../database');

// Route pour réserver un événement
router.post('/reservations', async (req, res, next) => {
    const { reserveur, evenement_id } = req.body;
  
    if (!reserveur || !evenement_id) {
      return res.status(400).json({ message: 'Reserveur et evenement_id sont requis' });
    }
  
    try {
      // Vérifier si la réservation existe déjà
      const checkSql = `SELECT COUNT(*) AS count FROM reservations WHERE reserveur = ? AND evenement_id = ?`;
      connection.query(checkSql, [reserveur, evenement_id], (err, results) => {
        if (err) {
          console.error('Erreur lors de la vérification de la réservation :', err);
          return next(err);
        }
  
        const reservationExists = results[0].count > 0;
        if (reservationExists) {
          return res.status(409).json({ message: 'Vous avez déjà réservé cet événement' });
        }
  
        // Insérer la nouvelle réservation
        const insertSql = `INSERT INTO reservations (reserveur, evenement_id) VALUES (?, ?)`;
        connection.query(insertSql, [reserveur, evenement_id], (err, results) => {
          if (err) {
            console.error('Erreur lors de la réservation de l\'événement :', err);
            return next(err);
          }
  
          console.log('Événement réservé avec succès');
          res.status(201).json({ message: 'Événement réservé avec succès' });
        });
      });
    } catch (error) {
      next(error);
    }
  });
  
// Route pour obtenir les billets réservés par l'utilisateur
router.get('/mes-reservations/:reserveur', async (req, res, next) => {
    const { reserveur } = req.params;
  
    try {
      const sql = `
        SELECT e.*, r.id AS reservation_id 
        FROM reservations r 
        JOIN evenements e ON r.evenement_id = e.id 
        WHERE r.reserveur = ?`;
  
      connection.query(sql, [reserveur], (err, results) => {
        if (err) {
          console.error('Erreur lors de la récupération des réservations :', err);
          return res.status(500).json({ message: 'Erreur lors de la récupération des réservations.' });
        }
  
        res.status(200).json({ reservations: results });
      });
    } catch (error) {
      console.error('Erreur serveur :', error);
      res.status(500).json({ message: 'Erreur serveur lors de la récupération des réservations.' });
    }
  });
  

// Route pour annuler une réservation
router.delete('/reservations/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const sql = `DELETE FROM reservations WHERE id = ?`;
    connection.query(sql, [id], (err, results) => {
      if (err) {
        console.error('Erreur lors de l\'annulation de la réservation :', err);
        return next(err);
      }

      res.status(200).json({ message: 'Réservation annulée avec succès' });
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
