const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());

const readDatabase = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const writeDatabase = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

app.get('/api/questions', (req, res) => res.json(readDatabase()));

app.post('/api/questions', (req, res) => {
    const questions = readDatabase();
    const newQ = { id: Date.now(), ...req.body, difficulty: parseInt(req.body.difficulty) };
    questions.push(newQ);
    writeDatabase(questions);
    res.status(201).json(newQ);
});

// Ruta NOUĂ pentru editare
app.put('/api/questions/:id', (req, res) => {
    let questions = readDatabase();
    const id = parseInt(req.params.id);
    const index = questions.findIndex(q => q.id === id);
    if (index !== -1) {
        questions[index] = { id, ...req.body, difficulty: parseInt(req.body.difficulty) };
        writeDatabase(questions);
        res.json(questions[index]);
    } else {
        res.status(404).json({ error: "Întrebarea nu a fost găsită" });
    }
});

app.delete('/api/questions/:id', (req, res) => {
    let questions = readDatabase();
    questions = questions.filter(q => q.id !== parseInt(req.params.id));
    writeDatabase(questions);
    res.json({ message: 'Întrebare ștearsă' });
});

app.listen(PORT, () => console.log(`Backend rulând pe http://localhost:${PORT}`));