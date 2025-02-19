const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = 3332;

app.use(cors());
app.use(express.json());

app.get("/movies", (req, res) => {
    const { origine, niveau, minNote, maxNote } = req.query;

    let query = "SELECT * FROM movies WHERE 1=1";
    const params = [];

    if (origine && origine !== "TOUS") {
        query += " AND origine = ?";
        params.push(origine);
    }

    if (niveau) {
        if (niveau === "Classic") {
            query += " AND note >= ?";
            params.push(4); // Assuming "Classic" means note >= 4
        } else if (niveau === "Navet") {
            query += " AND note <= ?";
            params.push(2); // Assuming "Navet" means note <= 2
        } else if (niveau === "Standard") {
            query += " AND note > ? AND note < ?";
            params.push(2, 4); // Assuming "Standard" means 2 < note < 4
        }
    }

    if (minNote) {
        query += " AND note >= ?";
        params.push(minNote);
    }

    if (maxNote) {
        query += " AND note <= ?";
        params.push(maxNote);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post("/movies", (req, res) => {
    const { nom, dateDeSortie, realisateur, note, notePublic, compagnie, description, origine, lienImage } = req.body;

    const stmt = db.prepare(`INSERT INTO movies 
        (nom, dateDeSortie, realisateur, note, notePublic, compagnie, description, origine, lienImage) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    stmt.run(nom, dateDeSortie, realisateur, note, notePublic, compagnie, description, origine, lienImage, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });

    stmt.finalize();
});

app.delete("/movies/:id", (req, res) => {
    const movieId = req.params.id;

    db.run("DELETE FROM movies WHERE id = ?", [movieId], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ message: "Film non trouvé" });
        } else {
            res.json({ message: "Film supprimé avec succès" });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});