const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

const booksRoutes = require('./routes/books');
const usersRoutes = require('./routes/users');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => console.error("Erreur MongoDB :", err));

// Route test principale
app.get('/', (req, res) => {
    res.send('Express + MongoDB en marche');
});

// Images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes
app.use('/api/books', booksRoutes);
app.use('/api/auth', usersRoutes);

// Démarrage serveur
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});