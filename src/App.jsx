import React, { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import ZenScreen from './components/ZenScreen';
import grammarData from './grammar_data.json';
import CheckpointScreen from './components/CheckpointScreen';
import { Heart } from 'lucide-react';

import clickSound from './assets/sounds/click_v2.wav';
// import musicSound from './assets/sounds/music.mp3';
import correctSound from './assets/sounds/correct_v2.wav';
import incorrectSound from './assets/sounds/incorrect_v2.wav';
import fanfareSound from './assets/sounds/fanfare_v2.wav';

function App() {
    const [currentScreen, setCurrentScreen] = useState('start');
    const [score, setScore] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [answerHistory, setAnswerHistory] = useState([]);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [isDailyMode, setIsDailyMode] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [totalTimeRemaining, setTotalTimeRemaining] = useState(0);
    const [isSupporter, setIsSupporter] = useState(() => localStorage.getItem('grammarQuiz_isSupporter') === 'true');

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
            console.log("🔊 Playing Click Sound (click_v2.wav)");
            const audio = new Audio(clickSound);
            audio.volume = 0.7;
            audio.play().catch(e => console.error("Audio play failed", e));
        }
    };

    const playCorrect = () => {
        if (!isMuted) {
            console.log("🔊 Playing Correct Sound (correct_v2.wav)");
            const audio = new Audio(correctSound);
            audio.volume = 0.7;
            audio.play().catch(e => console.error("Audio play failed", e));
        }
    };

    const playIncorrect = () => {
        if (!isMuted) {
            console.log("🔊 Playing Incorrect Sound (incorrect_v2.wav)");
            const audio = new Audio(incorrectSound);
            audio.volume = 0.7;
            audio.play().catch(e => console.error("Audio play failed", e));
        }
    };

    const playFanfare = () => {
        if (!isMuted) {
            console.log("🔊 Playing Fanfare Sound (fanfare_v2.wav)");
            const audio = new Audio(fanfareSound);
            audio.volume = 0.7;
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
            const speed = 1 + Math.min(currentStreak, 20) * 0.02;
            bgMusic.playbackRate = speed;
            if (isMuted) {
                bgMusic.pause();
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

    // Question Filtering
    const [legendaryFactoids, setLegendaryFactoids] = useState([]);

    const getFilteredQuestions = (count = null) => {
        const standards = grammarData.filter(q => !q.isLegendary && (!q.isElite || isSupporter));
        const shuffled = [...standards].sort(() => 0.5 - Math.random());
        return count ? shuffled.slice(0, count) : shuffled;
    };

    useEffect(() => {
        setQuestions(getFilteredQuestions());
        setLegendaryFactoids(grammarData.filter(q => q.isLegendary));
    }, [isSupporter]);

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
        setQuestions(getFilteredQuestions());
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
        setQuestions(getFilteredQuestions(5));
    };

    const handleQuizComplete = (isCorrect, timeRemaining = 0) => {
        if (isCorrect) {
            setScore(s => s + 1);
            setCurrentStreak(s => s + 1);
            setTotalTimeRemaining(t => t + (timeRemaining || 0));
        } else {
            setCurrentStreak(0);
        }
        setAnswerHistory(prev => [...prev, isCorrect]);
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex > 0 && nextIndex % 10 === 0 && nextIndex < questions.length) {
            setCurrentScreen('checkpoint');
            return;
        }
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
        } else {
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
                {/* <audio id="bg-music" loop src={musicSound} /> */}
                {currentScreen === 'start' && <StartScreen onStart={handleStart} onDailyStart={handleDailyStart} dailyStats={dailyStats} topScores={topScores} isMuted={isMuted} onToggleMute={toggleMute} playClick={playClick} isSupporter={isSupporter} />}
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
                        playIncorrect={playIncorrect}
                        playFanfare={playFanfare}
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
                        isSupporter={isSupporter}
                        setIsSupporter={setIsSupporter}
                    />
                )}
                {currentScreen === 'zen' && (
                    <ZenScreen onHome={handleRestart} playClick={playClick} />
                )}
                {currentScreen === 'checkpoint' && (
                    <CheckpointScreen
                        level={Math.floor((currentQuestionIndex + 1) / 10)}
                        score={score}
                        totalQuestions={currentQuestionIndex + 1}
                        playClick={playClick}
                        factoid={legendaryFactoids[(Math.floor((currentQuestionIndex + 1) / 10) - 1) % legendaryFactoids.length]}
                        onContinue={() => {
                            setCurrentQuestionIndex(prev => prev + 1);
                            setCurrentScreen('quiz');
                        }}
                    />
                )}
                <div className="fixed bottom-1 left-1 flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
                    <div className="relative">
                        <Heart
                            size={14}
                            className={`${dailyStats.streak >= 7 ? 'text-rose-500 fill-rose-500 animate-pulse drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]' : 'text-slate-400'}`}
                        />
                        {dailyStats.streak >= 7 && (
                            <div className="absolute inset-0 bg-rose-400 blur-sm rounded-full opacity-30 animate-ping"></div>
                        )}
                    </div>
                </div>
                <div className="fixed bottom-1 right-1 text-xs text-slate-300 pointer-events-none opacity-50">v2.7 (Arsenal)</div>
            </div>
        </div>
    );
}

export default App;
