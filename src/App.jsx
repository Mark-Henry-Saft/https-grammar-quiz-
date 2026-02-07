
import React, { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import grammarData from './grammar_data.json';

function App() {
    const [currentScreen, setCurrentScreen] = useState('start');
    const [score, setScore] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [answerHistory, setAnswerHistory] = useState([]); // Array of true/false

    useEffect(() => {
        // Randomize questions on mount
        const shuffled = [...grammarData].sort(() => 0.5 - Math.random());
        setQuestions(shuffled);
    }, []);

    const handleStart = () => {
        setCurrentScreen('quiz');
        setScore(0);
        setCurrentQuestionIndex(0);
        setAnswerHistory([]);
        // Start with a fresh shuffle if needed, but on-mount is usually fine for a session
        const shuffled = [...grammarData].sort(() => 0.5 - Math.random());
        setQuestions(shuffled);
    };

    const handleQuizComplete = (isCorrect) => {
        if (isCorrect) setScore(s => s + 1);
        setAnswerHistory(prev => [...prev, isCorrect]);

        // Slight delay or just state change management can go here, but QuizScreen calls this on "Next"
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
        } else {
            setCurrentScreen('result');
        }
    };

    const handleRestart = () => {
        setCurrentScreen('start');
    };

    if (questions.length === 0) return null; // Wait for shuffle

    return (
        <div className="antialiased font-display">
            {currentScreen === 'start' && <StartScreen onStart={handleStart} />}
            {currentScreen === 'quiz' && (
                <QuizScreen
                    questionData={questions[currentQuestionIndex]}
                    questionIndex={currentQuestionIndex}
                    totalQuestions={questions.length}
                    answerHistory={answerHistory}
                    onBack={() => setCurrentScreen('start')}
                    onComplete={handleQuizComplete}
                />
            )}
            {currentScreen === 'result' && (
                <ResultScreen
                    score={score}
                    total={questions.length}
                    onRestart={handleRestart}
                />
            )}
        </div>
    );
}

export default App;
