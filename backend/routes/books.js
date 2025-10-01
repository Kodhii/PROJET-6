const express = require('express');
const Book = require('../models/book');
const upload = require('../middleware/multer-config');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const router = express.Router();

// Ajouter un livre
router.post('/', upload, async (req, res) => {
    try {
        const bookData = req.body.book ? JSON.parse(req.body.book) : req.body;

        const file = req.files.find(f => f.fieldname === 'image');

        let imageUrl = null;

        if (req.files && req.files.length > 0) {
            const file = req.files.find(f => f.fieldname === 'image');
            if (file) {
                const webpFilename = file.filename.split('.')[0] + '.webp';
                const webpPath = path.join(__dirname, '../images', webpFilename);

                await sharp(file.path)
                    .webp({ quality: 80 })
                    .toFile(webpPath);

                fs.unlinkSync(file.path);

                imageUrl = `${req.protocol}://${req.get('host')}/images/${webpFilename}`;
            }
        }

        const book = new Book({
            userId: bookData.userId,
            title: bookData.title,
            author: bookData.author,
            year: bookData.year,
            genre: bookData.genre,
            imageUrl: imageUrl,
            ratings: bookData.ratings || [],
            averageRating: bookData.averageRating || 0
        });

        await book.save();
        res.status(201).json({ message: 'Livre ajouté avec succès', book: book.toJSON() });
    } catch (err) {
        console.error('ERROR in POST /api/books:', err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

// Récupérer les livres les mieux notés
router.get('/bestrating', async (req, res) => {
    try {
        const books = await Book.find().sort({ averageRating: -1 }).limit(3);
        res.status(200).json(books.map(b => b.toJSON()));
    } catch (err) {
        console.error('ERROR in GET /api/books/bestrating:', err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

// Récupérer tous les livres
router.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json(books.map(b => b.toJSON()));
    } catch (err) {
        console.error('ERROR in GET /api/books:', err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

// Récupérer un livre par ID
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
        res.status(200).json(book.toJSON());
    } catch (err) {
        console.error('ERROR in GET /api/books/:id:', err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

// Mettre à jour un livre
router.put('/:id', upload, async (req, res) => {
    try {
        const bookData = req.body.book ? JSON.parse(req.body.book) : req.body;
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Livre non trouvé' });

        const updateFields = {
            title: bookData.title,
            author: bookData.author,
            year: bookData.year,
            genre: bookData.genre,
        };

        if (req.files && req.files.length > 0) {
            const file = req.files.find(f => f.fieldname === 'image');
            if (file) {
                if (book.imageUrl) {
                    const oldFilename = book.imageUrl.split('/images/')[1];
                    const oldFilePath = path.join(__dirname, '../images', oldFilename);
                    fs.unlink(oldFilePath, (err) => {
                        if (err) console.error('Erreur suppression ancienne image:', err);
                    });
                }

                const webpFilename = file.filename.split('.')[0] + '.webp';
                const webpPath = path.join(__dirname, '../images', webpFilename);

                await sharp(file.path)
                    .webp({ quality: 80 })
                    .toFile(webpPath);

                fs.unlinkSync(file.path);

                updateFields.imageUrl = `${req.protocol}://${req.get('host')}/images/${webpFilename}`;
            }
        }

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true }
        );

        res.status(200).json({ message: 'Livre mis à jour avec succès', book: updatedBook.toJSON() });
    } catch (err) {
        console.error('ERROR in PUT /api/books/:id:', err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

// Supprimer un livre
router.delete('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Livre non trouvé' });

        if (book.imageUrl) {
            const filename = book.imageUrl.split('/images/')[1];
            const filepath = path.join(__dirname, '../images', filename);
            fs.unlink(filepath, (err) => { if (err) console.error('Erreur suppression image:', err); });
        }

        await Book.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Livre supprimé avec succès' });
    } catch (err) {
        console.error('ERROR in DELETE /api/books/:id:', err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

// Ajouter ou mettre à jour une note pour un livre
router.post('/:id/rating', async (req, res) => {
    try {
        const { userId, rating } = req.body;

        if (!userId || rating == null) return res.status(400).json({ message: 'userId et rating sont requis' });

        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Livre non trouvé' });

        const existingRatingIndex = book.ratings.findIndex(r => r.userId.toString() === userId);
        if (existingRatingIndex !== -1) {
            book.ratings[existingRatingIndex].grade = parseInt(rating, 10);
        } else {
            book.ratings.push({ userId, grade: parseInt(rating, 10) });
        }

        const total = book.ratings.reduce((sum, r) => sum + r.grade, 0);
        book.averageRating = total / book.ratings.length;

        await book.save();

        res.status(200).json(book.toJSON());
    } catch (err) {
        console.error('ERROR in POST /api/books/:id/rating:', err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

module.exports = router;