
import React, { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import ZenScreen from './components/ZenScreen';
import grammarData from './grammar_data.json';

function App() {
    const [currentScreen, setCurrentScreen] = useState('start');
    const [score, setScore] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [answerHistory, setAnswerHistory] = useState([]); // Array of true/false
    const [isDailyMode, setIsDailyMode] = useState(false);


    // Daily Challenge State
    const [dailyStats, setDailyStats] = useState(() => {
        const saved = localStorage.getItem('grammarQuiz_dailyStats');
        return saved ? JSON.parse(saved) : { streak: 0, lastPlayed: null };
    });

    useEffect(() => {
        // Randomize questions on mount
        const shuffled = [...grammarData].sort(() => 0.5 - Math.random());
        setQuestions(shuffled);
    }, []);

    const handleStart = () => {
        setIsDailyMode(false);
        setCurrentScreen('quiz');
        setScore(0);
        setCurrentQuestionIndex(0);
        setAnswerHistory([]);
        setStartTime(Date.now());
        // Start with a fresh shuffle if needed, but on-mount is usually fine for a session
        const shuffled = [...grammarData].sort(() => 0.5 - Math.random());
        setQuestions(shuffled);
    };

    const handleDailyStart = () => {
        const today = new Date().toDateString();

        // Check if already played today is handled in UI, but safety check here
        if (dailyStats.lastPlayed === today) {
            alert("You've already completed today's challenge! Come back tomorrow.");
            return;
        }

        setIsDailyMode(true);
        setCurrentScreen('quiz');
        setScore(0);
        setCurrentQuestionIndex(0);
        setAnswerHistory([]);
        setStartTime(Date.now());

        // Select 5 random questions for daily challenge
        const shuffled = [...grammarData].sort(() => 0.5 - Math.random()).slice(0, 5);
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
            // Quiz Finished
            if (isDailyMode) {
                const today = new Date().toDateString();
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toDateString();

                let newStreak = dailyStats.streak;
                // If last played was yesterday, increment. If today, valid. Else reset.
                // Actually, if we are here, we just finished.
                // If lastPlayed was yesterday, streak++. If before yesterday, streak=1.

                if (dailyStats.lastPlayed === yesterdayStr) {
                    newStreak += 1;
                } else if (dailyStats.lastPlayed !== today) {
                    newStreak = 1;
                }

                const newStats = { streak: newStreak, lastPlayed: today };
                setDailyStats(newStats);
                localStorage.setItem('grammarQuiz_dailyStats', JSON.stringify(newStats));
            }
            setCurrentScreen('result');
        }
    };

    const handleRestart = () => {
        setCurrentScreen('start');
    };

    if (questions.length === 0) return null; // Wait for shuffle

    return (
        <div className="antialiased font-display">
            {currentScreen === 'start' && <StartScreen onStart={handleStart} onDailyStart={handleDailyStart} dailyStats={dailyStats} topScores={topScores} />}
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
            {currentScreen === 'zen' && (
                <ZenScreen onHome={handleRestart} />
            )}
        </div>
    );
}

export default App;
