# GRAMMAR MASTERY QUIZ - CODEBASE EXPORT


## FILE: src/App.jsx

import React, { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import ZenScreen from './components/ZenScreen';
import grammarData from './grammar_data.json';
import CheckpointScreen from './components/CheckpointScreen';
import { Heart } from 'lucide-react';

import clickSound from './assets/sounds/click.mp3';
import musicSound from './assets/sounds/music.mp3';
import correct1 from './assets/sounds/correct_1.mp3';
import correct2 from './assets/sounds/correct_2.mp3';
import correct3 from './assets/sounds/correct_3.mp3';
import incorrectSound from './assets/sounds/incorrect_new.wav';
import fanfareSound from './assets/sounds/fanfare.wav';

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
            const audio = new Audio(clickSound);
            audio.volume = 0.7;
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

    const playIncorrect = () => {
        if (!isMuted) {
            const audio = new Audio(incorrectSound);
            audio.volume = 0.5;
            audio.play().catch(e => console.error("Audio play failed", e));
        }
    };

    const playFanfare = () => {
        if (!isMuted) {
            const audio = new Audio(fanfareSound);
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
                <audio id="bg-music" loop src={musicSound} />
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
``

---

## FILE: src/components/StartScreen.jsx


import React from 'react';
import { Play, Calendar, Zap, Volume2, VolumeX } from 'lucide-react';

export default function StartScreen({ onStart, onDailyStart, dailyStats, topScores, isMuted, onToggleMute, playClick }) {
    const today = new Date().toDateString();
    const isDailyComplete = dailyStats?.lastPlayed === today;

    return (
        <div className="bg-pattern min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white dark:bg-slate-900 rounded-2xl ios-shadow p-8 max-w-sm w-full border border-slate-100 dark:border-slate-800">
                <button
                    onClick={() => { playClick(); onToggleMute(); }}
                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
                >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Play className="text-primary fill-current ml-1" size={40} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Grammar Quiz</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 text-base leading-relaxed">
                    Unlock your potential as a master communicator. This quiz is designed to sharpen your skills, ensuring you always sound sharp, professional, and clear in every sentence you write or speak.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onDailyStart}
                        disabled={isDailyComplete}
                        className={`w-full h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-transform active:scale-95 border-2 ${isDailyComplete
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : 'bg-white text-orange-500 border-orange-500 hover:bg-orange-50'
                            }`}
                    >
                        <Calendar size={20} />
                        {isDailyComplete ? 'Daily Challenge Complete' : 'Daily Challenge (5 Qs)'}
                        {dailyStats?.streak > 0 && (
                            <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex items-center">
                                <Zap size={10} className="mr-1 fill-current" /> {dailyStats.streak}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={onStart}
                        className="btn-tactile w-full h-16 bg-primary text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/30"
                    >
                        <Play size={24} className="fill-current" />
                        Begin My Mastery
                    </button>

                    {/* Leaderboard */}
                    {topScores && topScores.length > 0 && (
                        <div className="mt-6 w-full text-left">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fastest Perfect Scores</h3>
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-2">
                                {topScores.map((score, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-200 text-slate-500'}`}>
                                                {index + 1}
                                            </span>
                                            <span className="text-slate-600 dark:text-slate-300 font-medium">{score.date}</span>
                                        </div>
                                        <span className="font-mono font-bold text-slate-800 dark:text-white">{score.time}s</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
``

---

## FILE: src/components/QuizScreen.jsx


import React, { useState } from 'react';
import { ChevronLeft, Settings, CheckCircle, HelpCircle, SkipForward, Lightbulb, X, Flame, XCircle } from 'lucide-react';

const FALLBACK_IMAGE = "https://placehold.co/800x600/e2e8f0/475569?text=Grammar+Quiz";

export default function QuizScreen({ questionData, questionIndex, totalQuestions, answerHistory = [], onBack, onComplete, playClick, playCorrect, playIncorrect, playFanfare, currentStreak }) {
    const [feedbackState, setFeedbackState] = useState({ show: false, correct: false });
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [imgSrc, setImgSrc] = useState(questionData.image);
    const [showStreak, setShowStreak] = useState(false);
    const [showEncouragement, setShowEncouragement] = useState(null);
    const [timeLeft, setTimeLeft] = useState(15);

    const [sarcasticMessage, setSarcasticMessage] = useState(null);

    const positiveFeedbacks = [
        "Incredible!", "Excellent!", "Fantastic!", "Superb!", "Amazing!",
        "Magnificent!", "Outstanding!", "Brilliant!", "Splendid!", "Marvelous!",
        "Stupendous!", "Terrific!", "Phenomenal!", "Exceptional!", "Wonderful!",
        "First-rate!", "Impressive!", "Bravo!", "Unstoppable!", "Masterful!",
        "Legendary!", "Correct!", "Spot on!", "Genius!", "Perfect!",
        "A+!", "Top notch!", "Flawless!", "Admirable!", "Sensational!",
        "Exquisite!", "Keep going!", "You're a pro!", "Grammar Guru!", "Elite!", "Whiz!"
    ];

    const [randomPositive, setRandomPositive] = useState("Incredible!");

    // Timer Logic
    React.useEffect(() => {
        if (feedbackState.show) return;

        if (timeLeft === 0) {
            setFeedbackState({ show: true, correct: false });
            setSelectedAnswer("TIMEOUT");
            if (playIncorrect) playIncorrect();
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, feedbackState.show]);

    // Trigger animation on 5/10/15 etc
    React.useEffect(() => {
        if (currentStreak > 0 && currentStreak % 5 === 0) {
            setShowStreak(true);
            const timer = setTimeout(() => setShowStreak(false), 2000);
            return () => clearTimeout(timer);
        }

        // Encouragement Logic
        if (currentStreak > 1 && !feedbackState.show) {
            const messages = [
                "That's it!",
                "You are doing it!!",
                "You are on your way to mastery!",
                "Keep it up!",
                "Unstoppable!"
            ];
            if (currentStreak % 3 === 0) {
                const msg = messages[Math.floor(Math.random() * messages.length)];
                setShowEncouragement(msg);
                setTimeout(() => setShowEncouragement(null), 2000);
            }
        }
    }, [currentStreak]);

    // Reset state when question changes
    React.useEffect(() => {
        setFeedbackState({ show: false, correct: false });
        setSelectedAnswer(null);
        setImgSrc(questionData.image);
        setTimeLeft(15);
        setSarcasticMessage(null);
    }, [questionData]);

    const [isSupporter] = useState(() => localStorage.getItem('grammarQuiz_isSupporter') === 'true');

    // Sarcastic Replies for Incorrect Answers
    const sarcasticReplies = [
        "Oof. That happened.",
        "Swing and a miss!",
        "Did you even read the question?",
        "Grammar is hard. Apparantly.",
        "My cat could guess better.",
        "Are you guessing?",
        "Try again, but with feeling.",
        "Close! But mostly wrong.",
        "I'm judging you silently.",
        "English is tough, huh?"
    ];

    const eliteSarcasticReplies = [
        "Is this a joke? Because I'm not laughing.",
        "Wow. A supporter who can't spell. Historic.",
        "I expected better from a Grand Grammarian.",
        "Money can't buy grammar, apparently.",
        "Is your keyboard broken, or just your brain?",
        "You paid for this privilege. Enjoy the failure.",
        "A true elite would have known that.",
        "My disappointment is immeasurable."
    ];

    const handleAnswer = (answer) => {
        if (selectedAnswer) return; // Prevent double clicks

        if (playClick) playClick();

        const isCorrect = answer === questionData.correct;

        if (isCorrect) {
            if (questionData.isLegendary) {
                if (playFanfare) playFanfare();
            } else {
                if (playCorrect) playCorrect();
            }
        } else {
            if (playIncorrect && answer !== "SKIP") playIncorrect();
        }

        setSelectedAnswer(answer);
        setFeedbackState({ show: true, correct: isCorrect });

        if (!isCorrect && answer !== "SKIP") {
            const pool = isSupporter ? [...sarcasticReplies, ...eliteSarcasticReplies] : sarcasticReplies;
            const message = questionData.sarcastic_comment || pool[Math.floor(Math.random() * pool.length)];
            setSarcasticMessage(message);
        } else if (isCorrect) {
            setRandomPositive(positiveFeedbacks[Math.floor(Math.random() * positiveFeedbacks.length)]);
        } else if (answer === "SKIP") {
            setSarcasticMessage(isSupporter ? "Elite runners don't skip. But here we are." : "Coward's way out? Okay.");
        }
    };

    const handleRetry = () => {
        setFeedbackState({ show: false, correct: false });
        setSelectedAnswer(null);
        setSarcasticMessage(null);
    };

    const handleNext = () => {
        onComplete(feedbackState.correct, timeLeft);
    };

    // Word Card Component for Arsenal Questions
    const WordCard = ({ word, pron, usage, definition }) => (
        <div className="linen-paper rounded-2xl p-6 mt-4 mb-6 border-2 border-[#e5e0d0] relative overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 opacity-30"></div>
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-slate-800 tracking-tight">{word}</span>
                    <span className="text-xs font-serif italic text-slate-500">{pron}</span>
                </div>
                <div className="h-px bg-slate-200/50 w-full"></div>
                <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1 block">Usage Context</span>
                    <p className="text-sm font-serif italic text-slate-700 leading-relaxed">
                        "{usage}"
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-pattern min-h-screen flex flex-col w-full text-slate-900 dark:text-slate-100 overflow-hidden">

            {/* Encouragement Overlay */}
            {showEncouragement && (
                <div className="absolute top-20 left-0 right-0 z-50 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1.5 rounded-full font-bold text-base shadow-lg transform -rotate-1 border-2 border-white/50">
                        {showEncouragement} <Flame className="inline w-4 h-4 ml-1 fill-white stroke-none" />
                    </div>
                </div>
            )}

            {/* Header - Compact */}
            <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-2 pb-1 shadow-sm">
                <div className="flex items-center justify-between max-w-md mx-auto h-10">
                    <button
                        onClick={onBack}
                        className="w-8 h-8 flex items-center justify-start text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-sm font-bold tracking-tight opacity-70 uppercase">Grammar Mastery</h1>
                    <div className="w-8"></div>
                </div>

                {/* Progress Bar - Compact */}
                <div className="max-w-md mx-auto mt-1 px-1">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate max-w-[150px]">{questionData.rule}</span>
                        <div className="flex items-center gap-2">
                            {/* Timer */}
                            <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors flex items-center gap-1 ${timeLeft <= 3 ? 'text-red-500 bg-red-100 animate-pulse' : 'text-slate-500 bg-slate-100'}`}>
                                <span>⏱</span> {timeLeft}s
                            </div>

                            {currentStreak > 2 && (
                                <span className="text-[10px] font-bold text-orange-500 animate-pulse flex items-center gap-1">
                                    <Flame size={10} fill="currentColor" /> {currentStreak}
                                </span>
                            )}
                            <span className="text-[10px] font-bold text-slate-400">{questionIndex + 1} / {totalQuestions}</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col justify-center px-4 py-4 max-w-md mx-auto w-full relative z-0">

                {/* Question Area */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl ios-shadow border border-slate-100 dark:border-slate-800 p-4 mb-4">
                    {/* Image Area */}
                    <div className="w-full h-40 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden relative shadow-inner mb-4">
                        <img
                            key={questionData.image}
                            src={imgSrc}
                            alt={questionData.rule}
                            onError={() => setImgSrc(FALLBACK_IMAGE)}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Sentence */}
                    <div className="flex flex-col items-center text-center">
                        <p className="text-xl font-bold leading-snug px-1 text-slate-800 dark:text-white">
                            {(() => {
                                const parts = questionData.sentence.split('________');

                                // PROPER NOUN CHECK: If it has multiple caps or specific legendary names
                                const isProperNoun = (str) => {
                                    if (!str) return false;
                                    const properNouns = ['Sparta', 'NASA', 'JFK', 'Stalin', 'Grammar Mastery'];
                                    if (properNouns.includes(str)) return true;
                                    if (str === "I") return true;
                                    // Check if it's already mixed case or all caps (e.g. "iPhone" or "USA")
                                    return str.length > 1 && str.substring(1).toLowerCase() !== str.substring(1);
                                };

                                const formatAnswer = (ans, isStart) => {
                                    if (!ans) return "";
                                    if (isStart) return ans; // Level 0: Start of sentence always capitalized
                                    if (isProperNoun(ans)) return ans;
                                    return ans.toLowerCase();
                                };

                                return parts.map((part, index) => {
                                    const isStartOfSentence = index === 0 && part.trim() === "";
                                    const answerParts = selectedAnswer && selectedAnswer !== "TIMEOUT"
                                        ? selectedAnswer.split('/').map(s => s.trim())
                                        : Array(parts.length - 1).fill("");

                                    return (
                                        <React.Fragment key={index}>
                                            {part}
                                            {index < parts.length - 1 && (
                                                <span className={`inline-block border-b-2 mx-1 font-black transition-colors duration-300 ${selectedAnswer ? 'text-primary border-primary' : 'min-w-[2.5rem] border-slate-300 text-transparent'}`}>
                                                    {selectedAnswer
                                                        ? formatAnswer(answerParts[index], isStartOfSentence)
                                                        : (selectedAnswer === "TIMEOUT" ? "???" : "____")
                                                    }
                                                </span>
                                            )}
                                        </React.Fragment>
                                    );
                                });
                            })()}
                        </p>
                    </div>
                </div>

                {/* Tally Stacks - Compact Restore! */}
                <div className="flex justify-center gap-1 mb-4 h-6 overflow-hidden">
                    {answerHistory.map((isCorrect, idx) => (
                        <div
                            key={idx}
                            className={`w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-sm border ${isCorrect
                                ? 'bg-green-100 border-green-400 text-green-600'
                                : 'bg-red-100 border-red-400 text-red-600'
                                }`}
                        >
                            {isCorrect ? <span className="text-[10px] font-black">O</span> : <X size={10} strokeWidth={3} />}
                        </div>
                    ))}
                    {/* Placeholder for remaining */}
                    {Array.from({ length: 5 - (answerHistory.length % 5 || 0) }).map((_, i) => (
                        <div key={`p-${i}`} className="w-4 h-4 rounded-full border border-dashed border-slate-200 bg-slate-50 opacity-30"></div>
                    ))}
                </div>

                {/* Sarcastic Message on Wrong Answer (Inline) */}
                {sarcasticMessage && !feedbackState.show && (
                    <div className="text-center mb-4 animate-in slide-in-from-bottom-2 fade-in">
                        <span className="text-sm font-bold text-red-500 italic bg-red-50 px-3 py-1 rounded-full border border-red-100 shadow-sm">{sarcasticMessage}</span>
                    </div>
                )}


                {/* Action Buttons - Grid */}
                <div className="grid grid-cols-1 gap-3 mb-4 w-full">
                    {questionData.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(option)}
                            disabled={!!selectedAnswer}
                            className={`w-full h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 relative overflow-hidden active:scale-[0.98] transition-all duration-200 border-2 ${selectedAnswer === option
                                ? (option === questionData.correct ? 'bg-green-500 text-white border-green-600 shadow-md' : 'bg-red-500 text-white border-red-600 shadow-md')
                                : (selectedAnswer === "TIMEOUT" && option === questionData.correct
                                    ? 'bg-green-100 text-green-700 border-green-300'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-white border-slate-200 dark:border-slate-700 hover:border-primary/50 shadow-sm')
                                } ${!!selectedAnswer && selectedAnswer !== option && option !== questionData.correct ? 'opacity-50 grayscale scale-95' : ''}`}
                        >
                            <span className="truncate px-4">{option}</span>
                            {selectedAnswer === option && option === questionData.correct && (
                                <CheckCircle className="absolute right-4 w-5 h-5 animate-in zoom-in spin-in-90 duration-300" />
                            )}
                            {selectedAnswer === option && option !== questionData.correct && (
                                <X className="absolute right-4 w-5 h-5 animate-in zoom-in duration-300" />
                            )}
                        </button>
                    ))}
                </div>

                {/* INLINE FEEDBACK CARD */}
                {feedbackState.show && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-6">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                            <div className={`h-2 w-full ${feedbackState.correct ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div className="p-5">
                                <div className="flex items-start gap-4">
                                    <div className={`p-2.5 rounded-xl ${feedbackState.correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {feedbackState.correct ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                                            {feedbackState.correct ? randomPositive : (selectedAnswer === "TIMEOUT" ? "Time Out!" : 'Not Quite')}
                                        </h4>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                                            {feedbackState.correct
                                                ? (questionData.explanation || "Spot on! You mastered this rule.")
                                                : (selectedAnswer !== "TIMEOUT" && questionData.nuance && questionData.nuance[selectedAnswer]
                                                    ? questionData.nuance[selectedAnswer]
                                                    : (questionData.explanation || "Study the rule above and try next time."))}
                                        </p>

                                        {feedbackState.correct && questionData.category === "The Arsenal" && (
                                            <WordCard
                                                word={questionData.correct}
                                                pron={questionData.pronunciation}
                                                usage={questionData.usage}
                                            />
                                        )}
                                        <button
                                            onClick={handleNext}
                                            className={`w-full h-14 rounded-xl font-bold text-lg text-white transition-all transform active:scale-95 shadow-lg ${feedbackState.correct ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'
                                                }`}
                                        >
                                            {feedbackState.correct ? 'Next Question' : 'Got it, Continue'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Skip Button (Only show if not answered) */}
                {!selectedAnswer && (
                    <button
                        onClick={() => handleAnswer("SKIP")}
                        className="flex flex-col items-center gap-1 mx-auto text-[10px] font-black text-slate-400 hover:text-slate-600 transition-all active:scale-90"
                    >
                        <div className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center bg-white shadow-sm">
                            <SkipForward size={18} />
                        </div>
                        SKIP QUESTION
                    </button>
                )}

            </main>

            {/* Streak Animation Overlay */}
            {showStreak && (
                <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-[100] animate-in zoom-in fade-in duration-500">
                    <div className="bg-orange-500 text-white px-8 py-6 rounded-3xl shadow-2xl skew-y-[-6deg] flex flex-col items-center border-4 border-yellow-300">
                        <Flame size={64} className="animate-bounce mb-2 fill-yellow-300 stroke-none" />
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase drop-shadow-md">
                            {currentStreak} In A Row!
                        </h2>
                        <p className="font-bold text-orange-100 text-lg mt-2">Unstoppable!</p>
                    </div>
                </div>
            )}
        </div>
    );
}
``

---

## FILE: src/components/ResultScreen.jsx

import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Trophy, Share2, Crown, Flame, Zap, Coffee, ExternalLink, Heart } from 'lucide-react';
import fanfareSound from '../assets/sounds/fanfare.wav';

export default function ResultScreen({ score, total, totalTimeRemaining, topScores = [], onUpdateLeaderboard, onRestart, playClick, onZen, isSupporter, setIsSupporter }) {
    const percentage = Math.round((score / total) * 100);
    const avgTimeRemaining = total > 0 ? (totalTimeRemaining / total).toFixed(1) : "0.0";

    // Ensure we only save the score once per mount
    const hasSavedRef = useRef(false);
    const hasPlayedFanfareRef = useRef(false);

    useEffect(() => {
        if (score === total && !hasPlayedFanfareRef.current) {
            const audio = new Audio(fanfareSound);
            audio.volume = 0.5;
            audio.play().catch(e => console.error("Fanfare play failed", e));
            hasPlayedFanfareRef.current = true;
        }

        if (hasSavedRef.current) return;
        hasSavedRef.current = true;

        if (onUpdateLeaderboard) {
            const newEntry = {
                score,
                time: totalTimeRemaining,
                date: new Date().toISOString()
            };
            onUpdateLeaderboard(newEntry);
        }
    }, [score, totalTimeRemaining, onUpdateLeaderboard]);

    const handleSupportSuccess = () => {
        if (setIsSupporter) {
            setIsSupporter(true);
            localStorage.setItem('grammarQuiz_isSupporter', 'true');
        }
    };

    return (
        <div className="bg-pattern min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-auto py-10">
            <div className="bg-white dark:bg-slate-900 rounded-3xl ios-shadow p-6 max-w-sm w-full border border-slate-100 dark:border-slate-800 relative overflow-hidden">

                {/* 100% Zen Header */}
                {score === total && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 p-2 text-white text-xs font-bold tracking-widest uppercase animate-pulse">
                        Perfect Score • Zen Mode Unlocked
                    </div>
                )}

                <div className="mt-6 w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow relative group cursor-pointer transition-transform hover:scale-110">
                    <Trophy className={`text-yellow-600 dark:text-yellow-400 fill-current filter drop-shadow-lg ${score === total ? 'animate-pulse' : ''}`} size={48} />
                    {score === total && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                            LEGEND
                        </div>
                    )}
                </div>

                <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-1 tracking-tight">
                    {score === total ? "LEGENDARY!" : "Nice Work!"}
                </h1>

                <div className="flex justify-center items-center gap-4 mb-6 text-slate-500 dark:text-slate-400 text-sm font-medium">
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-slate-800 dark:text-white">{score}/{total}</span>
                        <span className="text-xs uppercase tracking-wider opacity-70">Score</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-slate-800 dark:text-white">{avgTimeRemaining}s</span>
                        <span className="text-xs uppercase tracking-wider opacity-70">Avg. Limit Left</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-6 overflow-hidden relative">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${score === total ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse' : 'bg-primary'}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 w-full mb-6 relative z-10">
                    {score === total ? (
                        <button
                            onClick={() => { if (playClick) playClick(); onZen(); }}
                            className="btn-primary w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all animate-pulse"
                        >
                            <Zap size={20} className="fill-yellow-300 stroke-none" />
                            ENTER ZEN MODE
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                if (playClick) playClick();
                                const text = `🔥 I just scored ${score}/${total} with a ${avgTimeRemaining}s average Time Left on the Grammar Mastery Quiz! Can you beat my streak?`;
                                if (navigator.share) {
                                    navigator.share({
                                        title: 'Grammar Quiz Mastery',
                                        text: text,
                                        url: window.location.href,
                                    }).catch(console.error);
                                } else {
                                    navigator.clipboard.writeText(text);
                                    alert('Result copied to clipboard!');
                                }
                            }}
                            className="btn-secondary w-full h-14 bg-blue-50 text-blue-600 border-2 border-blue-200 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-transform active:scale-95 hover:bg-blue-100"
                        >
                            <Share2 size={20} />
                            Challenge a Friend
                        </button>
                    )}

                    <button
                        onClick={() => { if (playClick) playClick(); onRestart(); }}
                        className="btn-secondary w-full h-14 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-transform active:scale-95 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                        <RotateCcw size={20} />
                        Try Again
                    </button>
                </div>

                {/* Leaderboard Section */}
                <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 animate-in slide-in-from-bottom-4 duration-500 delay-100">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Crown size={16} className="text-yellow-500 fill-yellow-500" />
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Top 5</h3>
                    </div>

                    <div className="flex flex-col gap-2">
                        {topScores.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Be the first to set a record!</p>
                        ) : (
                            topScores.map((entry, idx) => (
                                <div key={idx} className={`flex items-center justify-between text-sm p-2 rounded-lg ${idx === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30' : 'bg-white dark:bg-slate-800 border border-transparent'}`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-mono font-bold w-4 ${idx === 0 ? 'text-yellow-600' : 'text-slate-400'}`}>#{idx + 1}</span>
                                        <div className="flex flex-col items-start">
                                            <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                                                {entry.score === score && entry.time === totalTimeRemaining ? (idx === 0 ? "You (Legend)" : "You") : `Player ${idx + 1}`}
                                                {((entry.score === score && entry.time === totalTimeRemaining) && isSupporter) && (
                                                    <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-black animate-pulse uppercase tracking-tighter">Contributor</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 font-mono text-xs">
                                        <span className="font-bold text-slate-800 dark:text-white">{entry.score} pts</span>
                                        <span className="text-slate-400">{(total > 0 ? (entry.time / total).toFixed(1) : 0)}s avg</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ADVANCED MONETIZATION CARD */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 w-full flex flex-col gap-6">

                    {/* HEART/SUPPORT CARD */}
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-rose-900/10 dark:to-pink-900/10 rounded-2xl p-5 border border-pink-100 dark:border-pink-900/30 text-center animate-fade-in relative overflow-hidden">
                        {isSupporter && (
                            <div className="absolute -right-8 -top-8 w-24 h-24 bg-rose-500/10 rotate-45 flex items-center justify-center pt-8 pr-2">
                                <Heart size={16} className="text-rose-500 fill-rose-500" />
                            </div>
                        )}

                        <div className="flex justify-center gap-1 mb-2">
                            <Flame size={16} className="text-rose-500 fill-rose-500 animate-pulse" />
                            <Crown size={16} className="text-rose-400 fill-rose-400" />
                            <Flame size={16} className="text-rose-500 fill-rose-500 animate-pulse" />
                        </div>
                        <h4 className="text-sm font-black text-rose-900 dark:text-rose-200 uppercase tracking-tight mb-1">
                            {isSupporter ? "Thank you, Legend!" : "Make English Grammar Great Again"}
                        </h4>
                        <p className="text-[11px] text-rose-700/70 dark:text-rose-300/60 font-medium mb-4 leading-relaxed">
                            {isSupporter
                                ? "You've unlocked the Legendary Sarcasm Pack and the contributor badge! Stay sharp."
                                : "Support the project and keep the sarcasm flowing. Unlock exclusive status!"}
                        </p>

                        <div className="flex flex-col gap-2">
                            <SupportButton onSuccess={handleSupportSuccess} />

                            {!isSupporter && (
                                <a
                                    href="https://www.buymeacoffee.com/yourlink"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => handleSupportSuccess()}
                                    className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                                >
                                    <Coffee size={16} className="fill-current" />
                                    Buy Me a Coffee
                                </a>
                            )}
                        </div>
                    </div>

                    {/* GRAMMAR TOOLKIT (AFFILIATE) */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-left">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap size={14} className="text-primary fill-primary" />
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grammarian's Toolkit</h4>
                        </div>
                        <div className="flex flex-col gap-2">
                            <a href="#" className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary transition-colors group">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">The Ultimate Dictionary</span>
                                    <span className="text-[9px] text-slate-400">Expand your vocabulary daily</span>
                                </div>
                                <ExternalLink size={12} className="text-slate-300 group-hover:text-primary transition-colors" />
                            </a>
                            <a href="#" className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary transition-colors group">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Premium Writing AI</span>
                                    <span className="text-[9px] text-slate-400">Level up your essay game</span>
                                </div>
                                <ExternalLink size={12} className="text-slate-300 group-hover:text-primary transition-colors" />
                            </a>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

function SupportButton({ onSuccess }) {
    const [copied, setCopied] = useState(false);
    const address = '0x109e87DfA42086D2BB09eEC03E4ed03Ada588E3e';

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        if (onSuccess) onSuccess();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm
                ${copied
                    ? 'bg-green-500 text-white scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 text-rose-600 border-2 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                }`}
        >
            {copied ? (
                <>ETH Address Copied! 🚀</>
            ) : (
                <>
                    <Flame size={16} className="fill-current" />
                    Support via ETH
                </>
            )}
        </button>
    );
}
``

---

## FILE: src/components/ZenScreen.jsx


import React, { useRef, useEffect } from 'react';
import { Home, Share2, Heart } from 'lucide-react';

export default function ZenScreen({ onHome }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.8; // Slow down for extra zen
        }
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white overflow-hidden">
            {/* Background Video */}
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-60"
            >
                {/* Thailand Sunset Loop */}
                <source src="https://cdn.pixabay.com/video/2021/08/13/84950-588147458_large.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Content Overlay */}
            <div className="relative z-10 text-center p-8 animate-fade-in-up">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <Heart size={64} className="text-white fill-white opacity-20 blur-sm absolute inset-0 animate-ping" />
                        <Heart size={64} className="text-rose-100 fill-rose-100/30 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                    </div>
                </div>
                <h1 className="text-6xl font-black tracking-tighter mb-4 text-white drop-shadow-2xl">WELCOME HOME</h1>
                <p className="text-xl font-light text-white/90 mb-12 max-w-md mx-auto leading-relaxed drop-shadow-md italic">
                    The Missouri sky meets the Thailand sunset. You've mastered the grammar, now find your peace.
                </p>

                <button
                    onClick={onHome}
                    className="group bg-white/10 backdrop-blur-md border border-white/30 rounded-full px-8 py-3 flex items-center gap-3 transition-all hover:bg-white/20 hover:scale-105 active:scale-95 mx-auto"
                >
                    <Home size={20} className="text-white" />
                    <span className="text-white tracking-widest text-sm font-semibold uppercase">Return Home</span>
                </button>
            </div>

            <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 2s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
``

---

## FILE: src/components/CheckpointScreen.jsx

import React from 'react';
import { Trophy, Star, ArrowRight, Zap, BookOpen, Quote } from 'lucide-react';

export default function CheckpointScreen({ level, score, totalQuestions, onContinue, playClick, factoid }) {
    const ranks = [
        "Grammar Novice",
        "Sentence Scout",
        "Verb Voyager",
        "Syntax Sage",
        "Grammar Guru",
        "Punctuation Pro",
        "Linguistic Legend"
    ];

    const currentRank = ranks[Math.min(level - 1, ranks.length - 1)];

    return (
        <div className="bg-pattern min-h-screen flex flex-col items-center justify-center px-4 w-full text-slate-900 dark:text-slate-100 animate-in fade-in duration-700">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl ios-shadow border-4 border-primary/20 p-8 flex flex-col items-center text-center relative overflow-hidden">

                {/* Decorative Elements */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>

                <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl animate-bounce duration-[2000ms]">
                        <Trophy size={40} className="text-white drop-shadow-lg" />
                    </div>
                </div>

                <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-1 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Level {level} Complete!
                </h1>

                <p className="text-sm font-black text-slate-400 mb-6 uppercase tracking-[0.2em]">
                    Rank: {currentRank}
                </p>

                {/* Accuracy Badge */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-4 py-2 flex items-center gap-3 border border-slate-100 dark:border-slate-800 mb-8 self-center">
                    <Zap size={16} className="text-primary" />
                    <span className="text-sm font-black text-slate-700 dark:text-slate-200">Accuracy: {Math.round((score / totalQuestions) * 100)}%</span>
                </div>

                {/* FACTOID SECTION */}
                <div className="w-full bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50 mb-8 relative">
                    <div className="absolute -top-3 left-6 bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2">
                        <BookOpen size={12} />
                        Linguistic History
                    </div>

                    {factoid && (
                        <div className="flex flex-col gap-4 text-left">
                            <div className="w-full h-32 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                                <img
                                    src={factoid.image}
                                    alt={factoid.rule}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                                    <Quote size={14} className="opacity-50" />
                                    {factoid.rule}
                                </h3>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                    {factoid.explanation}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => {
                        if (playClick) playClick();
                        onContinue();
                    }}
                    className="w-full h-16 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg shadow-primary/25 group"
                >
                    KEEP GOING
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
``

---

## FILE: src/index.css

@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .ios-shadow {
    box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.08);
  }

  .btn-tactile {
    transition: transform 0.1s ease, box-shadow 0.1s ease;
    box-shadow: 0 4px 0 0 #0b5fb3;
  }

  .btn-tactile:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 0 #0b5fb3;
  }

  .btn-secondary {
    box-shadow: 0 4px 0 0 #cbd5e1;
  }

  .btn-secondary:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 0 #cbd5e1;
  }
}

body {
  font-family: 'Lexend', sans-serif;
  @apply bg-background-light text-slate-900;
}

.bg-pattern {
  background-color: #f6f7f8;
  background-image: radial-gradient(#d1d5db 0.5px, transparent 0.5px);
  background-size: 20px 20px;
}

.dark .bg-pattern {
  background-color: #101922;
  background-image: radial-gradient(#1e293b 0.5px, transparent 0.5px);
}

/* Snake Border Animation */
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.snake-border {
  position: relative;
  border-radius: 1rem;
  background: white;
  padding: 3px;
  z-index: 10;
  overflow: hidden;
}

.dark .snake-border {
  background: #0f172a;
}

.snake-border::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 1.2rem;
  background: conic-gradient(from var(--angle), transparent 70%, #3b82f6);
  animation: rotate 3s linear infinite;
  z-index: -1;
}

/* Fallback */
@supports not (background: paint(something)) {
  .snake-border::before {
    background: conic-gradient(transparent 70%, #3b82f6);
    animation: none;
    border: 2px solid #3b82f6;
  }
}

@keyframes rotate {
  to {
    --angle: 360deg;
  }
}

.linen-paper {
  background-color: #fdfaf1;
  background-image: url("https://www.transparenttextures.com/patterns/linen-paper.png");
  border: 1px solid #e5e0d0;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05),
    inset 0 0 40px rgba(255, 255, 255, 0.5);
}

.linen-texture {
  position: relative;
}

.linen-texture::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.05;
  pointer-events: none;
  background: repeating-linear-gradient(45deg,
      #000,
      #000 1px,
      transparent 1px,
      transparent 5px);
}
``

---

## FILE: src/grammar_data.json

[
  {
    "rule": "Well vs Good",
    "sentence": "You did a ________ job on that presentation!",
    "options": [
      "well",
      "good"
    ],
    "correct": "good",
    "sarcastic_comment": "Describing the job? Use 'good.' Unless you think you did a 'well' job, in which case you might need more than just grammar help.",
    "explanation": "'Good' is an adjective (describes the job). 'Well' is usually an adverb (describes how you did something).",
    "image": "https://loremflickr.com/800/600/presentation?lock=0",
    "category": "The Foundation"
  },
  {
    "rule": "Well vs Good",
    "sentence": "She plays the piano very ________.",
    "options": [
      "well",
      "good"
    ],
    "correct": "well",
    "sarcastic_comment": "Action needs an adverb. She plays well. If she played 'good,' she'd be a superhero, not a pianist.",
    "explanation": "Use 'well' to describe the action (how she plays).",
    "image": "https://loremflickr.com/800/600/plays?lock=1",
    "category": "The Foundation"
  },
  {
    "rule": "Well vs Good",
    "sentence": "He speaks English ________.",
    "options": [
      "well",
      "good"
    ],
    "correct": "well",
    "sarcastic_comment": "He speaks (action) well (adverb). Saying he speaks 'good' is like saying he speaks 'purple'—it just doesn't fit the verb.",
    "explanation": "He speaks (action) well (adverb). 'Good' would describe his character, not his speech skills.",
    "image": "https://loremflickr.com/800/600/speaking?lock=57",
    "category": "The Foundation"
  },
  {
    "rule": "Well vs Good",
    "sentence": "How are you? I am ________.",
    "options": [
      "well",
      "good"
    ],
    "correct": "well",
    "explanation": "When referring to health, 'well' is the correct adjective. 'I am good' technically means you are a virtuous person.",
    "image": "https://loremflickr.com/800/600/happy?lock=58",
    "category": "The Foundation"
  },
  {
    "rule": "To vs Too vs Two",
    "sentence": "It is ________ cold to go outside.",
    "options": [
      "to",
      "too",
      "two"
    ],
    "correct": "too",
    "sarcastic_comment": "Too many 'o's? Too much cold? Yes. One 'o' is just a destination.",
    "explanation": "Use 'too' when you mean 'excessively' or 'also'.",
    "image": "https://loremflickr.com/800/600/outside?lock=2",
    "category": "The Foundation"
  },
  {
    "rule": "To vs Too vs Two",
    "sentence": "I am going ________ the store.",
    "options": [
      "to",
      "too",
      "two"
    ],
    "correct": "to",
    "explanation": "Use 'to' for direction or as part of a verb.",
    "image": "https://loremflickr.com/800/600/going?lock=3",
    "category": "The Foundation"
  },
  {
    "rule": "Their vs There vs They're",
    "sentence": "________ is no reason to be upset.",
    "options": [
      "Their",
      "There",
      "They're"
    ],
    "correct": "There",
    "sarcastic_comment": "Location, location, location. 'There' is a place. 'Their' is people. 'They're' is a contraction. Do I have to draw a map?",
    "explanation": "Use 'There' for a location or to state that something exists.",
    "image": "https://loremflickr.com/800/600/reason?lock=4",
    "category": "The Foundation"
  },
  {
    "rule": "Their vs There vs They're",
    "sentence": "It is ________ responsibility to finish the project.",
    "options": [
      "Their",
      "There",
      "They're"
    ],
    "correct": "Their",
    "explanation": "Use 'Their' to show possession (it belongs to them).",
    "image": "https://loremflickr.com/800/600/responsibility?lock=5",
    "category": "The Foundation"
  },
  {
    "rule": "Who vs Whom",
    "sentence": "To ________ should I address this letter?",
    "options": [
      "who",
      "whom"
    ],
    "correct": "whom",
    "sarcastic_comment": "If you can answer with 'him,' use 'whom.' To him? To whom. It's the M at the end. Use it.",
    "explanation": "Use 'whom' after a preposition like 'to' or 'for'. (Tip: Answer with 'him').",
    "image": "https://loremflickr.com/800/600/address?lock=6",
    "category": "The Foundation"
  },
  {
    "rule": "Affect vs Effect",
    "sentence": "The lack of sleep began to ________ his work.",
    "options": [
      "affect",
      "effect"
    ],
    "correct": "affect",
    "explanation": "Use 'affect' as a verb (the action of changing something).",
    "image": "https://loremflickr.com/800/600/sleep?lock=7",
    "category": "The Foundation"
  },
  {
    "rule": "Affect vs Effect",
    "sentence": "The main ________ of the law was lower taxes.",
    "options": [
      "affect",
      "effect"
    ],
    "correct": "effect",
    "explanation": "Use 'effect' as a noun (the result of a change).",
    "image": "https://loremflickr.com/800/600/lower?lock=8",
    "category": "The Foundation"
  },
  {
    "rule": "Compliment vs Complement",
    "sentence": "That silver frame will ________ the painting perfectly.",
    "options": [
      "compliment",
      "complement"
    ],
    "correct": "complement",
    "explanation": "'Complement' means to complete or enhance.",
    "image": "https://loremflickr.com/800/600/silver?lock=9",
    "category": "The Foundation"
  },
  {
    "rule": "Lose vs Loose",
    "sentence": "If you don't be careful, you will ________ your wallet.",
    "options": [
      "lose",
      "loose"
    ],
    "correct": "lose",
    "explanation": "'Lose' is a verb meaning to misplace.",
    "image": "https://loremflickr.com/800/600/careful?lock=10",
    "category": "The Foundation"
  },
  {
    "rule": "Advice vs Advise",
    "sentence": "I need some ________ on which car to buy.",
    "options": [
      "advice",
      "advise"
    ],
    "correct": "advice",
    "explanation": "'Advice' is the noun (the thing you receive).",
    "image": "https://loremflickr.com/800/600/Advice?lock=11",
    "category": "The Foundation"
  },
  {
    "rule": "Allusion vs Illusion",
    "sentence": "The magician created a clever ________.",
    "options": [
      "allusion",
      "illusion"
    ],
    "correct": "illusion",
    "explanation": "An 'illusion' is a deceptive appearance or trick.",
    "image": "https://loremflickr.com/800/600/magician?lock=12",
    "category": "The Foundation"
  },
  {
    "rule": "Allusion vs Illusion",
    "sentence": "He made an ________ to Shakespeare in his speech.",
    "options": [
      "allusion",
      "illusion"
    ],
    "correct": "allusion",
    "explanation": "An 'allusion' is an indirect reference to something.",
    "image": "https://loremflickr.com/800/600/Shakespeare?lock=13",
    "category": "The Foundation"
  },
  {
    "rule": "Discreet vs Discrete",
    "sentence": "The data is broken down into ________ units.",
    "options": [
      "discreet",
      "discrete"
    ],
    "correct": "discrete",
    "explanation": "'Discrete' means separate or distinct.",
    "image": "https://loremflickr.com/800/600/broken?lock=14",
    "category": "The Foundation"
  },
  {
    "rule": "Discreet vs Discrete",
    "sentence": "Please be ________ about our secret meeting.",
    "options": [
      "discreet",
      "discrete"
    ],
    "correct": "discreet",
    "explanation": "'Discreet' means careful or cautious in speech/action.",
    "image": "https://loremflickr.com/800/600/Please?lock=15",
    "category": "The Foundation"
  },
  {
    "rule": "Elicit vs Illicit",
    "sentence": "The detective tried to ________ a confession.",
    "options": [
      "elicit",
      "illicit"
    ],
    "correct": "elicit",
    "explanation": "'Elicit' means to draw out or provoke.",
    "image": "https://loremflickr.com/800/600/detective?lock=16",
    "category": "The Foundation"
  },
  {
    "rule": "Emigrate vs Immigrate",
    "sentence": "They plan to ________ from Ireland next year.",
    "options": [
      "emigrate",
      "immigrate"
    ],
    "correct": "emigrate",
    "explanation": "'Emigrate' means to leave your own country (Exit).",
    "image": "https://loremflickr.com/800/600/Ireland?lock=17",
    "category": "The Foundation"
  },
  {
    "rule": "Emigrate vs Immigrate",
    "sentence": "Many people ________ to the USA for new opportunities.",
    "options": [
      "emigrate",
      "immigrate"
    ],
    "correct": "immigrate",
    "explanation": "'Immigrate' means to come into a new country (In).",
    "image": "https://loremflickr.com/800/600/people?lock=18",
    "category": "The Foundation"
  },
  {
    "rule": "Ensure vs Insure",
    "sentence": "Check the locks to ________ everyone is safe.",
    "options": [
      "ensure",
      "insure"
    ],
    "correct": "ensure",
    "explanation": "'Ensure' means to make certain.",
    "image": "https://loremflickr.com/800/600/Check?lock=19",
    "category": "The Foundation"
  },
  {
    "rule": "Ensure vs Insure",
    "sentence": "You should ________ your house against fire.",
    "options": [
      "ensure",
      "insure"
    ],
    "correct": "insure",
    "explanation": "'Insure' refers to financial insurance policies.",
    "image": "https://loremflickr.com/800/600/house?lock=20",
    "category": "The Foundation"
  },
  {
    "rule": "Lay vs Lie",
    "sentence": "I am going to ________ down for a nap.",
    "options": [
      "lay",
      "lie"
    ],
    "correct": "lie",
    "explanation": "You 'lie' yourself down. (No object).",
    "image": "https://loremflickr.com/800/600/going?lock=21",
    "category": "The Foundation"
  },
  {
    "rule": "Lay vs Lie",
    "sentence": "Please ________ the book on the table.",
    "options": [
      "lay",
      "lie"
    ],
    "correct": "lay",
    "explanation": "You 'lay' an object down.",
    "image": "https://loremflickr.com/800/600/Please?lock=22",
    "category": "The Foundation"
  },
  {
    "rule": "Principal vs Principle",
    "sentence": "The ________ reason for the delay was the rain.",
    "options": [
      "principal",
      "principle"
    ],
    "correct": "principal",
    "explanation": "'Principal' means main or primary.",
    "image": "https://loremflickr.com/800/600/reason?lock=23",
    "category": "The Foundation"
  },
  {
    "rule": "Peak vs Peek vs Pique",
    "sentence": "The mountain ________ was covered in snow.",
    "options": [
      "peak",
      "peek",
      "pique"
    ],
    "correct": "peak",
    "explanation": "'Peak' is the top of a mountain.",
    "image": "https://loremflickr.com/800/600/mountain?lock=24",
    "category": "The Foundation"
  },
  {
    "rule": "Peak vs Peek vs Pique",
    "sentence": "Don't ________ at your presents before Christmas!",
    "options": [
      "peak",
      "peek",
      "pique"
    ],
    "correct": "peek",
    "explanation": "'Peek' means to take a quick look.",
    "image": "https://loremflickr.com/800/600/presents?lock=25",
    "category": "The Foundation"
  },
  {
    "rule": "Peak vs Peek vs Pique",
    "sentence": "That mystery story will ________ my interest.",
    "options": [
      "peak",
      "peek",
      "pique"
    ],
    "correct": "pique",
    "explanation": "'Pique' means to excite or stimulate.",
    "image": "https://loremflickr.com/800/600/mystery?lock=26",
    "category": "The Foundation"
  },
  {
    "rule": "Sight vs Site vs Cite",
    "sentence": "The construction ________ is very noisy.",
    "options": [
      "sight",
      "site",
      "cite"
    ],
    "correct": "site",
    "explanation": "'Site' is a location.",
    "image": "https://loremflickr.com/800/600/construction?lock=27",
    "category": "The Foundation"
  },
  {
    "rule": "Sight vs Site vs Cite",
    "sentence": "Please ________ your sources in the essay.",
    "options": [
      "sight",
      "site",
      "cite"
    ],
    "correct": "cite",
    "explanation": "'Cite' means to quote or reference.",
    "image": "https://loremflickr.com/800/600/Please?lock=28",
    "category": "The Foundation"
  },
  {
    "rule": "Stationary vs Stationery",
    "sentence": "The bus hit a ________ car.",
    "options": [
      "stationary",
      "stationery"
    ],
    "correct": "stationary",
    "explanation": "'Stationary' means not moving.",
    "image": "https://loremflickr.com/800/600/Stationary?lock=29",
    "category": "The Foundation"
  },
  {
    "rule": "Than vs Then",
    "sentence": "I am taller ________ my brother.",
    "options": [
      "than",
      "then"
    ],
    "correct": "than",
    "explanation": "'Than' is used for comparisons.",
    "image": "https://loremflickr.com/800/600/taller?lock=30",
    "category": "The Foundation"
  },
  {
    "rule": "Than vs Then",
    "sentence": "We ate dinner, and ________ we went home.",
    "options": [
      "than",
      "then"
    ],
    "correct": "then",
    "explanation": "'Then' refers to time or a sequence of events.",
    "image": "https://loremflickr.com/800/600/dinner?lock=31",
    "category": "The Foundation"
  },
  {
    "rule": "Passed vs Past",
    "sentence": "We drove ________ the old church.",
    "options": [
      "passed",
      "past"
    ],
    "correct": "past",
    "explanation": "'Past' refers to a place or a time.",
    "image": "https://loremflickr.com/800/600/drove?lock=32",
    "category": "The Foundation"
  },
  {
    "rule": "Passed vs Past",
    "sentence": "He ________ the ball to his teammate.",
    "options": [
      "passed",
      "past"
    ],
    "correct": "passed",
    "explanation": "'Passed' is the past tense of the verb 'to pass'.",
    "image": "https://loremflickr.com/800/600/teammate?lock=33",
    "category": "The Foundation"
  },
  {
    "rule": "Brake vs Break",
    "sentence": "You need to ________ slowly on icy roads.",
    "options": [
      "brake",
      "break"
    ],
    "correct": "brake",
    "explanation": "'Brake' is the device used to stop a vehicle.",
    "image": "https://loremflickr.com/800/600/slowly?lock=34",
    "category": "The Foundation"
  },
  {
    "rule": "Brake vs Break",
    "sentence": "Be careful not to ________ the glass.",
    "options": [
      "brake",
      "break"
    ],
    "correct": "break",
    "explanation": "'Break' means to smash or fracture.",
    "image": "https://loremflickr.com/800/600/careful?lock=35",
    "category": "The Foundation"
  },
  {
    "rule": "Canvas vs Canvass",
    "sentence": "The artist painted on a large ________.",
    "options": [
      "canvas",
      "canvass"
    ],
    "correct": "canvas",
    "explanation": "'Canvas' is a heavy cloth used for painting or tents.",
    "image": "https://loremflickr.com/800/600/artist?lock=36",
    "category": "The Foundation"
  },
  {
    "rule": "Canvas vs Canvass",
    "sentence": "The politician will ________ the neighborhood for votes.",
    "options": [
      "canvas",
      "canvass"
    ],
    "correct": "canvass",
    "explanation": "'Canvass' means to survey or seek support.",
    "image": "https://loremflickr.com/800/600/politician?lock=37",
    "category": "The Foundation"
  },
  {
    "rule": "Council vs Counsel",
    "sentence": "The city ________ met to discuss the budget.",
    "options": [
      "council",
      "counsel"
    ],
    "correct": "council",
    "explanation": "A 'council' is a group of people who manage or advise.",
    "image": "https://loremflickr.com/800/600/discuss?lock=38",
    "category": "The Foundation"
  },
  {
    "rule": "Council vs Counsel",
    "sentence": "The therapist provided excellent ________.",
    "options": [
      "council",
      "counsel"
    ],
    "correct": "counsel",
    "explanation": "'Counsel' refers to advice or the act of giving it.",
    "image": "https://loremflickr.com/800/600/therapist?lock=39",
    "category": "The Foundation"
  },
  {
    "rule": "I vs Me",
    "sentence": "The manager invited Sarah and ________ to the private meeting.",
    "options": [
      "I",
      "me"
    ],
    "correct": "me",
    "explanation": "Tip: Remove 'Sarah'. You wouldn't say 'The manager invited I.' You'd say 'The manager invited me.'",
    "image": "https://loremflickr.com/800/600/manager?lock=40",
    "category": "The Foundation"
  },
  {
    "rule": "I vs Me",
    "sentence": "Between you and ________, I think the project will be a huge success.",
    "options": [
      "I",
      "me"
    ],
    "correct": "me",
    "explanation": "After a preposition like 'between', always use the object pronoun 'me'.",
    "image": "https://loremflickr.com/800/600/Between?lock=41",
    "category": "The Foundation"
  },
  {
    "rule": "Tortuous vs Torturous",
    "sentence": "The ________ mountain road was beautiful but made everyone car-sick.",
    "options": [
      "tortuous",
      "torturous"
    ],
    "correct": "tortuous",
    "explanation": "'Tortuous' means full of twists and turns. 'Torturous' means involving great pain.",
    "image": "https://loremflickr.com/800/600/mountain?lock=42",
    "category": "The Foundation"
  },
  {
    "rule": "Enervate vs Energize",
    "sentence": "The humidity in the tropics can ________ even the most active travelers.",
    "options": [
      "enervate",
      "energize"
    ],
    "correct": "enervate",
    "explanation": "'Enervate' means to drain of energy or weaken. It is often confused with its opposite!",
    "image": "https://loremflickr.com/800/600/humidity?lock=43",
    "category": "The Foundation"
  },
  {
    "rule": "Complacent vs Complaisant",
    "sentence": "A professional athlete can never afford to be ________ after a win.",
    "options": [
      "complacent",
      "complaisant"
    ],
    "correct": "complacent",
    "explanation": "'Complacent' means self-satisfied or smug. 'Complaisant' means willing to please others.",
    "image": "https://loremflickr.com/800/600/professional?lock=44",
    "category": "The Foundation"
  },
  {
    "rule": "Flaunt vs Flout",
    "sentence": "The rebel decided to ________ the law in broad daylight.",
    "options": [
      "flaunt",
      "flout"
    ],
    "correct": "flout",
    "explanation": "'Flout' means to openly disregard a rule. 'Flaunt' means to show off ostentatiously.",
    "image": "https://loremflickr.com/800/600/rebel?lock=45",
    "category": "The Foundation"
  },
  {
    "rule": "Amoral vs Immoral",
    "sentence": "Nature is ________; it follows the laws of survival, not the laws of ethics.",
    "options": [
      "amoral",
      "immoral"
    ],
    "correct": "amoral",
    "explanation": "'Amoral' means having no moral sense at all. 'Immoral' means knowing right but doing wrong.",
    "image": "https://loremflickr.com/800/600/Nature?lock=46",
    "category": "The Foundation"
  },
  {
    "rule": "Disinterested vs Uninterested",
    "sentence": "We need a ________ party to mediate this business dispute.",
    "options": [
      "disinterested",
      "uninterested"
    ],
    "correct": "disinterested",
    "explanation": "'Disinterested' means unbiased or impartial. 'Uninterested' simply means bored.",
    "image": "https://loremflickr.com/800/600/party?lock=47",
    "category": "The Foundation"
  },
  {
    "rule": "Appraise vs Apprise",
    "sentence": "Please ________ the board members of the recent developments.",
    "options": [
      "appraise",
      "apprise"
    ],
    "correct": "apprise",
    "explanation": "'Apprise' means to inform. 'Appraise' means to assess the value or quality of something.",
    "image": "https://loremflickr.com/800/600/Please?lock=48",
    "category": "The Foundation"
  },
  {
    "rule": "Loath vs Loathe",
    "sentence": "I am ________ to spend more money until we see results.",
    "options": [
      "loath",
      "loathe"
    ],
    "correct": "loath",
    "explanation": "'Loath' (no 'e') is an adjective meaning reluctant. 'Loathe' is a verb meaning to hate.",
    "image": "https://loremflickr.com/800/600/spend?lock=49",
    "category": "The Foundation"
  },
  {
    "rule": "Sensual vs Sensuous",
    "sentence": "The orchestra provided a ________ experience for the listeners.",
    "options": [
      "sensual",
      "sensuous"
    ],
    "correct": "sensuous",
    "explanation": "'Sensuous' relates to the five senses (art/music). 'Sensual' usually relates to physical appetites.",
    "image": "https://loremflickr.com/800/600/orchestra?lock=50",
    "category": "The Foundation"
  },
  {
    "rule": "Ingenious vs Ingenuous",
    "sentence": "It was an ________ plan that saved the company millions.",
    "options": [
      "ingenious",
      "ingenuous"
    ],
    "correct": "ingenious",
    "explanation": "'Ingenious' means clever or brilliant. 'Ingenuous' means innocent or naive.",
    "image": "https://loremflickr.com/800/600/saved?lock=51",
    "category": "The Foundation"
  },
  {
    "rule": "Hanged vs Hung",
    "sentence": "The curtains were ________ with care, but the outlaw was ________ at dawn.",
    "options": [
      "hung / hanged",
      "hanged / hung"
    ],
    "correct": "hung / hanged",
    "explanation": "Objects are 'hung' (like a picture). People are 'hanged' (in history books). The pirate was hanged, but his flag was hung.",
    "image": "https://loremflickr.com/800/600/curtains?lock=52",
    "category": "The Foundation"
  },
  {
    "rule": "Lighted vs Lit",
    "sentence": "He ________ the match and saw the fuse was already ________.",
    "options": [
      "lit / lit",
      "lighted / lit"
    ],
    "correct": "lit / lit",
    "explanation": "Both are actually correct, but 'lit' is the standard move in modern English. 'Lighted' sounds like you're writing a 19th-century novel.",
    "image": "https://loremflickr.com/800/600/match?lock=53",
    "category": "The Foundation"
  },
  {
    "rule": "The Deadly Comma",
    "sentence": "Choose the version that doesn't involve cannibalism: ________",
    "options": [
      "Let's eat, Grandpa!",
      "Let's eat Grandpa!"
    ],
    "correct": "Let's eat, Grandpa!",
    "explanation": "Punctuation saves lives. This classic example shows how a missing comma can turn a polite invitation into a gruesome suggestion. In grammar circles, this is known as the 'vocative comma'—the comma used to address someone directly. Without it, 'Grandpa' shifts from the person being spoken to, to the thing being eaten.",
    "image": "https://loremflickr.com/800/600/Choose?lock=54",
    "isLegendary": true,
    "category": "The Vault"
  },
  {
    "rule": "The Oxford Comma",
    "sentence": "I had a breakfast of ________.",
    "options": [
      "toast, eggs and orange juice",
      "toast, eggs, and orange juice"
    ],
    "correct": "toast, eggs, and orange juice",
    "explanation": "Use the Oxford comma to keep things clear. Otherwise, your toast might be made of eggs and orange juice!",
    "image": "https://loremflickr.com/800/600/breakfast?lock=55",
    "category": "The Foundation"
  },
  {
    "rule": "Possessive Apostrophes",
    "sentence": "The ________ locker room was a mess of sweaty socks.",
    "options": [
      "boys'",
      "boys"
    ],
    "correct": "boys'",
    "explanation": "Multiple boys own the room, so the apostrophe goes after the 's'. Without it, it's just a room full of boys.",
    "image": "https://loremflickr.com/800/600/locker?lock=56",
    "category": "The Foundation"
  },
  {
    "rule": "The Spartan 'If'",
    "sentence": "When Philip of Macedon threatened Sparta, they replied with one word: ________.",
    "options": [
      "Never",
      "If"
    ],
    "correct": "If",
    "sarcastic_comment": "Brevity is power. You're talking too much; they only needed one word.",
    "explanation": "Philip II of Macedon sent a terrifying message to Sparta: 'If I bring my army into your land, I will destroy your farms, slay your people, and raze your city.' The Spartans famously replied with just one word: 'If.' Philip never invaded. This 'Laconic' style (from Laconia, Sparta) became legendary for its brevity and punch.",
    "image": "https://loremflickr.com/800/600/sparta?lock=101",
    "isLegendary": true,
    "category": "The Vault"
  },
  {
    "rule": "Hanged vs Hung",
    "sentence": "The stockings were ________ by the chimney, but the criminal was ________.",
    "options": [
      "hung / hanged",
      "hanged / hung"
    ],
    "correct": "hung / hanged",
    "sarcastic_comment": "Unless you're planning an execution, use 'hung.' Don't make things awkward.",
    "explanation": "Objects are 'hung.' Humans are 'hanged' (executed).",
    "image": "https://loremflickr.com/800/600/chimney?lock=102",
    "category": "The Foundation"
  },
  {
    "rule": "NASA's Hyphen",
    "sentence": "A missing ________ caused the Mariner 1 spacecraft to explode in 1962.",
    "options": [
      "comma",
      "hyphen"
    ],
    "correct": "hyphen",
    "sarcastic_comment": "Boom. $150 million gone because you skipped a dash. NASA is hiring, but maybe stay away.",
    "explanation": "In 1962, the Mariner 1 spacecraft veered off course and was destroyed just 293 seconds after launch. The culprit? A single missing 'overbar' (a hyphen-like symbol) in the handwritten guidance equations. This tiny punctuation error caused the rocket to miscalculate its velocity, leading to a $150 million explosion—one of the most expensive typos in human history.",
    "image": "https://loremflickr.com/800/600/rocket?lock=103",
    "isLegendary": true,
    "category": "The Vault"
  },
  {
    "rule": "I vs Me",
    "sentence": "The CEO invited Kanya and ________ to the gala.",
    "options": [
      "I",
      "me"
    ],
    "correct": "me",
    "explanation": "Tip: Remove 'Kanya'. You wouldn't say 'The CEO invited I.' You'd say 'invited me.'",
    "image": "https://loremflickr.com/800/600/gala?lock=105",
    "category": "The Foundation"
  },
  {
    "rule": "Tortuous vs Torturous",
    "sentence": "The mountain road was ________, with hundreds of sharp turns.",
    "options": [
      "tortuous",
      "torturous"
    ],
    "correct": "tortuous",
    "explanation": "'Tortuous' means full of twists. 'Torturous' means involving pain.",
    "image": "https://loremflickr.com/800/600/turns?lock=106",
    "category": "The Foundation"
  },
  {
    "rule": "Enervate vs Energize",
    "sentence": "The long, hot trek across the desert tended to ________ the hikers.",
    "options": [
      "enervate",
      "energize"
    ],
    "correct": "enervate",
    "explanation": "'Enervate' means to drain of energy. It's the most common trap for smart people!",
    "image": "https://loremflickr.com/800/600/desert?lock=107",
    "category": "The Foundation"
  },
  {
    "rule": "The Oxford Comma",
    "sentence": "I'd like to thank my parents, ________.",
    "options": [
      "Ayn Rand and God",
      "Ayn Rand, and God"
    ],
    "correct": "Ayn Rand, and God",
    "sarcastic_comment": "Without that comma, you're claiming God is one of your parents. Ambitious!",
    "explanation": "This is likely the most famous example of the Oxford Comma's necessity. It reportedly comes from a real book dedication where the lack of a final comma made it sound like the author's parents were a famous philosopher and a deity. Without that tiny mark, the list 'Ayn Rand and God' becomes an appositive, describing who the parents are, rather than listing three separate entities.",
    "image": "https://loremflickr.com/800/600/parents?lock=108",
    "isLegendary": true,
    "category": "The Vault"
  },
  {
    "rule": "The Million Dollar Comma",
    "sentence": "In 1872, a clerk's misplaced comma made ________ tax-free, costing millions.",
    "options": [
      "all fruit",
      "only fruit-plants"
    ],
    "correct": "all fruit",
    "sarcastic_comment": "One comma, two million dollars. I hope you're better with your taxes than your grammar.",
    "explanation": "This is one of the costliest clerical errors in U.S. history. In the Tariff Act of 1872, a clerk accidentally typed 'Fruit, Plants' instead of 'Fruit-plants'. This tiny comma meant that all imported FRUIT suddenly became tax-free, rather than just the plants. Before the error was fixed a year later, the government lost an estimated $2 million in revenue—equivalent to over $40 million today.",
    "image": "https://loremflickr.com/800/600/fruit?lock=109",
    "isLegendary": true,
    "category": "The Vault"
  },
  {
    "rule": "Disinterested vs Uninterested",
    "sentence": "We need a ________ judge to hear the case fairly.",
    "options": [
      "disinterested",
      "uninterested"
    ],
    "correct": "disinterested",
    "explanation": "'Disinterested' means unbiased. 'Uninterested' means bored.",
    "image": "https://loremflickr.com/800/600/court?lock=110",
    "category": "The Foundation"
  },
  {
    "rule": "Loath vs Loathe",
    "sentence": "I am ________ to admit that the mistake was mine.",
    "options": [
      "loath",
      "loathe"
    ],
    "correct": "loath",
    "explanation": "'Loath' (no 'e') means reluctant. 'Loathe' is the verb meaning to hate.",
    "image": "https://loremflickr.com/800/600/mistake?lock=111",
    "category": "The Foundation"
  },
  {
    "rule": "A lot vs Alot",
    "sentence": "I like you ________, but I'm not sure if I love you yet.",
    "options": [
      "a lot",
      "alot"
    ],
    "correct": "a lot",
    "sarcastic_comment": "There is no such word as 'alot.' Unless you are talking about the mythical 'Alot' monster, use two words.",
    "explanation": "'A lot' is always two words. Always.",
    "image": "https://loremflickr.com/800/600/lot?lock=120",
    "category": "The Foundation"
  },
  {
    "rule": "Should have vs Should of",
    "sentence": "You ________ seen the look on his face when I won!",
    "options": [
      "should have",
      "should of"
    ],
    "correct": "should have",
    "sarcastic_comment": "'Should of' is a phonetic hallucination. It's 'should have' or 'should've.' Don't trust your ears.",
    "explanation": "Because 'should've' sounds like 'should of,' people write it incorrectly. It's always 'have'.",
    "image": "https://loremflickr.com/800/600/face?lock=121",
    "category": "The Foundation"
  },
  {
    "rule": "Could care less",
    "sentence": "If I say 'I ________ care less,' it means I actually care a little bit.",
    "options": [
      "could",
      "couldn't"
    ],
    "correct": "couldn't",
    "sarcastic_comment": "If you 'could care less,' that means you care! If you don't care at all, you 'could NOT care less.'",
    "explanation": "This is a logic trap. 'Couldn't care less' is the only version that means you don't care.",
    "image": "https://loremflickr.com/800/600/logic?lock=122",
    "category": "The Foundation"
  },
  {
    "rule": "Peak vs Peek vs Pique",
    "sentence": "That mountain ________ really ________ my interest; let's take a ________ at the map.",
    "options": [
      "peak / piqued / peek",
      "peek / peaked / peak"
    ],
    "correct": "peak / piqued / peek",
    "sarcastic_comment": "Peak is the top; peek is a look; pique is to stimulate. Stop confusing your p-words.",
    "explanation": "Pique (French origin) is for interest. Peak is for height. Peek is for eyes.",
    "image": "https://loremflickr.com/800/600/mountain?lock=123",
    "category": "The Foundation"
  },
  {
    "rule": "Loose vs Lose",
    "sentence": "If your belt is too ________, you might ________ your pants in public.",
    "options": [
      "loose / lose",
      "lose / loose"
    ],
    "correct": "loose / lose",
    "sarcastic_comment": "'Lose' has one 'o' because it lost the other one. 'Loose' has two because it's baggy.",
    "explanation": "Loose rhymes with goose. Lose rhymes with snooze.",
    "image": "https://loremflickr.com/800/600/belt?lock=124",
    "category": "The Foundation"
  },
  {
    "rule": "Stationary vs Stationery",
    "sentence": "I was ________ while writing the letter on my best ________.",
    "options": [
      "stationary / stationery",
      "stationery / stationary"
    ],
    "correct": "stationary / stationery",
    "sarcastic_comment": "StationEry is for Letters and Envelopes (think 'E'). StationAry is for pArked cArs (think 'A').",
    "explanation": "A=At rest. E=Envelopes.",
    "image": "https://loremflickr.com/800/600/letter?lock=125",
    "category": "The Foundation"
  },
  {
    "rule": "Well vs Good",
    "sentence": "That was a ________ effort on the project!",
    "options": [
      "well",
      "good"
    ],
    "correct": "good",
    "sarcastic_comment": "Describe the effort? Use 'good.' Describe how you worked? Use 'well.' Don't make me explain this again.",
    "explanation": "'Good' is an adjective. It modifies the noun 'effort.'",
    "image": "https://loremflickr.com/800/600/effort?lock=130",
    "category": "The Foundation"
  },
  {
    "rule": "To vs Too vs Two",
    "sentence": "I have ________ eyes and only one mouth.",
    "options": [
      "to",
      "too",
      "two"
    ],
    "correct": "two",
    "sarcastic_comment": "Unless you are visiting 'to' eyes, use the number.",
    "explanation": "'Two' is the number 2.",
    "image": "https://loremflickr.com/800/600/eyes?lock=131",
    "category": "The Foundation"
  },
  {
    "rule": "Their vs There vs They're",
    "sentence": "________ coming over for dinner tonight.",
    "options": [
      "Their",
      "There",
      "They're"
    ],
    "correct": "They're",
    "sarcastic_comment": "They ARE coming. They're. It's a contraction. Use your brain.",
    "explanation": "They're = They are.",
    "image": "https://loremflickr.com/800/600/dinner?lock=132",
    "category": "The Foundation"
  },
  {
    "rule": "Who vs Whom",
    "sentence": "________ is going to the party with you?",
    "options": [
      "Who",
      "Whom"
    ],
    "correct": "Who",
    "sarcastic_comment": "If the answer is 'he,' use 'who.' If the answer is 'him,' use 'whom.' He is going. Who is going. simple.",
    "explanation": "'Who' is the subject pronoun. 'Whom' is the object pronoun.",
    "image": "https://loremflickr.com/800/600/party?lock=133",
    "category": "The Foundation"
  },
  {
    "rule": "Compliment vs Complement",
    "sentence": "He gave her a nice ________ on her new haircut.",
    "options": [
      "compliment",
      "complement"
    ],
    "correct": "compliment",
    "sarcastic_comment": "I Compliment people with 'I'. A Complement Completes with 'E'.",
    "explanation": "A compliment is a polite expression of praise.",
    "image": "https://loremflickr.com/800/600/haircut?lock=134",
    "category": "The Foundation"
  },
  {
    "rule": "Lose vs Loose",
    "sentence": "This knot is far too ________; it will slip.",
    "options": [
      "lose",
      "loose"
    ],
    "correct": "loose",
    "sarcastic_comment": "If it rhymes with 'moose,' use 'loose.' If you're crying because you can't find it, use 'lose.'",
    "explanation": "'Loose' is an adjective meaning not tight.",
    "image": "https://loremflickr.com/800/600/knot?lock=135",
    "category": "The Foundation"
  },
  {
    "rule": "Advice vs Advise",
    "sentence": "I would ________ you to wait until morning.",
    "options": [
      "advice",
      "advise"
    ],
    "correct": "advise",
    "sarcastic_comment": "Advise is the verb (it has a 'z' sound). Advice is the noun (it has an 's' sound).",
    "explanation": "'Advise' is the action of giving advice.",
    "image": "https://loremflickr.com/800/600/wait?lock=136",
    "category": "The Foundation"
  },
  {
    "rule": "Elicit vs Illicit",
    "sentence": "The gang was involved in ________ trade across the border.",
    "options": [
      "elicit",
      "illicit"
    ],
    "correct": "illicit",
    "sarcastic_comment": "Illicit starts with 'I' like 'Illegal'. Elicit starts with 'E' like 'Extract'.",
    "explanation": "'Illicit' means forbidden by law, rules, or custom.",
    "image": "https://loremflickr.com/800/600/trade?lock=137",
    "category": "The Foundation"
  },
  {
    "rule": "Principal vs Principle",
    "sentence": "It's the ________ of the thing that matters to me.",
    "options": [
      "principal",
      "principle"
    ],
    "correct": "principle",
    "sarcastic_comment": "The PrincipAL is your PAL. A PrincipLE is a ruLE.",
    "explanation": "A principle is a fundamental truth or proposition.",
    "image": "https://loremflickr.com/800/600/truth?lock=138",
    "category": "The Foundation"
  },
  {
    "rule": "Sight vs Site vs Cite",
    "sentence": "The sunrise over the ocean was a beautiful ________.",
    "options": [
      "sight",
      "site",
      "cite"
    ],
    "correct": "sight",
    "sarcastic_comment": "You use your eyes for a SIGHT. You go to a location (SITE).",
    "explanation": "'Sight' refers to something seen or the faculty of seeing.",
    "image": "https://loremflickr.com/800/600/sunrise?lock=139",
    "category": "The Foundation"
  },
  {
    "rule": "Stationary vs Stationery",
    "sentence": "She bought elegant ________ for her wedding invitations.",
    "options": [
      "stationary",
      "stationery"
    ],
    "correct": "stationery",
    "sarcastic_comment": "StationEry is for Envelopes. StationAry is for pArked cars. Are you sending a car or an envelope?",
    "explanation": "'Stationery' refers to writing materials.",
    "image": "https://loremflickr.com/800/600/wedding?lock=140",
    "category": "The Foundation"
  },
  {
    "rule": "I vs Me",
    "sentence": "Sarah and ________ are going to the concert tonight.",
    "options": [
      "I",
      "me"
    ],
    "correct": "I",
    "sarcastic_comment": "Take Sarah out. Would you say 'Me am going'? No. Use 'I'.",
    "explanation": "Use 'I' when you are the subject of the sentence.",
    "image": "https://loremflickr.com/800/600/concert?lock=141",
    "category": "The Foundation"
  },
  {
    "rule": "Tortuous vs Torturous",
    "sentence": "The long, hot wait in the sun was ________.",
    "options": [
      "tortuous",
      "torturous"
    ],
    "correct": "torturous",
    "sarcastic_comment": "Torturous involves torture (pain). Tortuous involves turns (curves). This wait is painful, hopefully not curvy.",
    "explanation": "'Torturous' means characterized by or involving physical or mental pain.",
    "image": "https://loremflickr.com/800/600/sun?lock=142",
    "category": "The Foundation"
  },
  {
    "rule": "Enervate vs Energize",
    "sentence": "A cold shower in the morning will ________ you!",
    "options": [
      "enervate",
      "energize"
    ],
    "correct": "energize",
    "sarcastic_comment": "If you want to feel weak, enervate. If you want to feel like a superhero, energize.",
    "explanation": "'Energize' means to give vitality and enthusiasm to.",
    "image": "https://loremflickr.com/800/600/shower?lock=143",
    "category": "The Foundation"
  },
  {
    "rule": "Complacent vs Complaisant",
    "sentence": "The butler was so ________ that he anticipated every guest's need.",
    "options": [
      "complacent",
      "complaisant"
    ],
    "correct": "complaisant",
    "sarcastic_comment": "Complacent means you're lazy and smug. Complaisant means you're eager to please. The butler isn't lazy.",
    "explanation": "'Complaisant' means willing to please others; obliging.",
    "image": "https://loremflickr.com/800/600/butler?lock=144",
    "category": "The Foundation"
  },
  {
    "rule": "Flaunt vs Flout",
    "sentence": "If you work hard for that body, feel free to ________ it.",
    "options": [
      "flaunt",
      "flout"
    ],
    "correct": "flaunt",
    "sarcastic_comment": "You flaunt (show off) your assets. You flout (disregard) the rules.",
    "explanation": "'Flaunt' means to display (something) ostentatiously, especially in order to provoke envy or admiration.",
    "image": "https://loremflickr.com/800/600/gym?lock=145",
    "category": "The Foundation"
  },
  {
    "rule": "Amoral vs Immoral",
    "sentence": "Stealing from the poor is considered ________ by almost everyone.",
    "options": [
      "amoral",
      "immoral"
    ],
    "correct": "immoral",
    "sarcastic_comment": "Amoral means you don't even know what right and wrong are. Immoral means you know, and you're just a bad person.",
    "explanation": "'Immoral' means not conforming to accepted standards of morality.",
    "image": "https://loremflickr.com/800/600/stealing?lock=146",
    "category": "The Foundation"
  },
  {
    "rule": "Disinterested vs Uninterested",
    "sentence": "The students were clearly ________ in the boring lecture.",
    "options": [
      "disinterested",
      "uninterested"
    ],
    "correct": "uninterested",
    "sarcastic_comment": "Uninterested means you're bored. Disinterested means you're a fair and impartial judge. Don't be a judge, just listen.",
    "explanation": "'Uninterested' means not interested in or concerned about something.",
    "image": "https://loremflickr.com/800/600/bored?lock=147",
    "category": "The Foundation"
  },
  {
    "rule": "Appraise vs Apprise",
    "sentence": "I need to ________ the value of this antique vase.",
    "options": [
      "appraise",
      "apprise"
    ],
    "correct": "appraise",
    "sarcastic_comment": "ApprIse means Inform. ApprAise means Assess. Assess the vase, please.",
    "explanation": "'Appraise' means to assess the value or quality of.",
    "image": "https://loremflickr.com/800/600/vase?lock=148",
    "category": "The Foundation"
  },
  {
    "rule": "Loath vs Loathe",
    "sentence": "I absolutely ________ having to wake up early on Saturdays.",
    "options": [
      "loath",
      "loathe"
    ],
    "correct": "loathe",
    "sarcastic_comment": "Loath (no 'e') is an adjective (reluctant). Loathe (with 'e') is a verb (hate). You HATE the early wake-up. Add the 'e'.",
    "explanation": "'Loathe' is a verb meaning to feel intense dislike or disgust for.",
    "image": "https://loremflickr.com/800/600/sleepy?lock=149",
    "category": "The Foundation"
  },
  {
    "rule": "Sensual vs Sensuous",
    "sentence": "The massage was a deeply ________ experience.",
    "options": [
      "sensual",
      "sensuous"
    ],
    "correct": "sensual",
    "sarcastic_comment": "Sensuous involves the senses (like art). Sensual involves physical/body gratifications. A massage is definitely physical.",
    "explanation": "'Sensual' relates to or involves gratification of the senses and physical appetites.",
    "image": "https://loremflickr.com/800/600/massage?lock=150",
    "category": "The Foundation"
  },
  {
    "rule": "Ingenious vs Ingenuous",
    "sentence": "Her ________ smile made it hard to believe she could ever lie.",
    "options": [
      "ingenious",
      "ingenuous"
    ],
    "correct": "ingenuous",
    "sarcastic_comment": "Ingenious is for geniuses. Ingenuous is for innocent, naive people. She's not a genius, she's just cute.",
    "explanation": "'Ingenuous' means innocent and unsuspecting.",
    "image": "https://loremflickr.com/800/600/smile?lock=151",
    "category": "The Foundation"
  },
  {
    "rule": "Who vs Whom",
    "sentence": "To ________ was the package delivered?",
    "options": [
      "who",
      "whom"
    ],
    "correct": "whom",
    "sarcastic_comment": "Deliver it to 'him'? Then use 'whom.' Deliver it to 'he'? No, you're not that person.",
    "explanation": "Use 'whom' as the object of a preposition (in this case, 'to').",
    "image": "https://loremflickr.com/800/600/package?lock=160",
    "category": "The Foundation"
  },
  {
    "rule": "Affect vs Effect",
    "sentence": "The ________ of the storm was felt for weeks.",
    "options": [
      "affect",
      "effect"
    ],
    "correct": "effect",
    "sarcastic_comment": "A result? Effect. To change something? Affect. The storm left a result.",
    "explanation": "Effect is typically the noun referring to the result of an action.",
    "image": "https://loremflickr.com/800/600/storm?lock=161",
    "category": "The Foundation"
  },
  {
    "rule": "Compliment vs Complement",
    "sentence": "The red wine will ________ the steak perfectly.",
    "options": [
      "compliment",
      "complement"
    ],
    "correct": "complement",
    "sarcastic_comment": "They go together! They complete each other! Like 'E' and 'E'.",
    "explanation": "'Complement' means to add to something in a way that enhances or improves it.",
    "image": "https://loremflickr.com/800/600/steak?lock=162",
    "category": "The Foundation"
  },
  {
    "rule": "Advice vs Advise",
    "sentence": "Could you please give me some ________ on my career?",
    "options": [
      "advice",
      "advise"
    ],
    "correct": "advice",
    "sarcastic_comment": "I give advice (the thing). I advise people (the action). You want the thing.",
    "explanation": "'Advice' is the noun form.",
    "image": "https://loremflickr.com/800/600/career?lock=163",
    "category": "The Foundation"
  },
  {
    "rule": "Allusion vs Illusion",
    "sentence": "The poem contains an ________ to a Greek myth.",
    "options": [
      "allusion",
      "illusion"
    ],
    "correct": "allusion",
    "sarcastic_comment": "A reference is an ALLUSION. A trick of the eye is an ILLUSION.",
    "explanation": "An 'allusion' is an expression designed to call something to mind without mentioning it explicitly.",
    "image": "https://loremflickr.com/800/600/poem?lock=164",
    "category": "The Foundation"
  },
  {
    "rule": "Discreet vs Discrete",
    "sentence": "He made a ________ exit through the back door.",
    "options": [
      "discreet",
      "discrete"
    ],
    "correct": "discreet",
    "discreet": "Be careful! E-E is for keepig it quiet. E-T-E is for separate units. You want the quiet one.",
    "explanation": "'Discreet' means careful and circumspect in one's speech or actions.",
    "image": "https://loremflickr.com/800/600/exit?lock=165",
    "category": "The Foundation"
  },
  {
    "rule": "Elicit vs Illicit",
    "sentence": "The teacher tried to ________ a response from the shy boy.",
    "options": [
      "elicit",
      "illicit"
    ],
    "correct": "elicit",
    "sarcastic_comment": "Extract a response (E). Don't start a crime (I).",
    "explanation": "'Elicit' means to evoke or draw out (a reaction, answer, or fact) from someone.",
    "image": "https://loremflickr.com/800/600/teacher?lock=166",
    "category": "The Foundation"
  },
  {
    "rule": "Emigrate vs Immigrate",
    "sentence": "My grandparents decided to ________ to Canada in 1950.",
    "options": [
      "emigrate",
      "immigrate"
    ],
    "correct": "immigrate",
    "sarcastic_comment": "Immigrate = In (moving into). Emigrate = Exit (moving out). They moved IN to Canada.",
    "explanation": "'Immigrate' means to come to live permanently in a foreign country.",
    "image": "https://loremflickr.com/800/600/canada?lock=167",
    "category": "The Foundation"
  },
  {
    "rule": "Ensure vs Insure",
    "sentence": "Checking the tires will ________ we arrive safely.",
    "options": [
      "ensure",
      "insure"
    ],
    "correct": "ensure",
    "sarcastic_comment": "Make sure? Ensure. Pay a company monthly for safety? Insure.",
    "explanation": "'Ensure' means to make certain that something will occur or be the case.",
    "image": "https://loremflickr.com/800/600/tires?lock=168",
    "category": "The Foundation"
  },
  {
    "rule": "Lay vs Lie",
    "sentence": "The dog loves to ________ in the sun all afternoon.",
    "options": [
      "lay",
      "lie"
    ],
    "correct": "lie",
    "sarcastic_comment": "The dog is doing it himself? Lie. The dog is placing an egg? No. Only chickens lay things.",
    "explanation": "Use 'lie' for the action of reclining yourself or an animal reclining itself.",
    "image": "https://loremflickr.com/800/600/dog?lock=169",
    "category": "The Foundation"
  },
  {
    "rule": "Principal vs Principle",
    "sentence": "The high school ________ retired after 40 years.",
    "options": [
      "principal",
      "principle"
    ],
    "correct": "principal",
    "sarcastic_comment": "Is he your PAL? Yes? Principal. Is it a rule? No? Then it's the pal.",
    "explanation": "'Principal' is the person with the highest authority or most important position in an organization.",
    "image": "https://loremflickr.com/800/600/authority?lock=170",
    "category": "The Foundation"
  },
  {
    "rule": "Than vs Then",
    "sentence": "I would much rather go to the beach ________ the gym.",
    "options": [
      "than",
      "then"
    ],
    "correct": "than",
    "sarcastic_comment": "Comparing two things? Use 'than.' Chronology? Use 'then.'",
    "explanation": "'Than' is a conjunction used in comparisons.",
    "image": "https://loremflickr.com/800/600/beach?lock=171",
    "category": "The Foundation"
  },
  {
    "rule": "Passed vs Past",
    "sentence": "A fast car ________ me on the narrow road.",
    "options": [
      "passed",
      "past"
    ],
    "correct": "passed",
    "sarcastic_comment": "It's a verb! He PASS-ED you. Action. Verb form.",
    "explanation": "'Passed' is the past tense of 'to pass'.",
    "image": "https://loremflickr.com/800/600/narrow?lock=172",
    "category": "The Foundation"
  },
  {
    "rule": "Brake vs Break",
    "sentence": "You really need a ________ from all this studying.",
    "options": [
      "brake",
      "break"
    ],
    "correct": "break",
    "sarcastic_comment": "A pause? Break. Stopping the car? Brake.",
    "explanation": "A 'break' is a pause in work or activity.",
    "image": "https://loremflickr.com/800/600/study?lock=173",
    "category": "The Foundation"
  },
  {
    "rule": "Canvas vs Canvass",
    "sentence": "The massive tent was made of durable ________.",
    "options": [
      "canvas",
      "canvass"
    ],
    "correct": "canvas",
    "sarcastic_comment": "Cloth? One 'S'. Searching for votes? Two 'S's.",
    "explanation": "'Canvas' is a strong, coarse unbleached cloth.",
    "image": "https://loremflickr.com/800/600/tent?lock=174",
    "category": "The Foundation"
  },
  {
    "rule": "Council vs Counsel",
    "sentence": "The student ________ organized the winter dance.",
    "options": [
      "council",
      "counsel"
    ],
    "correct": "council",
    "sarcastic_comment": "A group? Council. Advice? Counsel.",
    "explanation": "A 'council' is an advisory, deliberative, or administrative body of people.",
    "image": "https://loremflickr.com/800/600/dance?lock=175",
    "category": "The Foundation"
  },
  {
    "rule": "Complacent vs Complaisant",
    "sentence": "Success can make people ________ and prone to mistakes.",
    "options": [
      "complacent",
      "complaisant"
    ],
    "correct": "complacent",
    "sarcastic_comment": "Smug and lazy? Complacent. Eager to help? Complaisant. Don't be the lazy one.",
    "explanation": "'Complacent' means showing smug or uncritical satisfaction with oneself or one's achievements.",
    "image": "https://loremflickr.com/800/600/mistakes?lock=176",
    "category": "The Foundation"
  },
  {
    "rule": "Flaunt vs Flout",
    "sentence": "They chose to ________ the safety regulations for a thrill.",
    "options": [
      "flaunt",
      "flout"
    ],
    "correct": "flout",
    "sarcastic_comment": "Disregard a rule? Flout. Show off a watch? Flaunt.",
    "explanation": "'Flout' means to openly disregard (a rule, law, or convention).",
    "image": "https://loremflickr.com/800/600/thrill?lock=177",
    "category": "The Foundation"
  },
  {
    "rule": "Amoral vs Immoral",
    "sentence": "A machine is ________; it possesses no inherent sense of right or wrong.",
    "options": [
      "amoral",
      "immoral"
    ],
    "correct": "amoral",
    "sarcastic_comment": "Completely lacking a moral sense? Amoral. Violating a known moral code? Immoral. Computers don't have codes; they have bits.",
    "explanation": "'Amoral' means lacking a moral sense; unconcerned with the rightness or wrongness of something.",
    "image": "https://loremflickr.com/800/600/machine?lock=178",
    "category": "The Foundation"
  },
  {
    "rule": "Appraise vs Apprise",
    "sentence": "The manager will ________ the team of the upcoming changes.",
    "options": [
      "appraise",
      "apprise"
    ],
    "correct": "apprise",
    "sarcastic_comment": "Inform? Apprise. Value? Appraise. Inform them!",
    "explanation": "'Apprise' means to inform or tell someone.",
    "image": "https://loremflickr.com/800/600/upcoming?lock=179",
    "category": "The Foundation"
  },
  {
    "rule": "Sensual vs Sensuous",
    "sentence": "The velvet fabric felt incredibly ________ against her skin.",
    "options": [
      "sensual",
      "sensuous"
    ],
    "correct": "sensuous",
    "sarcastic_comment": "Aesthetically pleasing to the senses? Sensuous. Physically erotic? Sensual. Let's stick with the aesthetic texture here.",
    "explanation": "'Sensuous' means relating to or affecting the senses rather than the intellect.",
    "image": "https://loremflickr.com/800/600/velvet?lock=180",
    "category": "The Foundation"
  },
  {
    "rule": "Ingenious vs Ingenuous",
    "sentence": "That was an ________ solution to a very messy problem!",
    "options": [
      "ingenious",
      "ingenuous"
    ],
    "correct": "ingenious",
    "sarcastic_comment": "Genius? Ingenious. Naive? Ingenuous.",
    "explanation": "'Ingenious' means clever, original, and inventive.",
    "image": "https://loremflickr.com/800/600/genius?lock=181",
    "category": "The Foundation"
  },
  {
    "rule": "Who vs Whom",
    "sentence": "The boy ________ won the race is my younger brother.",
    "options": [
      "who",
      "whom"
    ],
    "correct": "who",
    "sarcastic_comment": "Is he a 'he' or a 'him'? He won. So it's 'who.' This isn't rocket science, but NASA-level punctuation errors exist, so stay sharp.",
    "explanation": "'Who' is the subject of the verb 'won'.",
    "image": "https://loremflickr.com/800/600/race?lock=190",
    "category": "The Foundation"
  },
  {
    "rule": "Affect vs Effect",
    "sentence": "We cannot let our emotions ________ our professional judgment.",
    "options": [
      "affect",
      "effect"
    ],
    "correct": "affect",
    "sarcastic_comment": "Action! Change! Verb! Affect. Unless you're trying to 'effect' a change, which you're not. Use the 'A'.",
    "explanation": "'Affect' is the verb meaning to influence.",
    "image": "https://loremflickr.com/800/600/emotions?lock=191",
    "category": "The Foundation"
  },
  {
    "rule": "Compliment vs Complement",
    "sentence": "That blue tie will ________ your suit perfectly.",
    "options": [
      "compliment",
      "complement"
    ],
    "correct": "complement",
    "sarcastic_comment": "They complete each other. The tie doesn't have a mouth to give a compliment.",
    "explanation": "'Complement' means to complete or enhance.",
    "image": "https://loremflickr.com/800/600/tie?lock=192",
    "category": "The Foundation"
  },
  {
    "rule": "Lose vs Loose",
    "sentence": "Did you ________ your car keys in the grass?",
    "options": [
      "lose",
      "loose"
    ],
    "correct": "lose",
    "sarcastic_comment": "You lost an 'O', and you lost your keys. One 'O' for the loser.",
    "explanation": "'Lose' is the verb meaning to misplace.",
    "image": "https://loremflickr.com/800/600/keys?lock=193",
    "category": "The Foundation"
  },
  {
    "rule": "Their vs There vs They're",
    "sentence": "The children left ________ toys scattered everywhere.",
    "options": [
      "Their",
      "There",
      "They're"
    ],
    "correct": "Their",
    "sarcastic_comment": "The toys belong to them. Possession needs 'Their.' Keep your eyes on the prize.",
    "explanation": "'Their' is the possessive pronoun.",
    "image": "https://loremflickr.com/800/600/toys?lock=194",
    "category": "The Foundation"
  },
  {
    "rule": "Its vs It's",
    "sentence": "The dog wagged ________ tail in excitement.",
    "options": [
      "its",
      "it's"
    ],
    "correct": "its",
    "sarcastic_comment": "Is it 'it is tail'? No. That would be weird. Possession has no apostrophe for 'its'.",
    "explanation": "Its = Belonging to it. It's = It is.",
    "image": "https://loremflickr.com/800/600/tail?lock=195",
    "category": "The Foundation"
  },
  {
    "rule": "Its vs It's",
    "sentence": "________ raining cats and dogs outside right now.",
    "options": [
      "Its",
      "It's"
    ],
    "correct": "It's",
    "sarcastic_comment": "It IS raining. Contraction. Use the apostrophe or Grandpa gets it.",
    "explanation": "It's = It is.",
    "image": "https://loremflickr.com/800/600/rain?lock=196",
    "category": "The Foundation"
  },
  {
    "rule": "Your vs You're",
    "sentence": "________ going to love the surprise we planned!",
    "options": [
      "Your",
      "You're"
    ],
    "correct": "You're",
    "sarcastic_comment": "You ARE going. Contraction. Please, for the love of all that is holy.",
    "explanation": "You're = You are.",
    "image": "https://loremflickr.com/800/600/surprise?lock=197",
    "category": "The Foundation"
  },
  {
    "rule": "Your vs You're",
    "sentence": "Is that ________ brand new car in the driveway?",
    "options": [
      "your",
      "you're"
    ],
    "correct": "your",
    "sarcastic_comment": "Does the car belong to you? Yes. Possession. 'Your.' No apostrophe needed.",
    "explanation": "Your = Belonging to you.",
    "image": "https://loremflickr.com/800/600/driveway?lock=198",
    "category": "The Foundation"
  },
  {
    "rule": "Whose vs Who's",
    "sentence": "________ cell phone is ringing during the movie?",
    "options": [
      "Whose",
      "Who's"
    ],
    "correct": "Whose",
    "sarcastic_comment": "Who IS cell phone? No. Possession. Whose.",
    "explanation": "Whose = Belonging to whom.",
    "image": "https://loremflickr.com/800/600/ringing?lock=199",
    "category": "The Foundation"
  },
  {
    "rule": "Whose vs Who's",
    "sentence": "________ going to take responsibility for this mess?",
    "options": [
      "Whose",
      "Who's"
    ],
    "correct": "Who's",
    "sarcastic_comment": "Who IS going? Contraction. Use the apostrophe.",
    "explanation": "Who's = Who is.",
    "image": "https://loremflickr.com/800/600/mess?lock=200",
    "category": "The Foundation"
  },
  {
    "rule": "Accept vs Except",
    "sentence": "I gracefully ________ your kind apology.",
    "options": [
      "accept",
      "except"
    ],
    "correct": "accept",
    "sarcastic_comment": "A=Accept/Agree. E=Exclude. You're agreeing to the apology.",
    "explanation": "Accept = To receive. Except = Excluding.",
    "image": "https://loremflickr.com/800/600/apology?lock=201",
    "category": "The Foundation"
  },
  {
    "rule": "Accept vs Except",
    "sentence": "Everyone went to the party ________ for poor John.",
    "options": [
      "accept",
      "except"
    ],
    "correct": "except",
    "sarcastic_comment": "Excluding him? Except. Start with E.",
    "explanation": "Except = Excluding.",
    "image": "https://loremflickr.com/800/600/unhappy?lock=202",
    "category": "The Foundation"
  },
  {
    "rule": "Beside vs Besides",
    "sentence": "Please come and sit down ________ me on the bench.",
    "options": [
      "beside",
      "besides"
    ],
    "correct": "beside",
    "sarcastic_comment": "Next to? Beside. In addition to? Besides. You want him next to you, not in addition to you.",
    "explanation": "Beside = Next to.",
    "image": "https://loremflickr.com/800/600/bench?lock=203",
    "category": "The Foundation"
  },
  {
    "rule": "Beside vs Besides",
    "sentence": "________ being a doctor, she is also a world-class pilot.",
    "options": [
      "Beside",
      "Besides"
    ],
    "correct": "Besides",
    "sarcastic_comment": "In addition to? Plus? Extra S for besides.",
    "explanation": "Besides = In addition to.",
    "image": "https://loremflickr.com/800/600/pilot?lock=204",
    "category": "The Foundation"
  },
  {
    "rule": "Farther vs Further",
    "sentence": "We need to walk much ________ to find the trailhead.",
    "options": [
      "farther",
      "further"
    ],
    "correct": "farther",
    "sarcastic_comment": "Physical distance? Farther (has the word 'far'). Metaphorical? Further. This is a real walk.",
    "explanation": "Farther = Physical distance. Further = Metaphorical distance/addition.",
    "image": "https://loremflickr.com/800/600/trail?lock=205",
    "category": "The Foundation"
  },
  {
    "rule": "Farther vs Further",
    "sentence": "Let's discuss this matter ________ at tomorrow's meeting.",
    "options": [
      "farther",
      "further"
    ],
    "correct": "further",
    "sarcastic_comment": "Are we walking into the meeting? No. It's metaphorical. Further.",
    "explanation": "Further = Metaphorical distance or depth.",
    "image": "https://loremflickr.com/800/600/meeting?lock=206",
    "category": "The Foundation"
  },
  {
    "rule": "Less vs Fewer",
    "sentence": "There are ________ students in the class today than yesterday.",
    "options": [
      "less",
      "fewer"
    ],
    "correct": "fewer",
    "sarcastic_comment": "Can you count the students? Yes. (Unless you're very bad at math). Then use 'fewer.'",
    "explanation": "Fewer is for countable items. Less is for uncountable mass.",
    "image": "https://loremflickr.com/800/600/class?lock=207",
    "category": "The Foundation"
  },
  {
    "rule": "Less vs Fewer",
    "sentence": "I have ________ time to finish this project than I thought.",
    "options": [
      "less",
      "fewer"
    ],
    "correct": "less",
    "sarcastic_comment": "Can you count 'time'? No, you count minutes. So use 'less' for the general concept of time.",
    "explanation": "Less is for uncountable quantities (like time, water, or money).",
    "image": "https://loremflickr.com/800/600/time?lock=208",
    "category": "The Foundation"
  },
  {
    "rule": "The 'Thorn' in Ye Olde",
    "sentence": "In 'Ye Olde Shoppe,' the word 'Ye' was actually pronounced ________.",
    "options": [
      "The",
      "Yee"
    ],
    "correct": "The",
    "sarcastic_comment": "You're not a medieval peasant. It's 'The.' Stop trying to sound fancy.",
    "explanation": "The 'Y' in 'Ye Olde' is actually a dead letter called a 'Thorn' (þ). Early printing presses from Europe didn't have this character, so printers substituted it with a 'Y' because it looked somewhat similar in certain fonts. So, while it's written as 'Ye,' it was always meant to be pronounced as 'The.'",
    "image": "https://loremflickr.com/800/600/medieval?lock=150",
    "isLegendary": true,
    "category": "The Vault"
  },
  {
    "rule": "The Origin of O.K.",
    "sentence": "The term 'O.K.' stands for ________.",
    "options": [
      "Oll Korrect",
      "Old Kind"
    ],
    "correct": "Oll Korrect",
    "sarcastic_comment": "O.K.? More like O.K.-ish. It's 'Oll Korrect,' a 19th-century joke that survived for 150 years.",
    "explanation": "In 1839, a Bureau of Statistics report used 'O.K.' as a joke for 'Oll Korrect'. It became legendary during Martin Van Buren's campaign and stuck as one of the most used words globally.",
    "image": "https://loremflickr.com/800/600/ok?lock=151",
    "isLegendary": true,
    "category": "The Vault"
  },
  {
    "rule": "The Word 'Robot'",
    "sentence": "The word 'Robot' comes from a Czech word meaning ________.",
    "options": [
      "forced labor",
      "metal man"
    ],
    "correct": "forced labor",
    "sarcastic_comment": "Robots aren't just gadgets; they're literal 'forced laborers.' Remember that when they take over.",
    "explanation": "The term 'Robot' was first used in the 1920 play 'R.U.R.' by Karel Čapek. It was coined by his brother, Josef, from the Czech word 'robota,' which historically meant the forced labor of serfs.",
    "image": "https://loremflickr.com/800/600/robot?lock=152",
    "isLegendary": true,
    "category": "The Vault"
  },
  {
    "rule": "The 'Clew' to the Labyrinth",
    "sentence": "The word 'Clue' originally meant a ________.",
    "options": [
      "ball of thread",
      "hidden key"
    ],
    "correct": "ball of thread",
    "sarcastic_comment": "Follow the thread. Literally. That's where 'clue' comes from.",
    "explanation": "In Greek mythology, Theseus used a 'clew' (a ball of thread/yarn) to find his way out of the Minotaur's Labyrinth. Over centuries, 'clew' became 'clue' and shifted from literal string to information.",
    "image": "https://loremflickr.com/800/600/labyrinth?lock=153",
    "isLegendary": true,
    "category": "The Vault"
  },
  {
    "rule": "Silly History",
    "sentence": "In Old English, the word 'Silly' actually meant ________.",
    "options": [
      "blessed",
      "foolish"
    ],
    "correct": "blessed",
    "sarcastic_comment": "You're so silly. Wait, stop smiling. In the modern sense, not the holy one.",
    "explanation": "The word 'silly' (originally 'sælig') once meant 'blessed' or 'pious.' Over time, its meaning shifted to 'innocent,' then 'weak,' and finally to 'foolish.'",
    "image": "https://loremflickr.com/800/600/angel?lock=154",
    "isLegendary": true,
    "category": "The Vault"
  },
  {
    "rule": "The Interrobang",
    "sentence": "The ________ is a non-standard punctuation mark that combines a question mark and an exclamation point.",
    "options": [
      "interrobang",
      "quesclamation"
    ],
    "correct": "interrobang",
    "sarcastic_comment": "Interrobang. It sounds like a bad 80s action movie, but it's the punctuation mark of our digital age.",
    "explanation": "Proposed in 1962, the interrobang (‽) combines 'interrogatio' (question) and 'bang' (exclamation). It's the ultimate 'What?!' mark.",
    "image": "https://loremflickr.com/800/600/surprise?lock=155",
    "isLegendary": true,
    "category": "The Vault"
  },
  {
    "rule": "Goodbye's Secret",
    "sentence": "The word 'Goodbye' is a contraction of the phrase ________.",
    "options": [
      "God be with ye",
      "Good day to you"
    ],
    "correct": "God be with ye",
    "sarcastic_comment": "Goodbye! I'm literally blessing you as I leave. You're welcome.",
    "explanation": "The word 'Goodbye' appeared in the late 16th century as a contraction of 'God be with ye.' Over centuries it slurred into its current form.",
    "image": "https://loremflickr.com/800/600/church?lock=156",
    "isLegendary": true,
    "category": "The Vault"
  },
  {
    "rule": "Pants History",
    "sentence": "The word 'Pants' is short for 'Pantaloons,' named after a character from ________ comedy.",
    "options": [
      "Italian",
      "French"
    ],
    "correct": "Italian",
    "sarcastic_comment": "Fancy Italian comedy? No, just your trousers. Put them on one leg at a time.",
    "explanation": "The word 'pants' is a shortening of 'pantaloons,' which comes from 'Pantaleone,' a thin, greedy, and foolish old man character in Italian 'Commedia dell'arte.' He wore tight-fitting trousers that became so popular they took his name.",
    "image": "https://loremflickr.com/800/600/pants?lock=157",
    "isLegendary": true,
    "category": "The Vault"
  },
  {
    "rule": "Etymology of Sarcasm",
    "sentence": "The word 'Sarcasm' literally means ________ in Greek.",
    "options": [
      "to tear flesh",
      "to speak truth"
    ],
    "correct": "to tear flesh",
    "sarcastic_comment": "I'm not being mean; I'm just practicing ancient Greek 'flesh-tearing.' It's culture.",
    "explanation": "The word 'sarcasm' comes from the Greek 'sarkazein,' which literally means 'to tear flesh like a dog.' It implies a bitter, cutting remark that's intended to hurt. Now you know why it feels so good.",
    "image": "https://loremflickr.com/800/600/dog?lock=158",
    "isLegendary": true,
    "category": "The Vault"
  },
  {
    "rule": "The Viking 'They'",
    "sentence": "The words 'They,' 'Their,' and 'Them' were actually imported from ________.",
    "options": [
      "Old Norse",
      "Latin"
    ],
    "correct": "Old Norse",
    "sarcastic_comment": "Thank a Viking. They invaded, they pillaged, and they gave us plural pronouns. Fair trade?",
    "explanation": "In Old English, the words for 'they' sounded very similar to 'he' and 'her,' causing massive confusion. When the Vikings invaded Britain, they brought their own pronouns ('þeir,' 'þeira,' 'þeim'). English speakers liked them so much they kept them to avoid the pronoun headaches.",
    "image": "https://loremflickr.com/800/600/viking?lock=159",
    "isLegendary": true,
    "category": "The Vault"
  },
  {
    "rule": "A Sneezing Blessing",
    "sentence": "Saying 'God bless you' after a sneeze reportedly started during the ________.",
    "options": [
      "Plague",
      "Renaissance"
    ],
    "correct": "Plague",
    "sarcastic_comment": "Bless you! No, seriously, it was for the plague. Stay away.",
    "explanation": "In 590 AD, during a plague outbreak in Rome, Pope Gregory I ordered unceasing prayer and light-hearted blessings for those who sneezed, as sneezing was often an early symptom of the plague. It was quite literally a prayer for survival.",
    "image": "https://loremflickr.com/800/600/health?lock=160",
    "isLegendary": true,
    "category": "The Vault"
  },
  {
    "rule": "Oscar Wilde's Last Words",
    "sentence": "Famous Last Words",
    "options": [],
    "correct": "",
    "explanation": "Oscar Wilde spent his final days in a cheap Paris hotel, broken in health and spirit after his imprisonment in England. Even on his deathbed in November 1900, his legendary wit remained sharp. Looking at the gaudy, peeling wallpaper of the Hôtel d'Alsace, he reportedly remarked: 'My wallpaper and I are fighting a duel to the death. One or other of us has to go.' He died on November 30, with the wallpaper, unfortunately, outlasting him.",
    "image": "https://loremflickr.com/800/600/wallpaper?lock=112",
    "isLegendary": true,
    "category": "The Vault"
  },
  {
    "rule": "The Subjunctive Mood (Elite)",
    "sentence": "If I ________ you, I would study harder.",
    "options": [
      "were",
      "was"
    ],
    "correct": "were",
    "sarcastic_comment": "Subjunctive mood, darling. Were, not was. Try to keep up.",
    "explanation": "In hypothetical or contrary-to-fact statements (subjunctive mood), 'were' is used for all subjects, even 'I'.",
    "image": "https://loremflickr.com/800/600/scholar?lock=301",
    "isElite": true,
    "category": "The Arsenal"
  },
  {
    "rule": "Who vs. Whom (Elite)",
    "sentence": "To ________ should I address this letter?",
    "options": [
      "whom",
      "who"
    ],
    "correct": "whom",
    "sarcastic_comment": "It's the object of the preposition. Use 'whom'. It's basic etiquette, really.",
    "explanation": "Use 'whom' as the object of a verb or preposition. A quick trick: if you can answer with 'him', use 'whom'.",
    "image": "https://loremflickr.com/800/600/letter?lock=302",
    "isElite": true,
    "category": "The Arsenal"
  },
  {
    "rule": "Dangling Participles (Elite)",
    "sentence": "Walking down the street, ________.",
    "options": [
      "the trees were beautiful",
      "I saw the beautiful trees"
    ],
    "correct": "I saw the beautiful trees",
    "sarcastic_comment": "Unless the trees were walking, you have a dangling participle. Fix it.",
    "explanation": "A participle phrase at the beginning of a sentence must describe the subject that immediately follows. If the trees aren't walking, they can't be the subject.",
    "image": "https://loremflickr.com/800/600/walking?lock=303",
    "isElite": true,
    "category": "The Arsenal"
  },
  {
    "rule": "Power Word: Eloquent",
    "sentence": "She delivered an ________ speech that moved the audience to tears.",
    "options": [
      "Eloquent",
      "Loquacious",
      "Euphemistic"
    ],
    "correct": "Eloquent",
    "explanation": "Fluent or persuasive in speaking or writing.",
    "sarcastic_comment": "Vocabulary is power. Eloquent means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=300",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈɛləkwənt/",
    "usage": "The ambassador's eloquent plea for peace left the entire assembly in contemplative silence.",
    "nuance": {
      "Loquacious": "Loquacious means talkative; someone can be loquacious without being persuasive or elegant like an eloquent speaker.",
      "Euphemistic": "Euphemistic involves using mild words to avoid offensive ones; it's about politeness, not persuasiveness."
    }
  },
  {
    "rule": "Power Word: Perspicacious",
    "sentence": "His ________ observations allowed him to see the flaw in the plan.",
    "options": [
      "Pernicious",
      "Perspicacious",
      "Perspicuous"
    ],
    "correct": "Perspicacious",
    "explanation": "Having a ready insight into and understanding of things.",
    "sarcastic_comment": "Vocabulary is power. Perspicacious means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=301",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˌpəːspɪˈkeɪʃəs/",
    "usage": "His perspicacious analysis of the market trends allowed the firm to avoid the impending crash."
  },
  {
    "rule": "Power Word: Ubiquitous",
    "sentence": "Mobile phones are ________ in modern society.",
    "options": [
      "Equivocal",
      "Ubiquitous",
      "Ambiguous"
    ],
    "correct": "Ubiquitous",
    "explanation": "Present, appearing, or found everywhere.",
    "sarcastic_comment": "Vocabulary is power. Ubiquitous means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=302",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/juːˈbɪkwɪtəs/",
    "usage": "Smartphones have become a ubiquitous feature of modern life, found in the pockets of billions.",
    "nuance": {
      "Ambiguous": "Ambiguous means open to more than one interpretation; it refers to lack of clarity, not frequency of presence.",
      "Equivocal": "Equivocal describes something uncertain or intentionally vague; it's related to speech, not location."
    }
  },
  {
    "rule": "Power Word: Ephemeral",
    "sentence": "The beauty of a sunset is ________, lasting only a few minutes.",
    "options": [
      "Empirical",
      "Ethereal",
      "Ephemeral"
    ],
    "correct": "Ephemeral",
    "explanation": "Lasting for a very short time.",
    "sarcastic_comment": "Vocabulary is power. Ephemeral means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=303",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ɪˈfɛmərəl/",
    "usage": "The beauty of the cherry blossoms is famously ephemeral, lasting only a few precious days.",
    "nuance": {
      "Ethereal": "Ethereal describes something delicate and perfect, but it doesn't inherently mean it will disappear quickly.",
      "Empirical": "Empirical refers to something based on observation or experience; it's a scientific term for evidence."
    }
  },
  {
    "rule": "Power Word: Meticulous",
    "sentence": "He was ________ about keeping his records in perfect order.",
    "options": [
      "Meticulous",
      "Mendacious",
      "Meretricious"
    ],
    "correct": "Meticulous",
    "explanation": "Showing great attention to detail; very careful and precise.",
    "sarcastic_comment": "Vocabulary is power. Meticulous means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=304",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/mɪˈtɪkjʊləs/",
    "usage": "The restorer spent months in meticulous effort, cleaning every inch of the ancient fresco.",
    "nuance": {
      "Meretricious": "Meretricious describes something that looks attractive but has no value; it's a critical term for fake quality.",
      "Mendacious": "Mendacious is a formal word for dishonest or untruthful; it has nothing to do with precision."
    }
  },
  {
    "rule": "Power Word: Anachronism",
    "sentence": "Seeing a character check their smartphone in a medieval movie is a glaring ________.",
    "options": [
      "Anachronism",
      "Anachronistic",
      "Antagonism"
    ],
    "correct": "Anachronism",
    "explanation": "A thing belonging or appropriate to a period other than that in which it exists.",
    "sarcastic_comment": "Vocabulary is power. Anachronism means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=305",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/əˈnakrəˌnɪz(ə)m/",
    "usage": "The appearance of a smartphone in the 19th-century period drama was a glaring anachronism."
  },
  {
    "rule": "Power Word: Benevolent",
    "sentence": "The ________ billionaire donated millions to create a new park.",
    "options": [
      "Beneficiary",
      "Malevolent",
      "Benevolent"
    ],
    "correct": "Benevolent",
    "explanation": "Well meaning and kindly.",
    "sarcastic_comment": "Vocabulary is power. Benevolent means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=306",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/bəˈnɛvələnt/",
    "usage": "The benevolent stranger donated a significant portion of his wealth to the local children's hospital."
  },
  {
    "rule": "Power Word: Capricious",
    "sentence": "The weather in this region is ________, changing from sun to rain in minutes.",
    "options": [
      "Capricious",
      "Captious",
      "Precocious"
    ],
    "correct": "Capricious",
    "explanation": "Given to sudden and unaccountable changes of mood or behavior.",
    "sarcastic_comment": "Vocabulary is power. Capricious means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=307",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/kəˈprɪʃəs/",
    "usage": "The region's capricious climate can shift from blazing sun to a torrential downpour in minutes.",
    "nuance": {
      "Captious": "Captious refers to a person who is overly critical or fond of finding fault, not someone who changes their mind or behavior suddenly.",
      "Precocious": "Precocious describes a child who has developed certain abilities or proclivities at an earlier age than usual."
    }
  },
  {
    "rule": "Power Word: Dichotomy",
    "sentence": "There is a clear ________ between the city's rich and poor neighborhoods.",
    "options": [
      "Doxology",
      "Anatomy",
      "Dichotomy"
    ],
    "correct": "Dichotomy",
    "explanation": "A division or contrast between two things that are or are represented as being opposed or entirely different.",
    "sarcastic_comment": "Vocabulary is power. Dichotomy means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=308",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/dʌɪˈkɒtəmi/",
    "usage": "The philosopher's work explores the strict dichotomy between the physical body and the eternal soul."
  },
  {
    "rule": "Power Word: Enervate",
    "sentence": "The intense heat of the desert can ________ even the most seasoned traveler.",
    "options": [
      "Enervate",
      "Elevate",
      "Inervate"
    ],
    "correct": "Enervate",
    "explanation": "Cause (someone) to feel drained of energy or vitality; weaken.",
    "sarcastic_comment": "Vocabulary is power. Enervate means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=309",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈɛnəveɪt/",
    "usage": "The intense humidity of the tropical afternoon seemed to enervate even the most energetic travelers."
  },
  {
    "rule": "Power Word: Fastidious",
    "sentence": "She was so ________ about cleanliness that she washed her hands every hour.",
    "options": [
      "Facetious",
      "Fastidious",
      "Factitious"
    ],
    "correct": "Fastidious",
    "explanation": "Very attentive to and concerned about accuracy and detail.",
    "sarcastic_comment": "Vocabulary is power. Fastidious means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=310",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/faˈstɪdɪəs/",
    "usage": "He was so fastidious about his workspace that not a single paper was ever out of its designated folder."
  },
  {
    "rule": "Power Word: Garrulous",
    "sentence": "A ________ neighbor can be delightful, unless you're in a hurry.",
    "options": [
      "Grumbling",
      "Garrulous",
      "Gregarious"
    ],
    "correct": "Garrulous",
    "explanation": "Excessively talkative, especially on trivial matters.",
    "sarcastic_comment": "Vocabulary is power. Garrulous means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=311",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈɡarələs/",
    "usage": "The garrulous fellow at the bus stop told me his entire life story before my ride even arrived."
  },
  {
    "rule": "Power Word: Hedonist",
    "sentence": "He was a committed ________, spending all his money on fine wine and travel.",
    "options": [
      "Heretic",
      "Hedonist",
      "Hierophant"
    ],
    "correct": "Hedonist",
    "explanation": "A person who believes that the pursuit of pleasure is the most important thing in life.",
    "sarcastic_comment": "Vocabulary is power. Hedonist means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=312",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈhiːd(ə)nɪst/",
    "usage": "An unrepentant hedonist, he spent his inheritance on fine wines, rare delicacies, and luxury travel."
  },
  {
    "rule": "Power Word: Impetuous",
    "sentence": "Her ________ decision to quit her job surprised everyone.",
    "options": [
      "Impregnable",
      "Impetus",
      "Impetuous"
    ],
    "correct": "Impetuous",
    "explanation": "Acting or done quickly and without thought or care.",
    "sarcastic_comment": "Vocabulary is power. Impetuous means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=313",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ɪmˈpɛtʃʊəs/",
    "usage": "His impetuous decision to quit his job and join a rock band was greeted with shock by his family."
  },
  {
    "rule": "Power Word: Juxtapose",
    "sentence": "The exhibit ________s modern art with ancient sculptures.",
    "options": [
      "Juxtapose",
      "Transpose",
      "Interpose"
    ],
    "correct": "Juxtapose",
    "explanation": "Place or deal with close together for contrasting effect.",
    "sarcastic_comment": "Vocabulary is power. Juxtapose means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=314",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˌdʒʌkstəˈpəʊz/",
    "usage": "The exhibit was designed to juxtapose modern industrial sculptures with delicate Renaissance paintings."
  },
  {
    "rule": "Power Word: Laconic",
    "sentence": "His ________ reply of 'No' ended the conversation immediately.",
    "options": [
      "Laconic",
      "Loquacious",
      "Laconian"
    ],
    "correct": "Laconic",
    "explanation": "Using very few words.",
    "sarcastic_comment": "Vocabulary is power. Laconic means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=315",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ləˈkɒnɪk/",
    "usage": "Known for his laconic style, the captain's only response to the long list of demands was a simple 'No'."
  },
  {
    "rule": "Power Word: Magnanimous",
    "sentence": "He was ________ in victory, praising his opponent's hard work.",
    "options": [
      "Magnanimous",
      "Malignant",
      "Magniloquent"
    ],
    "correct": "Magnanimous",
    "explanation": "Generous or forgiving, especially towards a rival or less powerful person.",
    "sarcastic_comment": "Vocabulary is power. Magnanimous means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=316",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/maɡˈnanɪməs/",
    "usage": "In a magnanimous gesture, the winner shared the prize money with his struggling competitors."
  },
  {
    "rule": "Power Word: Nefarious",
    "sentence": "The villain's ________ plot involved hacking the city's power grid.",
    "options": [
      "Nefarious",
      "Precarious",
      "Vicarious"
    ],
    "correct": "Nefarious",
    "explanation": "Wicked or criminal.",
    "sarcastic_comment": "Vocabulary is power. Nefarious means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=317",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/nɪˈfɛːrɪəs/",
    "usage": "The villain's nefarious plot involved poisoning the city's water supply to demand a massive ransom."
  },
  {
    "rule": "Power Word: Obsequious",
    "sentence": "The waiters were almost ________ in their efforts to please the royal guests.",
    "options": [
      "Obsequies",
      "Ubiquitous",
      "Obsequious"
    ],
    "correct": "Obsequious",
    "explanation": "Obedient or attentive to an excessive or servile degree.",
    "sarcastic_comment": "Vocabulary is power. Obsequious means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=318",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/əbˈsiːkwɪəs/",
    "usage": "The waiter's obsequious behavior, while meant to be helpful, actually made the diners feel quite awkward."
  },
  {
    "rule": "Power Word: Paradigm",
    "sentence": "The shift to renewable energy represents a new ________ in economic development.",
    "options": [
      "Paragon",
      "Paradox",
      "Paradigm"
    ],
    "correct": "Paradigm",
    "explanation": "A typical example or pattern of something; a model.",
    "sarcastic_comment": "Vocabulary is power. Paradigm means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=319",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈparədʌɪm/",
    "usage": "The shift to remote work has represented a major paradigm change for the global corporate world."
  },
  {
    "rule": "Power Word: Quintessential",
    "sentence": "He is the ________ English gentleman, always polite and well-dressed.",
    "options": [
      "Quiescent",
      "Quintet",
      "Quintessential"
    ],
    "correct": "Quintessential",
    "explanation": "Representing the most perfect or typical example of a quality or class.",
    "sarcastic_comment": "Vocabulary is power. Quintessential means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=320",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˌkwɪntɪˈsɛnʃ(ə)l/",
    "usage": "The small, white-washed cottage with its thatched roof was the quintessential image of rural England."
  },
  {
    "rule": "Power Word: Reticent",
    "sentence": "She was ________ about sharing her personal life with colleagues.",
    "options": [
      "Reticent",
      "Reluctant",
      "Reciting"
    ],
    "correct": "Reticent",
    "explanation": "Not revealing one's thoughts or feelings readily.",
    "sarcastic_comment": "Vocabulary is power. Reticent means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=321",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈrɛtɪs(ə)nt/",
    "usage": "Despite several interviews, the witness remained reticent about the details of the crime."
  },
  {
    "rule": "Power Word: Sycophant",
    "sentence": "The CEO was surrounded by ________s who never disagreed with him.",
    "options": [
      "Sycophant",
      "Syncopation",
      "Symposium"
    ],
    "correct": "Sycophant",
    "explanation": "A person who acts obsequiously towards someone important in order to gain advantage.",
    "sarcastic_comment": "Vocabulary is power. Sycophant means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=322",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈsɪkəfant/",
    "usage": "The king was surrounded by sycophants who would never dare to tell him the harsh truth."
  },
  {
    "rule": "Power Word: Taciturn",
    "sentence": "He was a ________ man, preferring the company of his books to people.",
    "options": [
      "Taciturn",
      "Tacit",
      "Tactful"
    ],
    "correct": "Taciturn",
    "explanation": "Reserved or uncommunicative in speech; saying little.",
    "sarcastic_comment": "Vocabulary is power. Taciturn means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=323",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈtasɪtəːn/",
    "usage": "His taciturn nature was often mistaken for arrogance, but he was simply a very private man."
  },
  {
    "rule": "Power Word: Venerate",
    "sentence": "The community continues to ________ the elders for their wisdom.",
    "options": [
      "Venerate",
      "Venerable",
      "Venal"
    ],
    "correct": "Venerate",
    "explanation": "Regard with great respect; revere.",
    "sarcastic_comment": "Vocabulary is power. Venerate means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=324",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈvɛnəreɪt/",
    "usage": "In many Eastern cultures, it is essential to venerate one's elders as a sign of respect and wisdom.",
    "nuance": {
      "Venal": "Venal refers to someone open to bribery; it is a negative trait, whereas 'venerate' is a positive action.",
      "Venerable": "Venerable is an adjective for someone respected; the sentence requires a verb for the act of showing respect."
    }
  },
  {
    "rule": "Power Word: Wary",
    "sentence": "Be ________ of strangers offering free gifts on the street.",
    "options": [
      "Wiry",
      "Wary",
      "Weary"
    ],
    "correct": "Wary",
    "explanation": "Feeling or showing caution about possible dangers or problems.",
    "sarcastic_comment": "Vocabulary is power. Wary means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=325",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈwɛːri/",
    "usage": "The experienced diplomat was wary of the sudden change in tone from the hostile neighboring country."
  },
  {
    "rule": "Power Word: Zealot",
    "sentence": "He became an environmental ________, living completely off the grid.",
    "options": [
      "Zenith",
      "Zealot",
      "Zephyr"
    ],
    "correct": "Zealot",
    "explanation": "A person who is fanatical and uncompromising in pursuit of their religious, political, or other ideals.",
    "sarcastic_comment": "Vocabulary is power. Zealot means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=326",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈzɛlət/",
    "usage": "The religious zealot was willing to cross any line to demonstrate his devotion to the cause."
  },
  {
    "rule": "Power Word: Abstain",
    "sentence": "He chose to ________ from voting in the local elections.",
    "options": [
      "Abstain",
      "Abstruse",
      "Absolve"
    ],
    "correct": "Abstain",
    "explanation": "Restrain oneself from doing or enjoying something.",
    "sarcastic_comment": "Vocabulary is power. Abstain means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=327",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/əbˈsteɪn/",
    "usage": "The monk chose to abstain from all worldly pleasures in his pursuit of spiritual enlightenment."
  },
  {
    "rule": "Power Word: Candid",
    "sentence": "I was ________ about the risks involved in the new project.",
    "options": [
      "Candied",
      "Candor",
      "Candid"
    ],
    "correct": "Candid",
    "explanation": "Truthful and straightforward; frank.",
    "sarcastic_comment": "Vocabulary is power. Candid means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=328",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈkandɪd/",
    "usage": "The photographer captured a candid shot of the politician sharing a genuine laugh with a child."
  },
  {
    "rule": "Power Word: Dogmatic",
    "sentence": "The professor was so ________ that he refused to listen to any opposing views.",
    "options": [
      "Dormant",
      "Domestic",
      "Dogmatic"
    ],
    "correct": "Dogmatic",
    "explanation": "Inclined to lay down principles as undeniably true.",
    "sarcastic_comment": "Vocabulary is power. Dogmatic means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=329",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/dɒɡˈmatɪk/",
    "usage": "Her dogmatic approach to education left little room for students to explore their own creative ideas."
  },
  {
    "rule": "Power Word: Efficacy",
    "sentence": "Scientists are testing the ________ of the new vaccine.",
    "options": [
      "Efficiency",
      "Effigy",
      "Efficacy"
    ],
    "correct": "Efficacy",
    "explanation": "The ability to produce a desired or intended result.",
    "sarcastic_comment": "Vocabulary is power. Efficacy means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=330",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈɛfɪkəsi/",
    "usage": "Scientists are still conducting rigorous tests to determine the long-term efficacy of the new vaccine."
  },
  {
    "rule": "Power Word: Frugal",
    "sentence": "He led a ________ life, saving most of his earnings for retirement.",
    "options": [
      "Futile",
      "Fugitive",
      "Frugal"
    ],
    "correct": "Frugal",
    "explanation": "Sparing or economical with regard to money or food.",
    "sarcastic_comment": "Vocabulary is power. Frugal means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=331",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈfruːɡ(ə)l/",
    "usage": "By following a frugal budget, they were able to pay off their entire mortgage in under ten years."
  },
  {
    "rule": "Power Word: Guile",
    "sentence": "He used his ________ to convince the investors that his plan was foolproof.",
    "options": [
      "Guile",
      "Guild",
      "Guise"
    ],
    "correct": "Guile",
    "explanation": "Sly or cunning intelligence.",
    "sarcastic_comment": "Vocabulary is power. Guile means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=332",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ɡʌɪl/",
    "usage": "The trickster used his considerable guile to convince the investors to part with their money."
  },
  {
    "rule": "Power Word: Haughty",
    "sentence": "The ________ supervisor looked down on anyone with less experience.",
    "options": [
      "Halt",
      "Naughty",
      "Haughty"
    ],
    "correct": "Haughty",
    "explanation": "Arrogantly superior and disdainful.",
    "sarcastic_comment": "Vocabulary is power. Haughty means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=333",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈhɔːti/",
    "usage": "The haughty duchess refused to acknowledge anyone who did not share her aristocratic status."
  },
  {
    "rule": "Power Word: Immutable",
    "sentence": "The laws of physics are ________.",
    "options": [
      "Mutable",
      "Immuted",
      "Immutable"
    ],
    "correct": "Immutable",
    "explanation": "Unchanging over time or unable to be changed.",
    "sarcastic_comment": "Vocabulary is power. Immutable means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=334",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ɪˈmjuːtəb(ə)l/",
    "usage": "The laws of nature are often described as immutable, remaining constant throughout the universe."
  },
  {
    "rule": "Power Word: Inherent",
    "sentence": "There are ________ risks in any stock market investment.",
    "options": [
      "Incoherent",
      "Inherent",
      "Adherent"
    ],
    "correct": "Inherent",
    "explanation": "Existing in something as a permanent, essential, or characteristic attribute.",
    "sarcastic_comment": "Vocabulary is power. Inherent means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=335",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ɪnˈhɪər(ə)nt/",
    "usage": "There is an inherent risk in any surgery, no matter how routine the procedure may seem."
  },
  {
    "rule": "Power Word: Lethargic",
    "sentence": "The heavy meal made everyone feel ________ and ready for a nap.",
    "options": [
      "Liturgic",
      "Lethargic",
      "Lethal"
    ],
    "correct": "Lethargic",
    "explanation": "Affected by lethargy; sluggish and apathetic.",
    "sarcastic_comment": "Vocabulary is power. Lethargic means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=336",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ləˈθɑːdʒɪk/",
    "usage": "After the massive holiday feast, everyone felt too lethargic to even consider going for a walk."
  },
  {
    "rule": "Power Word: Mitigate",
    "sentence": "The company took steps to ________ the impact of the data breach.",
    "options": [
      "Mitigate",
      "Migrate",
      "Militate"
    ],
    "correct": "Mitigate",
    "explanation": "Make less severe, serious, or painful.",
    "sarcastic_comment": "Vocabulary is power. Mitigate means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=337",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈmɪtɪɡeɪt/",
    "usage": "The city planted thousands of trees in an effort to mitigate the 'heat island' effect during summer."
  },
  {
    "rule": "Power Word: Nonchalant",
    "sentence": "She gave a ________ shrug when asked about her award.",
    "options": [
      "Nonchalant",
      "Nondescript",
      "Noncommittal"
    ],
    "correct": "Nonchalant",
    "explanation": "Feeling or appearing casually calm and relaxed.",
    "sarcastic_comment": "Vocabulary is power. Nonchalant means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=338",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈnɒnʃ(ə)lənt/",
    "usage": "He shrugged with a nonchalant air, as if losing the championship didn't bother him at all."
  },
  {
    "rule": "Power Word: Opulent",
    "sentence": "The ________ ballroom was decorated with gold leaf and crystal chandeliers.",
    "options": [
      "Opulent",
      "Opulence",
      "Corpulent"
    ],
    "correct": "Opulent",
    "explanation": "Ostentatiously rich and luxurious or lavish.",
    "sarcastic_comment": "Vocabulary is power. Opulent means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=339",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈɒpjʊlənt/",
    "usage": "The opulent interior of the palace was filled with gold leaf, marble statues, and rare silk rugs."
  },
  {
    "rule": "Power Word: Perfidious",
    "sentence": "The king was betrayed by his ________ advisor.",
    "options": [
      "Fastidious",
      "Perspicacious",
      "Perfidious"
    ],
    "correct": "Perfidious",
    "explanation": "Deceitful and untrustworthy.",
    "sarcastic_comment": "Vocabulary is power. Perfidious means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=340",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/pəˈfɪdɪəs/",
    "usage": "The perfidious spy had been feeding false information to his superiors for several months."
  },
  {
    "rule": "Power Word: Pragmatic",
    "sentence": "She took a ________ approach to solving the budget crisis.",
    "options": [
      "Dogmatic",
      "Pragmatic",
      "Phlegmatic"
    ],
    "correct": "Pragmatic",
    "explanation": "Dealing with things sensibly and realistically.",
    "sarcastic_comment": "Vocabulary is power. Pragmatic means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=341",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/praɡˈmatɪk/",
    "usage": "The CEO's pragmatic decision to shut down the failing division saved the rest of the company."
  },
  {
    "rule": "Power Word: Quixotic",
    "sentence": "His ________ quest to ending world hunger in a week was admirable but impossible.",
    "options": [
      "Quizzical",
      "Quixotic",
      "Exotic"
    ],
    "correct": "Quixotic",
    "explanation": "Exceedingly idealistic; unrealistic and impractical.",
    "sarcastic_comment": "Vocabulary is power. Quixotic means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=342",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/kwɪkˈsɒtɪk/",
    "usage": "His quixotic quest to eliminate world hunger in a single year was noble but entirely unrealistic."
  },
  {
    "rule": "Power Word: Reclusive",
    "sentence": "The ________ author rarely left his home or granted interviews.",
    "options": [
      "Exclusive",
      "Reclusive",
      "Recursive"
    ],
    "correct": "Reclusive",
    "explanation": "Avoiding the company of other people; solitary.",
    "sarcastic_comment": "Vocabulary is power. Reclusive means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=343",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/rɪˈkluːsɪv/",
    "usage": "The reclusive author had lived alone for decades, communicating with the world only through letters."
  },
  {
    "rule": "Power Word: Sanguine",
    "sentence": "He remains ________ about the company's future despite the setbacks.",
    "options": [
      "Serene",
      "Sanguinary",
      "Sanguine"
    ],
    "correct": "Sanguine",
    "explanation": "Optimistic or positive, especially in an apparently bad or difficult situation.",
    "sarcastic_comment": "Vocabulary is power. Sanguine means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=344",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈsaŋɡwɪn/",
    "usage": "Despite the early setbacks, the coach remained sanguine about the team's chances in the tournament."
  },
  {
    "rule": "Power Word: Transient",
    "sentence": "The city has a large ________ population of students and tourists.",
    "options": [
      "Translucent",
      "Transparent",
      "Transient"
    ],
    "correct": "Transient",
    "explanation": "Lasting only for a short time; impermanent.",
    "sarcastic_comment": "Vocabulary is power. Transient means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=345",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈtranzɪənt/",
    "usage": "The morning frost was transient, disappearing the moment the sun climbed above the horizon."
  },
  {
    "rule": "Power Word: Venerable",
    "sentence": "The ________ institution has been operating for over two centuries.",
    "options": [
      "Venerable",
      "Venial",
      "Vulnerable"
    ],
    "correct": "Venerable",
    "explanation": "Accorded a great deal of respect, especially because of age, wisdom, or character.",
    "sarcastic_comment": "Vocabulary is power. Venerable means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=346",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈvɛn(ə)rəb(ə)l/",
    "usage": "The venerable old university has been a center of learning for over eight hundred years."
  },
  {
    "rule": "Power Word: Alacrity",
    "sentence": "She accepted the job offer with ________, excited to start immediately.",
    "options": [
      "Atrocity",
      "Acrimony",
      "Alacrity"
    ],
    "correct": "Alacrity",
    "explanation": "Brisk and cheerful readiness.",
    "sarcastic_comment": "Vocabulary is power. Alacrity means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=347",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/əˈlakrɪti/",
    "usage": "She accepted the challenge with alacrity, immediately beginning her preparations for the race."
  },
  {
    "rule": "Power Word: Burgeon",
    "sentence": "The startup's user base began to ________ after the marketing campaign.",
    "options": [
      "Bourgeois",
      "Burgeon",
      "Bury"
    ],
    "correct": "Burgeon",
    "explanation": "Begin to grow or increase rapidly; flourish.",
    "sarcastic_comment": "Vocabulary is power. Burgeon means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=348",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈbəːdʒ(ə)n/",
    "usage": "With the arrival of spring, the dormant garden began to burgeon with colorful new blossoms."
  },
  {
    "rule": "Power Word: Cacophony",
    "sentence": "The classroom was a ________ of shouting children and moving chairs.",
    "options": [
      "Euphony",
      "Cacophony",
      "Clamor"
    ],
    "correct": "Cacophony",
    "explanation": "A harsh, discordant mixture of sounds.",
    "sarcastic_comment": "Vocabulary is power. Cacophony means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=349",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/kəˈkɒfəni/",
    "usage": "The cacophony of the construction site made it nearly impossible to have a meeting in the office next door."
  },
  {
    "rule": "Power Word: Demagogue",
    "sentence": "The ________ used fear and prejudice to win the election.",
    "options": [
      "Demagogue",
      "Pedagogue",
      "Synagogue"
    ],
    "correct": "Demagogue",
    "explanation": "A political leader who seeks support by appealing to popular desires and prejudices.",
    "sarcastic_comment": "Vocabulary is power. Demagogue means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=350",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈdɛməɡɒɡ/",
    "usage": "The demagogue rose to power by exploiting the fears and prejudices of the angry crowd."
  },
  {
    "rule": "Power Word: Facetious",
    "sentence": "He made a ________ remark about the boss's new tie.",
    "options": [
      "Facetious",
      "Factuous",
      "Fastidious"
    ],
    "correct": "Facetious",
    "explanation": "Treating serious issues with deliberately inappropriate humor.",
    "sarcastic_comment": "Vocabulary is power. Facetious means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=351",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/fəˈsiːʃəs/",
    "usage": "Stop being facetious; this is a very serious situation that requires our full attention."
  },
  {
    "rule": "Power Word: Hubris",
    "sentence": "The CEO's ________ eventually led to the company's downfall.",
    "options": [
      "Hubris",
      "Humble",
      "Hybrid"
    ],
    "correct": "Hubris",
    "explanation": "Excessive pride or self-confidence.",
    "sarcastic_comment": "Vocabulary is power. Hubris means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=352",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈhjuːbrɪs/",
    "usage": "Ultimately, it was his own hubris that led him to believe he was above the laws of the land."
  },
  {
    "rule": "Power Word: Inevitable",
    "sentence": "Death and taxes are the only ________ things in life.",
    "options": [
      "Invariable",
      "Inimitable",
      "Inevitable"
    ],
    "correct": "Inevitable",
    "explanation": "Certain to happen; unavoidable.",
    "sarcastic_comment": "Vocabulary is power. Inevitable means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=353",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ɪnˈɛvɪtəb(ə)l/",
    "usage": "Given the lack of maintenance, the collapse of the ancient bridge was eventually inevitable."
  },
  {
    "rule": "Power Word: Jubilant",
    "sentence": "The crowd was ________ after the team won the championship.",
    "options": [
      "Judicious",
      "Jubilant",
      "Jovial"
    ],
    "correct": "Jubilant",
    "explanation": "Feeling or expressing great happiness and triumph.",
    "sarcastic_comment": "Vocabulary is power. Jubilant means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=354",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈdʒuːbɪlənt/",
    "usage": "The crowd was jubilant after the final whistle, celebrating their city's first major sports title."
  },
  {
    "rule": "Power Word: Luminous",
    "sentence": "The watch has ________ hands that glow in the dark.",
    "options": [
      "Voluminous",
      "Luminous",
      "Luminary"
    ],
    "correct": "Luminous",
    "explanation": "Full of or shedding light; bright or shining, especially in the dark.",
    "sarcastic_comment": "Vocabulary is power. Luminous means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=355",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈluːmɪnəs/",
    "usage": "The luminous chemicals in the deep-sea fish allowed it to attract prey in the darkness."
  },
  {
    "rule": "Power Word: Melancholy",
    "sentence": "The rainy weather put him in a ________ mood.",
    "options": [
      "Monopoly",
      "Melancholy",
      "Malady"
    ],
    "correct": "Melancholy",
    "explanation": "A feeling of pensive sadness, typically with no obvious cause.",
    "sarcastic_comment": "Vocabulary is power. Melancholy means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=356",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈmɛləŋkəli/",
    "usage": "A sense of quiet melancholy filled the old house after all the guests had finally departed."
  },
  {
    "rule": "Power Word: Ominous",
    "sentence": "The dark clouds were an ________ sign of the storm to come.",
    "options": [
      "Ominous",
      "Omniscient",
      "Abominable"
    ],
    "correct": "Ominous",
    "explanation": "Giving the impression that something bad or unpleasant is going to happen.",
    "sarcastic_comment": "Vocabulary is power. Ominous means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=357",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈɒmɪnəs/",
    "usage": "The ominous roar of thunder in the distance sent the hikers scrambling back toward their base camp."
  },
  {
    "rule": "Power Word: Placid",
    "sentence": "The lake was ________ and still in the early morning light.",
    "options": [
      "Placid",
      "Pallid",
      "Pliant"
    ],
    "correct": "Placid",
    "explanation": "Not easily upset or excited; calm and peaceful.",
    "sarcastic_comment": "Vocabulary is power. Placid means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=358",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈplasɪd/",
    "usage": "The mountain lake was so placid that it perfectly reflected the snowy peaks above it."
  },
  {
    "rule": "Power Word: Querulous",
    "sentence": "The ________ patient complained about everything from the food to the bedsheets.",
    "options": [
      "Quizzical",
      "Querulous",
      "Querying"
    ],
    "correct": "Querulous",
    "explanation": "Complaining in a petulant or whining manner.",
    "sarcastic_comment": "Vocabulary is power. Querulous means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=359",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈkwɛrʊləs/",
    "usage": "The querulous student argued with the teacher over every single mark lost on the exam."
  },
  {
    "rule": "Power Word: Rancorous",
    "sentence": "The divorce was long and ________, leaving both parties bitter.",
    "options": [
      "Rancorous",
      "Ravenous",
      "Robust"
    ],
    "correct": "Rancorous",
    "explanation": "Characterized by bitterness or resentment.",
    "sarcastic_comment": "Vocabulary is power. Rancorous means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=360",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈraŋk(ə)rəs/",
    "usage": "The rancorous debate between the two political rivals quickly descended into personal insults."
  },
  {
    "rule": "Power Word: Surreptitious",
    "sentence": "He cast a ________ glance at his watch during the meeting.",
    "options": [
      "Superstitious",
      "Surreptitious",
      "Serendipitous"
    ],
    "correct": "Surreptitious",
    "explanation": "Kept secret, especially because it would not be approved of.",
    "sarcastic_comment": "Vocabulary is power. Surreptitious means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=361",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˌsʌrəpˈtɪʃəs/",
    "usage": "The thief made a surreptitious exit through the back door while the guards were occupied."
  },
  {
    "rule": "Power Word: Tenacious",
    "sentence": "She was ________ in her pursuit of the truth, never giving up.",
    "options": [
      "Tenable",
      "Tenacious",
      "Tendentious"
    ],
    "correct": "Tenacious",
    "explanation": "Tending to keep a firm hold of something; clinging or adhering closely.",
    "sarcastic_comment": "Vocabulary is power. Tenacious means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=362",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/tɪˈneɪʃəs/",
    "usage": "Her tenacious grip on the lead allowed her to win the race despite the heavy rain and wind."
  },
  {
    "rule": "Power Word: Vacillate",
    "sentence": "I ________ between wanting to go out and wanting to stay home.",
    "options": [
      "Vaccinate",
      "Vacillate",
      "Oscillate"
    ],
    "correct": "Vacillate",
    "explanation": "Alternate or waver between different opinions or actions; be indecisive.",
    "sarcastic_comment": "Vocabulary is power. Vacillate means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=363",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈvasɪleɪt/",
    "usage": "Investors often vacillate between fear and greed, leading to sudden shifts in the market."
  },
  {
    "rule": "Power Word: Wistful",
    "sentence": "He gave a ________ look at the old house where he grew up.",
    "options": [
      "Willful",
      "Wishful",
      "Wistful"
    ],
    "correct": "Wistful",
    "explanation": "Having or showing a feeling of vague or regretful longing.",
    "sarcastic_comment": "Vocabulary is power. Wistful means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=364",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈwɪstfʊl/",
    "usage": "He gave a wistful look at the old family photograph, remembering the happy summers of his youth."
  },
  {
    "rule": "Power Word: Aesthete",
    "sentence": "An ________ spends their time visiting galleries and studying design.",
    "options": [
      "Ascetic",
      "Atheist",
      "Aesthete"
    ],
    "correct": "Aesthete",
    "explanation": "A person who has or affects to have a special appreciation of art and beautiful things.",
    "sarcastic_comment": "Vocabulary is power. Aesthete means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=365",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈiːsθiːt/",
    "usage": "As a dedicated aesthete, she felt that life was only worth living if one was surrounded by beauty.",
    "nuance": {
      "Ascetic": "An ascetic practices severe self-discipline and abstention from indulgence; this is the literal opposite of an aesthete.",
      "Atheist": "An atheist is someone who does not believe in a god; it's a belief status, whereas an aesthete is an art-lover."
    }
  },
  {
    "rule": "Power Word: Belligerent",
    "sentence": "The customer became ________ when he was told the item was out of stock.",
    "options": [
      "Pernicious",
      "Belligerent",
      "Benevolent"
    ],
    "correct": "Belligerent",
    "explanation": "Hostile and aggressive.",
    "sarcastic_comment": "Vocabulary is power. Belligerent means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=366",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/bəˈlɪdʒ(ə)r(ə)nt/",
    "usage": "The customer became belligerent when the manager refused to offer him a full refund."
  },
  {
    "rule": "Power Word: Capitulate",
    "sentence": "The rebels eventually had to ________ to the government forces.",
    "options": [
      "Recapitulate",
      "Capitulate",
      "Capitulation"
    ],
    "correct": "Capitulate",
    "explanation": "Cease to resist an opponent; surrender.",
    "sarcastic_comment": "Vocabulary is power. Capitulate means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=367",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/kəˈpɪtʃʊleɪt/",
    "usage": "The rebels were eventually forced to capitulate to the government's overwhelming military force."
  },
  {
    "rule": "Power Word: Dissident",
    "sentence": "The ________ was arrested for speaking out against the regime.",
    "options": [
      "Dissident",
      "Dissonant",
      "Diffident"
    ],
    "correct": "Dissident",
    "explanation": "A person who opposes official policy, especially that of an authoritarian state.",
    "sarcastic_comment": "Vocabulary is power. Dissident means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=368",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈdɪsɪd(ə)nt/",
    "usage": "The dissident was arrested for writing a poem that was critical of the ruling party's policies."
  },
  {
    "rule": "Power Word: Enigma",
    "sentence": "His disappearance remains an ________ that investigators cannot solve.",
    "options": [
      "Enigma",
      "Dogma",
      "Stigma"
    ],
    "correct": "Enigma",
    "explanation": "A person or thing that is mysterious, puzzling, or difficult to understand.",
    "sarcastic_comment": "Vocabulary is power. Enigma means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=369",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ɪˈnɪɡmə/",
    "usage": "The origin of the strange stone structures remains an enigma that continues to baffle archaeologists."
  },
  {
    "rule": "Power Word: Fortuitous",
    "sentence": "Their meeting in Paris was entirely ________, as neither knew the other was there.",
    "options": [
      "Fortutous",
      "Fortuitous",
      "Gratuitous"
    ],
    "correct": "Fortuitous",
    "explanation": "Happening by a lucky chance; fortunate.",
    "sarcastic_comment": "Vocabulary is power. Fortuitous means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=370",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/fɔːˈtjuːɪtəs/",
    "usage": "It was a fortuitous meeting, as she had been looking for someone with exactly his set of skills."
  },
  {
    "rule": "Power Word: Gregarious",
    "sentence": "She is a ________ person who loves hosting large dinner parties.",
    "options": [
      "Graminivorous",
      "Gregarious",
      "Garrulous"
    ],
    "correct": "Gregarious",
    "explanation": "Fond of company; sociable.",
    "sarcastic_comment": "Vocabulary is power. Gregarious means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=371",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ɡrɪˈɡɛːrɪəs/",
    "usage": "Elephants are gregarious creatures that spend their entire lives in close-knit family groups."
  },
  {
    "rule": "Power Word: Imminent",
    "sentence": "The dark sky suggested that a storm was ________.",
    "options": [
      "Inherent",
      "Eminent",
      "Imminent"
    ],
    "correct": "Imminent",
    "explanation": "About to happen.",
    "sarcastic_comment": "Vocabulary is power. Imminent means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=372",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈɪmɪnənt/",
    "usage": "The dark, swirling clouds suggested that a severe tornado was imminent and a warning was issued.",
    "nuance": {
      "Eminent": "Eminent describes a person who is famous and respected within a profession; it describes status, not timing.",
      "Inherent": "Inherent refers to a permanent, essential attribute; it doesn't describe something about to happen."
    }
  },
  {
    "rule": "Power Word: Judicious",
    "sentence": "He made a ________ choice by investing in a diversified portfolio.",
    "options": [
      "Judicial",
      "Judiciary",
      "Judicious"
    ],
    "correct": "Judicious",
    "explanation": "Having, showing, or done with good judgment or sense.",
    "sarcastic_comment": "Vocabulary is power. Judicious means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=373",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/dʒuːˈdɪʃəs/",
    "usage": "The judge's judicious use of his authority earned him the respect of both the defense and the prosecution."
  },
  {
    "rule": "Power Word: Kindle",
    "sentence": "The teacher's enthusiasm helped ________ a passion for science in her students.",
    "options": [
      "Kindle",
      "Knell",
      "Kindred"
    ],
    "correct": "Kindle",
    "explanation": "Light or set on fire; inspire (an emotion or feeling).",
    "sarcastic_comment": "Vocabulary is power. Kindle means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=374",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈkɪnd(ə)l/",
    "usage": "The teacher's exciting stories about space travel helped to kindle a passion for science in her students."
  },
  {
    "rule": "Power Word: Nostalgia",
    "sentence": "Hearing the old song filled her with ________ for her childhood.",
    "options": [
      "Nostalgia",
      "Nausea",
      "Neuralgia"
    ],
    "correct": "Nostalgia",
    "explanation": "A sentimental longing or wistful affection for the past.",
    "sarcastic_comment": "Vocabulary is power. Nostalgia means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=375",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/nɒˈstaldʒə/",
    "usage": "Walking through his old elementary school filled him with a powerful sense of nostalgia for his childhood."
  },
  {
    "rule": "Power Word: Ostentatious",
    "sentence": "He bought an ________ sports car to show off his wealth.",
    "options": [
      "Ostentatious",
      "Auspicious",
      "Ostensible"
    ],
    "correct": "Ostentatious",
    "explanation": "Characterized by vulgar or pretentious display; designed to impress.",
    "sarcastic_comment": "Vocabulary is power. Ostentatious means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=376",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˌɒstɛnˈteɪʃəs/",
    "usage": "The billionaire's ostentatious lifestyle was often criticized by the media as being vulgar and excessive."
  },
  {
    "rule": "Power Word: Pervasive",
    "sentence": "The smell of fresh coffee was ________ throughout the house.",
    "options": [
      "Pervasive",
      "Evasive",
      "Invasive"
    ],
    "correct": "Pervasive",
    "explanation": "Spreading widely throughout an area or a group of people.",
    "sarcastic_comment": "Vocabulary is power. Pervasive means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=377",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/pəˈveɪsɪv/",
    "usage": "The pervasive influence of social media on modern politics is a topic of intense debate among scholars."
  },
  {
    "rule": "Power Word: Quell",
    "sentence": "The police were called to ________ the riot.",
    "options": [
      "Quell",
      "Quill",
      "Querulous"
    ],
    "correct": "Quell",
    "explanation": "Put an end to (a rebellion or other disorder), typically by the use of force.",
    "sarcastic_comment": "Vocabulary is power. Quell means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=378",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/kwɛl/",
    "usage": "The general's calm and steady voice helped to quell the rising panic among the exhausted troops."
  },
  {
    "rule": "Power Word: Spurious",
    "sentence": "The lawyer dismissed the witness's testimony as ________.",
    "options": [
      "Spurious",
      "Sinuous",
      "Specious"
    ],
    "correct": "Spurious",
    "explanation": "Not being what it purports to be; false or fake.",
    "sarcastic_comment": "Vocabulary is power. Spurious means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=379",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈspjʊərɪəs/",
    "usage": "The investigator quickly dismissed the witness's testimony as being entirely spurious and unreliable."
  },
  {
    "rule": "Power Word: Trepidation",
    "sentence": "She felt a sense of ________ as she entered the dark forest.",
    "options": [
      "Tepid",
      "Trepidation",
      "Tribulation"
    ],
    "correct": "Trepidation",
    "explanation": "A feeling of fear or agitation about something that may happen.",
    "sarcastic_comment": "Vocabulary is power. Trepidation means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=380",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˌtrɛpɪˈdeɪʃ(ə)n/",
    "usage": "He entered the dark, abandoned asylum with a sense of trepidation, his heart pounding in his chest."
  },
  {
    "rule": "Power Word: Abhor",
    "sentence": "I ________ any form of cruelty to animals.",
    "options": [
      "Abhor",
      "Absorb",
      "Adorn"
    ],
    "correct": "Abhor",
    "explanation": "Regard with disgust and hatred.",
    "sarcastic_comment": "Vocabulary is power. Abhor means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=381",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/əbˈhɔː/",
    "usage": "Most decent people abhor any form of cruelty, especially when it is directed at those who are vulnerable."
  },
  {
    "rule": "Power Word: Banal",
    "sentence": "The movie was filled with ________ dialogue and predictable plot twists.",
    "options": [
      "Canal",
      "Banal",
      "Venal"
    ],
    "correct": "Banal",
    "explanation": "So lacking in originality as to be obvious and boring.",
    "sarcastic_comment": "Vocabulary is power. Banal means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=382",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/bəˈnɑːl/",
    "usage": "The pop song's lyrics were so banal that I had completely forgotten them by the time the track finished."
  },
  {
    "rule": "Power Word: Castigate",
    "sentence": "The manager ________d the employee for missing the deadline.",
    "options": [
      "Instigate",
      "Castigate",
      "Castrate"
    ],
    "correct": "Castigate",
    "explanation": "Reprimand (someone) severely.",
    "sarcastic_comment": "Vocabulary is power. Castigate means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=383",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈkastɪɡeɪt/",
    "usage": "The minister was quick to castigate the press for what he called their 'irresponsible and biased' reporting."
  },
  {
    "rule": "Power Word: Debilitate",
    "sentence": "The chronic illness began to ________ her over several months.",
    "options": [
      "Rehabilitate",
      "Debilitate",
      "Facilitate"
    ],
    "correct": "Debilitate",
    "explanation": "Make (someone) weak and infirm.",
    "sarcastic_comment": "Vocabulary is power. Debilitate means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=384",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/dɪˈbɪlɪteɪt/",
    "usage": "The chronic illness began to debilitate him, making it impossible for him to continue his strenuous work."
  },
  {
    "rule": "Power Word: Exacerbate",
    "sentence": "Citing old arguments will only ________ the current conflict.",
    "options": [
      "Exasperate",
      "Exacerbate",
      "Exonerate"
    ],
    "correct": "Exacerbate",
    "explanation": "Make (a problem, bad situation, or negative feeling) worse.",
    "sarcastic_comment": "Vocabulary is power. Exacerbate means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=385",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ɪɡˈzasəbeɪt/",
    "usage": "Citing old arguments from years ago will only exacerbate the tension between the two family members."
  },
  {
    "rule": "Power Word: Flippant",
    "sentence": "His ________ attitude towards the safety rules was very concerning.",
    "options": [
      "Flippant",
      "Flapping",
      "Fluent"
    ],
    "correct": "Flippant",
    "explanation": "Not showing a serious or respectful attitude.",
    "sarcastic_comment": "Vocabulary is power. Flippant means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=386",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈflɪp(ə)nt/",
    "usage": "His flippant attitude during the funeral service was deeply offensive to the grieving family members."
  },
  {
    "rule": "Power Word: Gratuitous",
    "sentence": "The movie was criticized for its ________ violence.",
    "options": [
      "Gratuitous",
      "Ingratiating",
      "Fortuitous"
    ],
    "correct": "Gratuitous",
    "explanation": "Uncalled for; lacking good reason; unwarranted.",
    "sarcastic_comment": "Vocabulary is power. Gratuitous means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=387",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ɡrəˈtjuːɪtəs/",
    "usage": "The movie was criticized for its gratuitous violence, which many felt served no real purpose in the story."
  },
  {
    "rule": "Power Word: Iconoclast",
    "sentence": "The young artist was an ________, challenging every established rule of painting.",
    "options": [
      "Pococurante",
      "Iconoclast",
      "Idolater"
    ],
    "correct": "Iconoclast",
    "explanation": "A person who attacks cherished beliefs or institutions.",
    "sarcastic_comment": "Vocabulary is power. Iconoclast means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=388",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ʌɪˈkɒnəklast/",
    "usage": "As a young artist, he was an iconoclast, deliberately breaking every established rule of classical painting."
  },
  {
    "rule": "Power Word: Languid",
    "sentence": "We spent a ________ afternoon lounging on the beach.",
    "options": [
      "Languish",
      "Livid",
      "Languid"
    ],
    "correct": "Languid",
    "explanation": "Displaying or having a disinclination for physical exertion or effort; slow and relaxed.",
    "sarcastic_comment": "Vocabulary is power. Languid means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=389",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈlaŋɡwɪd/",
    "usage": "We spent a languid afternoon lounging on the deck of the boat as it drifted slowly down the river."
  },
  {
    "rule": "Power Word: Malleable",
    "sentence": "Silver is a ________ metal that can be hammered into thin sheets.",
    "options": [
      "Infallible",
      "Malleable",
      "Palpable"
    ],
    "correct": "Malleable",
    "explanation": "Able to be hammered or pressed permanently out of shape without breaking or cracking.",
    "sarcastic_comment": "Vocabulary is power. Malleable means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=390",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/ˈmalɪəb(ə)l/",
    "usage": "Because children's minds are so malleable, it is essential that they are provided with a positive environment."
  },
  {
    "rule": "Power Word: Obscure",
    "sentence": "The meaning of the poem was ________ and difficult to grasp.",
    "options": [
      "Obscure",
      "Obdurate",
      "Obsequious"
    ],
    "correct": "Obscure",
    "explanation": "Not discovered or known about; uncertain.",
    "sarcastic_comment": "Vocabulary is power. Obscure means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=391",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/əbˈskjʊə/",
    "usage": "The remote village remains obscure, tucked away in a valley that is rarely visited by outsiders."
  },
  {
    "rule": "Power Word: Placate",
    "sentence": "The manager tried to ________ the angry customer with a full refund.",
    "options": [
      "Pliate",
      "Placate",
      "Vacillate"
    ],
    "correct": "Placate",
    "explanation": "Make (someone) less angry or hostile.",
    "sarcastic_comment": "Vocabulary is power. Placate means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=392",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/pləˈkeɪt/",
    "usage": "The manager tried to placate the angry customer by offering him a full refund and a gift certificate."
  },
  {
    "rule": "Power Word: Repudiate",
    "sentence": "The candidate ________d the false claims made by his opponent.",
    "options": [
      "Reputate",
      "Punctuate",
      "Repudiate"
    ],
    "correct": "Repudiate",
    "explanation": "Refuse to accept or be associated with.",
    "sarcastic_comment": "Vocabulary is power. Repudiate means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=393",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/rɪˈpjuːdɪeɪt/",
    "usage": "The candidate was forced to repudiate the controversial statements made by one of his senior advisers."
  },
  {
    "rule": "Power Word: Superfluous",
    "sentence": "The extra adjectives in the sentence were ________ and distracting.",
    "options": [
      "Superficial",
      "Superfluous",
      "Supercilious"
    ],
    "correct": "Superfluous",
    "explanation": "Unnecessary, especially through being more than enough.",
    "sarcastic_comment": "Vocabulary is power. Superfluous means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=394",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/suːˈpəːflʊəs/",
    "usage": "The extra adjectives in the sentence were superfluous and only served to clutter the author's message."
  },
  {
    "rule": "Power Word: Voracious",
    "sentence": "She is a ________ reader, finishing three books every week.",
    "options": [
      "Veracious",
      "Vivacious",
      "Voracious"
    ],
    "correct": "Voracious",
    "explanation": "Wanting or devouring great quantities of food or information.",
    "sarcastic_comment": "Vocabulary is power. Voracious means exactly that.",
    "image": "https://loremflickr.com/800/600/knowledge?lock=395",
    "isArsenal": true,
    "category": "The Arsenal",
    "pronunciation": "/vəˈreɪʃəs/",
    "usage": "A voracious reader from a young age, she had finished the entire school library before she was twelve."
  }
]
``

---

## FILE: package.json

{
    "name": "grammar-quiz",
    "private": true,
    "version": "0.0.0",
    "type": "module",
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
        "preview": "vite preview",
        "predeploy": "npm run build",
        "deploy": "gh-pages -d dist"
    },
    "homepage": "https://mark-henry-saft.github.io/https-grammar-quiz-/",
    "dependencies": {
        "lucide-react": "^0.309.0",
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
    },
    "devDependencies": {
        "@types/react": "^18.2.43",
        "@types/react-dom": "^18.2.17",
        "@vitejs/plugin-react": "^4.2.1",
        "autoprefixer": "^10.4.16",
        "eslint": "^8.55.0",
        "eslint-plugin-react": "^7.33.2",
        "eslint-plugin-react-hooks": "^4.6.0",
        "eslint-plugin-react-refresh": "^0.4.5",
        "gh-pages": "^6.3.0",
        "postcss": "^8.4.32",
        "tailwindcss": "^3.4.0",
        "vite": "^5.0.8"
    }
}
``

---

## FILE: index.html

<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="icon.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Grammar Quiz</title>
</head>

<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>

</html>
``

---

