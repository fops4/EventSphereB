const express = require('express');
const router = express.Router();
const connection = require('../database');

// Route pour créer un événement
router.post('/creerevenement', async (req, res, next) => {
  const { createur, image, privacy, amount, type, title, date, timeStart, timeEnd, seats, localisation, description } = req.body;

  console.log('Données reçues:', req.body); // Log des données reçues pour vérification

  if (!createur || !image || !privacy || !amount || !type || !title || !date || !timeStart || !timeEnd || !seats || !localisation || !description) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    const sql = `INSERT INTO evenements (createur, image, privacy, amount, type, title, date, timeStart, timeEnd, seats, localisation, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(sql, [createur, image, privacy, amount, type, title, date, timeStart, timeEnd, seats, localisation, description], (err, results) => {
      if (err) {
        console.error('Erreur lors de la création de l\'événement :', err);
        return next(err);
      }

      console.log('Événement créé avec succès');
      res.status(201).json({ message: 'Événement créé avec succès' });
    });
  } catch (error) {
    next(error);
  }
});


// Route pour récupérer les événements par créateur
router.get('/evenements/:createur', (req, res, next) => {
  const { createur } = req.params;

  if (!createur) {
    return res.status(400).json({ message: 'Le créateur est requis' });
  }

  try {
    const sql = `SELECT * FROM evenements WHERE createur = ?`;
    connection.query(sql, [createur], (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des événements :', err);
        return next(err);
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Aucun événement trouvé pour ce créateur' });
      }

      res.status(200).json({ evenements: results });
    });
  } catch (error) {
    next(error);
  }
});

// Route pour récupérer un événement par ID
router.get('/evenement/:EventId', (req, res, next) => {
  const { EventId } = req.params;

  if (!EventId) {
    return res.status(400).json({ message: "L'ID est requis" });
  }

  try {
    const sql = `SELECT * FROM evenements WHERE id = ?`;
    connection.query(sql, [EventId], (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération de l\'événement :', err);
        return next(err);
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Aucun événement trouvé pour cet ID' });
      }

      res.status(200).json({ evenement: results[0] });
    });
  } catch (error) {
    next(error);
  }
});

// Route pour récupérer tous les événements
router.get('/evenements', (req, res, next) => {
  try {
    const sql = 'SELECT * FROM evenements';
    connection.query(sql, (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des événements :', err);
        return next(err);
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Aucun événement trouvé' });
      }

      res.status(200).json({ evenements: results });
    });
  } catch (error) {
    next(error);
  }
});

// Route pour récupérer les événements dont l'utilisateur connecté n'est pas le créateur
router.get('/evenements/non-createur/:userId', (req, res, next) => {
  const { userId } = req.params;

  try {
    const sql = `SELECT * FROM evenements WHERE createur != ?`;
    connection.query(sql, [userId], (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des événements :', err);
        return next(err);
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Aucun événement trouvé' });
      }

      res.status(200).json({ evenements: results });
    });
  } catch (error) {
    next(error);
  }
});

// Route pour rechercher des événements par titre ou description
router.get('/recherche', (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Le terme de recherche est requis' });
  }

  try {
    const sql = `
      SELECT * FROM evenements 
      WHERE title LIKE ? OR description LIKE ?
    `;
    const searchQuery = `%${query}%`;
    connection.query(sql, [searchQuery, searchQuery], (err, results) => {
      if (err) {
        console.error('Erreur lors de la recherche des événements :', err);
        return next(err);
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Aucun événement trouvé' });
      }

      res.status(200).json({ evenements: results });
    });
  } catch (error) {
    next(error);
  }
});


// Route pour modifier un événement
router.put('/evenements/:id', async (req, res, next) => {
  const { id } = req.params;
  const { image, privacy, amount, type, title, date, timeStart, timeEnd, seats, localisation, description } = req.body;

  if (!image || !privacy || !amount || !type || !title || !date || !timeStart || !timeEnd || !seats || !localisation || !description) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    const sql = `UPDATE evenements SET image = ?, privacy = ?, amount = ?, type = ?, title = ?, date = ?, timeStart = ?, timeEnd = ?, seats = ?, localisation = ?, description = ? WHERE id = ?`;
    connection.query(sql, [image, privacy, amount, type, title, date, timeStart, timeEnd, seats, localisation, description, id], (err, results) => {
      if (err) {
        console.error('Erreur lors de la modification de l\'evenement :', err);
        return next(err);
      }

      res.status(200).json({ message: 'evenement modifié avec succès' });
    });
  } catch (error) {
    next(error);
  }
});

// Route pour supprimer un événement
router.delete('/evenements/:id', (req, res, next) => {
  const { id } = req.params;

  try {
    const sql = `DELETE FROM evenements WHERE id = ?`;
    connection.query(sql, [id], (err, results) => {
      if (err) {
        console.error('Erreur lors de la suppression de l\'evenement :', err);
        return next(err);
      }

      res.status(200).json({ message: 'evenement supprimé avec succès' });
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir les statistiques d'un événement
router.get('/evenement/:id/statistiques', async (req, res, next) => {
  const { id } = req.params;

  try {
    const sql = `
      SELECT COUNT(r.id) AS total_subscribers, 
             DATE_FORMAT(r.reservation_date, '%Y-%m-%d') AS date, 
             COUNT(r.id) AS daily_subscriptions
      FROM reservations r
      WHERE r.evenement_id = ?
      GROUP BY DATE_FORMAT(r.reservation_date, '%Y-%m-%d')
      ORDER BY date ASC`;

    connection.query(sql, [id], (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des statistiques :', err);
        return next(err);
      }

      const totalSubscribers = results.reduce((total, row) => total + row.daily_subscriptions, 0);
      const dailySubscriptions = results.map(row => ({
        date: row.date,
        subscriptions: row.daily_subscriptions,
      }));

      res.status(200).json({ totalSubscribers, dailySubscriptions });
    });
  } catch (error) {
    next(error);
  }
});


// Route pour obtenir les réservations d'un événement spécifique
router.get('/evenement/:id/reservations', async (req, res, next) => {
  const { id } = req.params;

  try {
    const sql = `
      SELECT u.username, u.email, r.reservation_date 
      FROM reservations r 
      JOIN utilisateurs u ON r.reserveur = u.id 
      WHERE r.evenement_id = ?`;
    
    connection.query(sql, [id], (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des réservations :', err);
        return next(err);
      }

      res.status(200).json({ reservations: results });
    });
  } catch (error) {
    next(error);
  }
});


// Middleware de gestion des erreurs
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur' });
});

module.exports = router;
