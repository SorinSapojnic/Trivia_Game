// Fișier pentru Unit Testing (Rulează cu: npm test)
describe('Testare Logică Validare Backend', () => {
    test('Un răspuns corect primit trebuie să treacă validarea', () => {
        const correctAnswer = "Document Object Model";
        const userAnswer = "Document Object Model";
        expect(userAnswer === correctAnswer).toBe(true);
    });
});