const API_URL = 'http://localhost:3000/api/questions';

class TriviaApp {
    constructor() {
        this.allQuestions = [];
        this.testQuestions = []; // Cele 10 selectate
        this.currentIndex = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.currentDifficulty = 1;

        this.views = {
            menu: document.getElementById('view-menu'),
            game: document.getElementById('view-game'),
            gameOver: document.getElementById('view-game-over'),
            admin: document.getElementById('view-admin')
        };

        this.highScore = localStorage.getItem('triviaHighScore') || 0;

        this.bindEvents();
    }

    switchView(viewName) {
        Object.values(this.views).forEach(v => v.classList.remove('active'));
        this.views[viewName].classList.add('active');
    }

    async fetchQuestions() {
        const response = await fetch(API_URL);
        this.allQuestions = await response.json();
    }

    // --- LOGICA DE JOC ---
    async startGame(difficulty) {
        await this.fetchQuestions();
        this.currentDifficulty = parseInt(difficulty);
        
        // Filtrăm întrebările pe dificultate
        let pool = this.allQuestions.filter(q => q.difficulty === this.currentDifficulty);
        
        // Amestecăm și extragem exact 10
        pool.sort(() => Math.random() - 0.5);
        this.testQuestions = pool.slice(0, 10);
        
        this.currentIndex = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        
        this.switchView('game');
        this.renderQuestion();
    }

    renderQuestion() {
        const q = this.testQuestions[this.currentIndex];
        
        document.getElementById('q-counter').textContent = `Întrebarea ${this.currentIndex + 1} / 10`;
        document.getElementById('diff-text').textContent = `Dificultate: ${this.currentDifficulty}`;
        document.getElementById('question-text').textContent = q.question;
        
        const container = document.getElementById('answers-container');
        container.innerHTML = '';
        
        // Ascundem butonul "Next" la fiecare întrebare nouă
        document.getElementById('btn-next-q').classList.add('hidden');

        let answers = [q.correctAnswer, ...q.wrongAnswers];
        answers.sort(() => Math.random() - 0.5); // Amestecăm răspunsurile mereu

        answers.forEach(ans => {
            const btn = document.createElement('button');
            btn.className = 'ans-btn';
            btn.textContent = ans;
            // Când apasă, verificăm răspunsul și transmitem și butonul apăsat
            btn.onclick = (e) => this.handleAnswer(ans, e.target);
            container.appendChild(btn);
        });
    }

    handleAnswer(selected, clickedBtn) {
        const q = this.testQuestions[this.currentIndex];
        const allButtons = document.querySelectorAll('.ans-btn');
        
        // Dezactivăm toate butoanele să nu mai poată apăsa a doua oară
        allButtons.forEach(btn => btn.disabled = true);

        if (selected === q.correctAnswer) {
            clickedBtn.classList.add('ans-correct');
            this.correctCount++;
        } else {
            clickedBtn.classList.add('ans-wrong');
            this.wrongCount++;
            // Găsim butonul cu răspunsul corect și îl colorăm verde
            allButtons.forEach(btn => {
                if(btn.textContent === q.correctAnswer) {
                    btn.classList.add('ans-correct');
                }
            });
        }

        // Arătăm butonul de "Next"
        document.getElementById('btn-next-q').classList.remove('hidden');
    }

    nextQuestion() {
        this.currentIndex++;
        if (this.currentIndex < this.testQuestions.length) {
            this.renderQuestion();
        } else {
            this.endGame();
        }
    }

    endGame() {
        // High Score logic
        if (this.correctCount > this.highScore) {
            this.highScore = this.correctCount;
            localStorage.setItem('triviaHighScore', this.highScore);
        }

        document.getElementById('final-score').textContent = this.correctCount;
        document.getElementById('correct-count').textContent = this.correctCount;
        document.getElementById('wrong-count').textContent = this.wrongCount;
        document.getElementById('high-score-display').textContent = this.highScore;

        const nextLevelBtn = document.getElementById('btn-next-level');
        // Dacă are 10/10 și nu e la ultimul nivel
        if (this.correctCount === 10 && this.currentDifficulty < 3) {
            nextLevelBtn.classList.remove('hidden');
            nextLevelBtn.onclick = () => {
                document.getElementById('select-diff').value = this.currentDifficulty + 1;
                this.startGame(this.currentDifficulty + 1);
            };
        } else {
            nextLevelBtn.classList.add('hidden');
        }

        this.switchView('gameOver');
    }

