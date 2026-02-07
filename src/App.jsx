
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


    const [startTime, setStartTime] = useState(null);

    // Leaderboard State
    const [topScores, setTopScores] = useState(() => {
        try {
            const saved = localStorage.getItem('grammarQuiz_leaderboard');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse leaderboard", e);
            return [];
        }
    });

    // Daily Challenge State
    const [dailyStats, setDailyStats] = useState(() => {
        try {
            const saved = localStorage.getItem('grammarQuiz_dailyStats');
            return saved ? JSON.parse(saved) : { streak: 0, lastPlayed: null };
        } catch (e) {
            console.error("Failed to parse dailyStats", e);
            return { streak: 0, lastPlayed: null };
        }
    });

    // Audio State
    const [isMuted, setIsMuted] = useState(() => {
        return localStorage.getItem('grammarQuiz_isMuted') === 'true';
    });

    const playClick = () => {
        if (!isMuted) {
            const audio = new Audio('click.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.error("Audio play failed", e));
        }
    };

    const toggleMute = () => {
        const newState = !isMuted;
        setIsMuted(newState);
        localStorage.setItem('grammarQuiz_isMuted', newState);
        playClick();
    };

    useEffect(() => {
        const bgMusic = document.getElementById('bg-music');
        if (bgMusic) {
            bgMusic.volume = 0.2;
            if (isMuted) {
                bgMusic.pause();
            } else {
                // Browsers block autoplay, so this might need user interaction first
                // We'll trust the Start button to kick it off if it's not playing
                const playPromise = bgMusic.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Autoplay prevented:", error);
                    });
                }
            }
        }
    }, [isMuted]);

    useEffect(() => {
        // Randomize questions on mount
        const shuffled = [...grammarData].sort(() => 0.5 - Math.random());
        setQuestions(shuffled);
    }, []);

    const handleStart = () => {
        playClick();
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
        playClick();
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
            <audio id="bg-music" loop src="music.mp3" />
            {currentScreen === 'start' && <StartScreen onStart={handleStart} onDailyStart={handleDailyStart} dailyStats={dailyStats} topScores={topScores} isMuted={isMuted} onToggleMute={toggleMute} playClick={playClick} />}
            {currentScreen === 'quiz' && (
                <QuizScreen
                    questionData={questions[currentQuestionIndex]}
                    questionIndex={currentQuestionIndex}
                    totalQuestions={questions.length}
                    answerHistory={answerHistory}
                    onBack={() => { playClick(); setCurrentScreen('start'); }}
                    onComplete={handleQuizComplete}
                    playClick={playClick}
                />
            )}
            {currentScreen === 'result' && (
                <ResultScreen
                    score={score}
                    total={questions.length}
                    onRestart={handleRestart}
                    playClick={playClick}
                />
            )}
            {currentScreen === 'zen' && (
                <ZenScreen onHome={handleRestart} playClick={playClick} />
            )}
        </div>
    );
}

export default App;
