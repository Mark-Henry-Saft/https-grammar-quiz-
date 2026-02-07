
import React, { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import ZenScreen from './components/ZenScreen';
import grammarData from './grammar_data.json';

import clickSound from './assets/sounds/click.mp3';
import musicSound from './assets/sounds/music.mp3';
import correct1 from './assets/sounds/correct_1.mp3';
import correct2 from './assets/sounds/correct_2.mp3';
import correct3 from './assets/sounds/correct_3.mp3';

function App() {
    const [currentScreen, setCurrentScreen] = useState('start');
    const [score, setScore] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [answerHistory, setAnswerHistory] = useState([]);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [isDailyMode, setIsDailyMode] = useState(false);

    const [startTime, setStartTime] = useState(null);

    // Leaderboard State
    const [topScores, setTopScores] = useState(() => {
        try {
            const saved = localStorage.getItem('grammarQuiz_leaderboard');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { console.error(e); return []; }
    });

    const [dailyStats, setDailyStats] = useState(() => {
        try {
            const saved = localStorage.getItem('grammarQuiz_dailyStats');
            return saved ? JSON.parse(saved) : { streak: 0, lastPlayed: null };
        } catch (e) { console.error(e); return { streak: 0, lastPlayed: null }; }
    });

    // Audio State
    const [isMuted, setIsMuted] = useState(() => {
        return localStorage.getItem('grammarQuiz_isMuted') === 'true';
    });

    const playClick = () => {
        if (!isMuted) {
            const audio = new Audio(clickSound);
            audio.volume = 0.4;
            audio.play().catch(e => console.error("Audio play failed", e));
        }
    };

    const playCorrect = () => {
        if (!isMuted) {
            const sounds = [correct1, correct2, correct3];
            const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
            const audio = new Audio(randomSound);
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

    // Manage Background Music & Intensity
    useEffect(() => {
        const bgMusic = document.getElementById('bg-music');
        if (bgMusic) {
            bgMusic.volume = 0.1;

            // Dynamic Intensity based on streak (cap at 1.5x speed)
            // 0 streak = 1.0, 5 streak = 1.1, 10 streak = 1.2
            const speed = 1 + Math.min(currentStreak, 20) * 0.02;
            bgMusic.playbackRate = speed;

            if (isMuted) {
                bgMusic.pause();
            } else {
                // Autoplay handled by startMusic
            }
        }
    }, [isMuted, currentStreak]);

    const startMusic = () => {
        if (!isMuted) {
            const bgMusic = document.getElementById('bg-music');
            if (bgMusic) {
                bgMusic.play().catch(e => console.log("Music autoplay prevented", e));
            }
        }
    };

    useEffect(() => {
        const shuffled = [...grammarData].sort(() => 0.5 - Math.random());
        setQuestions(shuffled);
    }, []);

    const [totalTimeRemaining, setTotalTimeRemaining] = useState(0);

    const handleStart = () => {
        playClick();
        startMusic();
        setIsDailyMode(false);
        setCurrentScreen('quiz');
        setScore(0);
        setCurrentStreak(0);
        setCurrentQuestionIndex(0);
        setAnswerHistory([]);
        setTotalTimeRemaining(0);
        setStartTime(Date.now());
        const shuffled = [...grammarData].sort(() => 0.5 - Math.random());
        setQuestions(shuffled);
    };

    const handleDailyStart = () => {
        playClick();
        startMusic();
        const today = new Date().toDateString();

        if (dailyStats.lastPlayed === today) {
            alert("You've already completed today's challenge! Come back tomorrow.");
            return;
        }

        setIsDailyMode(true);
        setCurrentScreen('quiz');
        setScore(0);
        setCurrentStreak(0);
        setCurrentQuestionIndex(0);
        setAnswerHistory([]);
        setTotalTimeRemaining(0);
        setStartTime(Date.now());

        const shuffled = [...grammarData].sort(() => 0.5 - Math.random()).slice(0, 5);
        setQuestions(shuffled);
    };

    const handleQuizComplete = (isCorrect, timeRemaining = 0) => {
        // This is called AFTER the user clicks Next or Time runs out
        // However, we want streak to update IMMEDATELY upon answering for music purposes.
        // QuizScreen will handle the immediate feedback. 
        // Here we just aggregate valid score for the end.

        if (isCorrect) {
            setScore(s => s + 1);
            setCurrentStreak(s => s + 1);
            setTotalTimeRemaining(t => t + (timeRemaining || 0));
        } else {
            setCurrentStreak(0);
        }

        setAnswerHistory(prev => [...prev, isCorrect]);

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

                let newDailyStreak = dailyStats.streak;
                if (dailyStats.lastPlayed === yesterdayStr) {
                    newDailyStreak += 1;
                } else if (dailyStats.lastPlayed !== today) {
                    newDailyStreak = 1;
                }

                const newStats = { streak: newDailyStreak, lastPlayed: today };
                setDailyStats(newStats);
                localStorage.setItem('grammarQuiz_dailyStats', JSON.stringify(newStats));
            }
            setCurrentScreen('result');
        }
    };

    const handleRestart = () => {
        setCurrentScreen('start');
    };

    const handleUpdateLeaderboard = (newEntry) => {
        const updated = [...topScores, newEntry]
            .sort((a, b) => b.score - a.score || b.time - a.time)
            .slice(0, 5);
        setTopScores(updated);
        localStorage.setItem('grammarQuiz_leaderboard', JSON.stringify(updated));
    };

    if (questions.length === 0) return null;

    return (
        <div className="antialiased font-display min-h-screen flex items-center justify-center p-4">
            <div className="snake-border w-full max-w-md">
                <audio id="bg-music" loop src={musicSound} />
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
                        playCorrect={playCorrect}
                        currentStreak={currentStreak}
                    />
                )}
                {currentScreen === 'result' && (
                    <ResultScreen
                        score={score}
                        total={questions.length}
                        totalTimeRemaining={totalTimeRemaining}
                        topScores={topScores}
                        onUpdateLeaderboard={handleUpdateLeaderboard}
                        onRestart={handleRestart}
                        playClick={playClick}
                        onHome={() => setCurrentScreen('start')}
                        onZen={() => setCurrentScreen('zen')}
                    />
                )}
                {currentScreen === 'zen' && (
                    <ZenScreen onHome={handleRestart} playClick={playClick} />
                )}
                <div className="fixed bottom-1 right-1 text-xs text-slate-300 pointer-events-none opacity-50">v2.5 (Legendary)</div>
            </div>
        </div>
    );
}

export default App;
