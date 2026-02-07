
import React, { useState } from 'react';
import { ChevronLeft, Settings, CheckCircle, HelpCircle, SkipForward, Lightbulb, X, Flame } from 'lucide-react';
import FeedbackSheet from './FeedbackSheet';

import correctSound from '../assets/sounds/correct.wav';
import incorrectSound from '../assets/sounds/incorrect.wav';

const FALLBACK_IMAGE = "https://placehold.co/800x600/e2e8f0/475569?text=Grammar+Quiz";

export default function QuizScreen({ questionData, questionIndex, totalQuestions, answerHistory = [], onBack, onComplete, playClick, playCorrect, currentStreak }) {
    const [feedbackState, setFeedbackState] = useState({ show: false, correct: false });
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [imgSrc, setImgSrc] = useState(questionData.image);
    const [showStreak, setShowStreak] = useState(false);
    const [showEncouragement, setShowEncouragement] = useState(null);
    const [timeLeft, setTimeLeft] = useState(10);

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
            const audio = new Audio(incorrectSound);
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
            const timer = setTimeout(() => setShowStreak(false), 3000);
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
        setTimeLeft(10);
        setSarcasticMessage(null);
    }, [questionData]);

    const playSound = (isCorrect) => {
        const audio = new Audio(isCorrect ? correctSound : incorrectSound);
        audio.volume = 0.5;
        audio.play().catch(e => console.error("Audio play failed:", e));
    };

    const handleAnswer = (answer) => {
        if (selectedAnswer) return; // Prevent double clicks
        // Don't play default click here, let feedback sound take over? 
        // User asked for "sound everytime a button is pushed".
        // Let's add a subtle click for the selection itself, separate from correct/incorrect.
        if (playClick) playClick();

        const isCorrect = answer === questionData.correct;
        playSound(isCorrect);

        setSelectedAnswer(answer);
        setFeedbackState({ show: true, correct: isCorrect });

        if (!isCorrect && answer !== "SKIP") {
            const randomSarcasm = sarcasticReplies[Math.floor(Math.random() * sarcasticReplies.length)];
            setSarcasticMessage(randomSarcasm);
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
        onComplete(feedbackState.correct);
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
            <header className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-2 pb-1 shadow-sm">
                <div className="flex items-center justify-between max-w-md mx-auto h-10">
                    <button
                        onClick={onBack}
                        className="w-8 h-8 flex items-center justify-start text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-base font-bold tracking-tight opacity-80">Grammar Quiz</h1>
                    <button className="w-8 h-8 flex items-center justify-end text-primary opacity-0 pointer-events-none">
                        <Settings size={20} />
                    </button>
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

            <main className="flex-1 flex flex-col px-3 py-2 max-w-md mx-auto w-full relative z-0 justify-center">

                {/* Image Area - Reduced height */}
                <div className="bg-white dark:bg-slate-900 rounded-xl ios-shadow p-3 mb-3 border border-slate-100 dark:border-slate-800 relative overflow-hidden shrink-0">
                    <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden relative shadow-inner mb-3">
                        <img
                            key={questionData.image}
                            src={imgSrc}
                            alt={questionData.rule}
                            onError={() => setImgSrc(FALLBACK_IMAGE)}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Sentence - Compact Text */}
                    <div className="flex flex-col items-center text-center">
                        <h2 className="text-lg font-bold mb-1 text-slate-800 dark:text-white hidden">{questionData.rule}</h2>
                        <p className="text-lg font-medium leading-snug px-1">
                            {(() => {
                                const parts = questionData.sentence.split('________');
                                const answerParts = selectedAnswer
                                    ? selectedAnswer.split('/').map(s => s.trim())
                                    : Array(parts.length - 1).fill("");

                                return parts.map((part, index) => (
                                    <React.Fragment key={index}>
                                        {part}
                                        {index < parts.length - 1 && (
                                            <span className={`inline-block border-b-2 mx-1 font-bold transition-colors duration-300 ${selectedAnswer ? 'text-primary border-primary' : 'min-w-[2.5rem] border-slate-300 text-transparent'}`}>
                                                {answerParts[index] || "____"}
                                            </span>
                                        )}
                                    </React.Fragment>
                                ));
                            })()}
                        </p>
                    </div>
                </div>

                {/* Sarcastic Message on Wrong Answer (Inline) */}
                {sarcasticMessage && (
                    <div className="text-center mb-2 animate-in slide-in-from-bottom-2 fade-in">
                        <span className="text-sm font-bold text-red-500 italic bg-red-50 px-3 py-1 rounded-full">{sarcasticMessage}</span>
                    </div>
                )}


                {/* Action Buttons - Compact Grid */}
                <div className="grid grid-cols-1 gap-2 mb-2 w-full">
                    {questionData.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(option)}
                            disabled={!!selectedAnswer}
                            className={`w-full h-12 rounded-lg font-bold text-base flex items-center justify-center gap-2 group relative overflow-hidden active:scale-[0.98] transition-all duration-200 ${selectedAnswer === option
                                ? (option === questionData.correct ? 'bg-green-500 text-white border-green-600 shadow-sm' : 'bg-red-500 text-white border-red-600 shadow-sm')
                                : (selectedAnswer === "TIMEOUT" && option === questionData.correct
                                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                    : 'btn-secondary bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50')
                                } ${!!selectedAnswer && selectedAnswer !== option && option !== questionData.correct ? 'opacity-50 grayscale' : ''}`}
                        >
                            <span className="truncate px-4">{option}</span>
                            {selectedAnswer === option && option === questionData.correct && (
                                <CheckCircle className="absolute right-4 w-4 h-4 animate-in zoom-in spin-in-90 duration-300" />
                            )}
                            {selectedAnswer === option && option !== questionData.correct && (
                                <X className="absolute right-4 w-4 h-4 animate-in zoom-in duration-300" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Footer Utilities & Tally - Compact */}
                <div className="mt-auto flex flex-col gap-1 px-1 pb-2 shrink-0">
                    <div className="flex justify-between items-end h-16 relative">
                        {/* Green Stacks */}
                        <div className="flex gap-1 overflow-x-auto max-w-[42%] scrollbar-hide py-1 pl-1 mask-linear-fade-right">
                            {Array.from({ length: Math.ceil(answerHistory.filter(Boolean).length / 5) || 1 }).map((_, stackIdx) => (
                                <div key={stackIdx} className="flex flex-col-reverse gap-0.5 min-w-[16px]">
                                    {answerHistory.filter(Boolean).slice(stackIdx * 5, (stackIdx + 1) * 5).map((_, i) => (
                                        <div key={i} className="w-4 h-4 rounded bg-green-100 border border-green-400 flex items-center justify-center shrink-0 shadow-sm animate-in zoom-in duration-300">
                                            <div className="w-1 h-1 rounded-full bg-green-500"></div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Skip Button */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                            <button
                                onClick={() => handleAnswer("SKIP")}
                                disabled={!!selectedAnswer}
                                className={`flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors ${!!selectedAnswer ? 'opacity-0' : 'opacity-100'}`}
                            >
                                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm">
                                    <SkipForward size={14} />
                                </div>
                                SKIP
                            </button>
                        </div>

                        {/* Red Stacks */}
                        <div className="flex gap-1 overflow-x-auto max-w-[42%] scrollbar-hide py-1 pr-1 justify-end flex-row-reverse mask-linear-fade-left">
                            {Array.from({ length: Math.ceil(answerHistory.filter(x => !x).length / 5) || 1 }).map((_, stackIdx) => (
                                <div key={stackIdx} className="flex flex-col-reverse gap-0.5 min-w-[16px]">
                                    {answerHistory.filter(x => !x).slice(stackIdx * 5, (stackIdx + 1) * 5).map((_, i) => (
                                        <div key={i} className="w-4 h-4 rounded bg-red-100 border border-red-400 flex items-center justify-center shrink-0 relative shadow-sm animate-in zoom-in duration-300">
                                            <X size={10} className="text-red-600" />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Streak Animation Overlay */}
            {showStreak && (
                <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50 animate-in zoom-in fade-in duration-500">
                    <div className="bg-orange-500 text-white px-8 py-6 rounded-3xl shadow-2xl skew-y-[-6deg] flex flex-col items-center border-4 border-yellow-300">
                        <Flame size={64} className="animate-bounce mb-2 fill-yellow-300 stroke-none" />
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase drop-shadow-md">
                            {currentStreak} In A Row!
                        </h2>
                        <p className="font-bold text-orange-100 text-lg mt-2">Unstoppable!</p>
                    </div>
                </div>
            )}

            <FeedbackSheet
                show={feedbackState.show}
                correct={feedbackState.correct}
                explanation={questionData.explanation}
                onNext={handleNext}
                onRetry={handleRetry}
            />
        </div>
    );
}
