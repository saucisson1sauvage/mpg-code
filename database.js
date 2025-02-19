const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('movies.db', (err) => {
    if (err) {
        console.error('Erreur lors de la connexion à la base de données :', err);
    } else {
        console.log('Connecté à la base de données SQLite.');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT,
        dateDeSortie TEXT,
        realisateur TEXT,
        note FLOAT,
        notePublic FLOAT,
        compagnie TEXT,
        description TEXT,
        origine TEXT,
        lienImage TEXT
    )`);
});

const insertMovies = () => {
    fs.readFile('movies.json', 'utf-8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier JSON :', err);
            return;
        }

        const movies = JSON.parse(data);

        const stmt = db.prepare(`INSERT INTO movies 
            (nom, dateDeSortie, realisateur, note, notePublic, compagnie, description, origine, lienImage) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        movies.forEach(movie => {
            stmt.run(
                movie.nom,
                movie.dateDeSortie,
                movie.realisateur,
                movie.note,
                movie.notePublic,
                movie.compagnie,
                movie.description,
                movie.origine,
                movie.lienImage
            );
        });

        stmt.finalize();
        console.log('Données insérées avec succès dans la base de données.');
    });
};

db.get('SELECT COUNT(*) as count FROM movies', (err, row) => {
    if (err) {
        console.error('Erreur lors de la vérification de la base de données :', err);
    } else if (row.count === 0) {
        insertMovies();
    }
});

module.exports = db;
