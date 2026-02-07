
import React, { useState } from 'react';
import { ChevronLeft, Settings, CheckCircle, HelpCircle, SkipForward, Lightbulb, X, Flame, XCircle } from 'lucide-react';

import correctNewSound from '../assets/sounds/correct_new.wav';
import incorrectNewSound from '../assets/sounds/incorrect_new.wav';
import fanfareSound from '../assets/sounds/fanfare.wav';

const FALLBACK_IMAGE = "https://placehold.co/800x600/e2e8f0/475569?text=Grammar+Quiz";

export default function QuizScreen({ questionData, questionIndex, totalQuestions, answerHistory = [], onBack, onComplete, playClick, playCorrect, currentStreak }) {
    const [feedbackState, setFeedbackState] = useState({ show: false, correct: false });
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [imgSrc, setImgSrc] = useState(questionData.image);
    const [showStreak, setShowStreak] = useState(false);
    const [showEncouragement, setShowEncouragement] = useState(null);
    const [timeLeft, setTimeLeft] = useState(15);

    const [sarcasticMessage, setSarcasticMessage] = useState(null);

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

    // Timer Logic
    React.useEffect(() => {
        if (feedbackState.show) return;

        if (timeLeft === 0) {
            setFeedbackState({ show: true, correct: false });
            setSelectedAnswer("TIMEOUT");
            setSarcasticMessage("Time's up! Speed reading isn't your thing?");
            const audio = new Audio(incorrectNewSound);
            audio.volume = 0.5;
            audio.play().catch(e => console.error(e));
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

    const playSound = (isCorrect) => {
        let soundToPlay = incorrectNewSound;
        if (isCorrect) {
            if (questionData.isLegendary) {
                soundToPlay = fanfareSound;
            } else {
                soundToPlay = correctNewSound;
            }
        }
        const audio = new Audio(soundToPlay);
        audio.volume = 0.5;
        audio.play().catch(e => console.error("Audio play failed:", e));
    };

    const handleAnswer = (answer) => {
        if (selectedAnswer) return; // Prevent double clicks

        if (playClick) playClick();

        const isCorrect = answer === questionData.correct;
        playSound(isCorrect);

        setSelectedAnswer(answer);
        setFeedbackState({ show: true, correct: isCorrect });

        if (!isCorrect && answer !== "SKIP") {
            const message = questionData.sarcastic_comment || sarcasticReplies[Math.floor(Math.random() * sarcasticReplies.length)];
            setSarcasticMessage(message);
        } else if (answer === "SKIP") {
            setSarcasticMessage("Coward's way out? Okay.");
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
                                            {feedbackState.correct ? 'Incredible!' : (selectedAnswer === "TIMEOUT" ? "Time Out!" : 'Not Quite')}
                                        </h4>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                                            {questionData.explanation || (feedbackState.correct ? "Spot on! You mastered this rule." : "Study the rule above and try next time.")}
                                        </p>
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
