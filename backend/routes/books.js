const express = require('express');
const router = express.Router();

const upload = require('../middleware/multer-config');
const auth = require('../middleware/auth');
const booksCtrl = require('../controllers/books')

// Ajouter un livre
router.post('/', auth, upload, booksCtrl.createBook);


// Récupérer les livres les mieux notés
router.get('/bestrating', booksCtrl.bestRated);


// Récupérer tous les livres
router.get('/', booksCtrl.getAllBooks);


// Récupérer un livre par ID
router.get('/:id', booksCtrl.getBookId);

// Mettre à jour un livre
router.put('/:id', auth, upload, booksCtrl.updateBook);


// Supprimer un livre
router.delete('/:id', auth, booksCtrl.delBook);

// Ajouter une note pour un livre
router.post('/:id/rating', auth, booksCtrl.rateBook);


module.exports = router;