    // --- MODUL ADMIN ---
    async openAdmin() {
        const password = prompt("Introduceți parola pentru Modul Profesor:");
        if (password === "1111") {
            await this.fetchQuestions();
            this.renderAdminList();
            this.switchView('admin');
        } else if (password !== null) {
            alert("Parolă incorectă!");
        }
    }

    renderAdminList() {
        const list = document.getElementById('admin-list');
        list.innerHTML = '';
        // Afișăm în ordinea nivelului
        const sorted = [...this.allQuestions].sort((a,b) => a.difficulty - b.difficulty);
        
        sorted.forEach(q => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span style="flex:1;"><strong>[Niv ${q.difficulty}]</strong> ${q.question}</span>
                <div class="admin-actions">
                    <button class="btn-edit-text" onclick="app.populateEditForm('${q.id}')">Editează</button>
                    <button class="btn-danger-text" onclick="app.deleteQuestion('${q.id}')">Șterge</button>
                </div>
            `;
            list.appendChild(li);
        });
    }

    populateEditForm(id) {
        const q = this.allQuestions.find(x => x.id === id);
        if(!q) return;
        
        document.getElementById('form-title').textContent = "Editează Întrebarea";
        document.getElementById('edit-id').value = q.id;
        document.getElementById('add-q').value = q.question;
        document.getElementById('add-correct').value = q.correctAnswer;
        document.getElementById('add-w1').value = q.wrongAnswers[0];
        document.getElementById('add-w2').value = q.wrongAnswers[1];
        document.getElementById('add-w3').value = q.wrongAnswers[2];
        document.getElementById('add-diff').value = q.difficulty;
        
        document.getElementById('btn-submit-admin').textContent = "Actualizează";
        document.getElementById('btn-cancel-edit').classList.remove('hidden');
        
        // Scroll sus spre formular
        document.querySelector('.admin-form').scrollIntoView({ behavior: 'smooth' });
    }

    cancelEdit() {
        document.getElementById('admin-form').reset();
        document.getElementById('form-title').textContent = "Adaugă Întrebare Nouă";
        document.getElementById('edit-id').value = "";
        document.getElementById('btn-submit-admin').textContent = "Salvează";
        document.getElementById('btn-cancel-edit').classList.add('hidden');
    }

    async handleAdminSubmit(e) {
        e.preventDefault();
        const editId = document.getElementById('edit-id').value;
        
        const payload = {
            question: document.getElementById('add-q').value,
            correctAnswer: document.getElementById('add-correct').value,
            wrongAnswers: [
                document.getElementById('add-w1').value,
                document.getElementById('add-w2').value,
                document.getElementById('add-w3').value
            ],
            difficulty: document.getElementById('add-diff').value
        };

        if (editId) {
            // Mod Editare (PUT)
            await fetch(`${API_URL}/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            this.cancelEdit(); // Reset form
        } else {
            // Mod Adăugare (POST)
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            e.target.reset();
        }
        
        await this.fetchQuestions();
        this.renderAdminList();
    }

    async deleteQuestion(id) {
        if(confirm("Ești sigur că vrei să ștergi această întrebare?")) {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await this.fetchQuestions();
            this.renderAdminList();
        }
    }

    bindEvents() {
        // Meniu principal
        document.getElementById('btn-start').onclick = () => {
            const diff = document.getElementById('select-diff').value;
            this.startGame(diff);
        };
        document.getElementById('btn-admin-enter').onclick = () => this.openAdmin();
        
        // În timpul jocului
        document.getElementById('btn-next-q').onclick = () => this.nextQuestion();
        document.getElementById('btn-home-game').onclick = () => this.switchView('menu');
        
        // După joc
        document.getElementById('btn-restart').onclick = () => {
            const diff = document.getElementById('select-diff').value;
            this.startGame(diff);
        };
        document.getElementById('btn-back').onclick = () => this.switchView('menu');
        
        // Admin
        document.getElementById('btn-exit-admin').onclick = () => {
            this.cancelEdit();
            this.switchView('menu');
        };
        document.getElementById('admin-form').onsubmit = (e) => this.handleAdminSubmit(e);
        document.getElementById('btn-cancel-edit').onclick = () => this.cancelEdit();
    }
}

const app = new TriviaApp();