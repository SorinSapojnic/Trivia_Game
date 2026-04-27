require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 1. Conexiunea la MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectat cu succes la MongoDB Atlas (Cloud)!'))
    .catch(err => console.error('Eroare la conectarea MongoDB:', err));

// 2. Definirea Schemei pentru o Întrebare
const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    wrongAnswers: { type: [String], required: true },
    difficulty: { type: Number, required: true }
});

// Modelul cu care vom interacționa
const Question = mongoose.model('Question', questionSchema);

// --- RUTE API RESTful ---

// GET: Preluarea tuturor întrebărilor
app.get('/api/questions', async (req, res) => {
    try {
        const questions = await Question.find();
        // MongoDB folosește "_id". Mapăm rezultatele pentru a trimite "id" simplu către frontend
        const formatted = questions.map(q => ({
            id: q._id.toString(),
            question: q.question,
            correctAnswer: q.correctAnswer,
            wrongAnswers: q.wrongAnswers,
            difficulty: q.difficulty
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: "Eroare la preluarea datelor" });
    }
});

// POST: Adăugarea unei întrebări noi
app.post('/api/questions', async (req, res) => {
    try {
        const newQuestion = new Question({
            question: req.body.question,
            correctAnswer: req.body.correctAnswer,
            wrongAnswers: req.body.wrongAnswers,
            difficulty: parseInt(req.body.difficulty)
        });
        const savedQ = await newQuestion.save();
        res.status(201).json({ ...savedQ._doc, id: savedQ._id.toString() });
    } catch (error) {
        res.status(500).json({ error: "Eroare la salvarea întrebării" });
    }
});

// PUT: Editarea unei întrebări
app.put('/api/questions/:id', async (req, res) => {
    try {
        const updatedQ = await Question.findByIdAndUpdate(
            req.params.id, 
            {
                question: req.body.question,
                correctAnswer: req.body.correctAnswer,
                wrongAnswers: req.body.wrongAnswers,
                difficulty: parseInt(req.body.difficulty)
            }, 
            { new: true } // Returnează documentul actualizat
        );
        res.json(updatedQ);
    } catch (error) {
        res.status(500).json({ error: "Eroare la editare" });
    }
});

// DELETE: Ștergerea unei întrebări
app.delete('/api/questions/:id', async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.json({ message: 'Întrebare ștearsă din Cloud' });
    } catch (error) {
        res.status(500).json({ error: "Eroare la ștergere" });
    }
});

app.listen(PORT, () => console.log(`Serverul rulează pe http://localhost:${PORT}`));