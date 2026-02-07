
import React, { useState } from 'react';
import { ChevronLeft, Settings, CheckCircle, HelpCircle, SkipForward, Lightbulb, X, Flame } from 'lucide-react';
import FeedbackSheet from './FeedbackSheet';

import correctSound from '../assets/sounds/correct.wav';
import incorrectSound from '../assets/sounds/incorrect.wav';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800";

export default function QuizScreen({ questionData, questionIndex, totalQuestions, answerHistory = [], onBack, onComplete, playClick }) {
    const [feedbackState, setFeedbackState] = useState({ show: false, correct: false });
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [imgSrc, setImgSrc] = useState(questionData.image);
    const [showStreak, setShowStreak] = useState(false);

    // Calculate current streak
    const currentStreak = React.useMemo(() => {
        let streak = 0;
        for (let i = answerHistory.length - 1; i >= 0; i--) {
            if (answerHistory[i]) streak++;
            else break;
        }
        return streak;
    }, [answerHistory]);

    // Trigger animation on 5/10/15 etc
    React.useEffect(() => {
        if (currentStreak > 0 && currentStreak % 5 === 0) {
            setShowStreak(true);
            const timer = setTimeout(() => setShowStreak(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [currentStreak]);

    // Reset state when question changes
    React.useEffect(() => {
        setFeedbackState({ show: false, correct: false });
        setSelectedAnswer(null);
        setImgSrc(questionData.image);
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
    };

    const handleRetry = () => {
        setFeedbackState({ show: false, correct: false });
        setSelectedAnswer(null);
    };

    const handleNext = () => {
        onComplete(feedbackState.correct);
    };

    // Split sentence to highlight the blank or selected answer
    const sentenceParts = questionData.sentence.split('________');

    return (
        <div className="bg-pattern min-h-screen flex flex-col w-full text-slate-900 dark:text-slate-100">

            {/* Header */}
            <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 pt-6 pb-2">
                <div className="flex items-center justify-between max-w-md mx-auto">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 flex items-center justify-start text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold tracking-tight">Grammar Quiz</h1>
                    <button className="w-10 h-10 flex items-center justify-end text-primary">
                        <Settings size={24} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="max-w-md mx-auto mt-4 px-2">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{questionData.rule}</span>
                        <span className="text-sm font-bold text-primary">{questionIndex + 1} / {totalQuestions}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                            className="bg-primary h-full rounded-full transition-all duration-500"
                            style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
                {/* Question Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">{questionData.rule}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Tap the word that correctly fills the gap.</p>
                </div>

                {/* Question Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl ios-shadow p-8 mb-10 border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-full h-40 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden relative">
                            <img
                                key={questionData.image} // Force re-render on new question
                                src={imgSrc}
                                alt={questionData.rule}
                                onError={() => setImgSrc(FALLBACK_IMAGE)}
                                className="w-full h-full object-cover opacity-90 transition-opacity duration-300"
                            />
                        </div>
                        <p className="text-xl font-medium leading-relaxed">
                            {sentenceParts[0]}
                            <span className={`inline-block border-b-2 mx-1 font-bold ${selectedAnswer ? 'text-primary border-primary' : 'w-16 border-slate-300'}`}>
                                {selectedAnswer || ""}
                            </span>
                            {sentenceParts[1]}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                    {questionData.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(option)}
                            className={`w-full h-16 rounded-xl font-bold text-xl flex items-center justify-center gap-2 group relative overflow-hidden active:translate-y-[2px] transition-all duration-100 ${selectedAnswer === option
                                ? (option === questionData.correct ? 'bg-green-500 text-white border-green-600' : 'bg-red-500 text-white border-red-600')
                                : 'btn-secondary bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-2 border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            <span className="truncate">{option}</span>
                            {idx === 0 && <CheckCircle className="absolute right-6 opacity-0 group-hover:opacity-20 transition-opacity" />}
                            {idx !== 0 && <HelpCircle className="absolute right-6 opacity-0 group-hover:opacity-20 transition-opacity text-slate-400" />}
                        </button>
                    ))}
                </div>

                {/* Footer Utilities & Tally */}
                <div className="mt-auto flex flex-col gap-4 px-2 pb-6">
                    {/* Visual Tally */}
                    <div className="flex justify-between items-end px-2 h-32">
                        {/* Green Stacks (Left) */}
                        <div className="flex gap-2 overflow-x-auto max-w-[40%] scrollbar-hide py-1">
                            {Array.from({ length: Math.ceil(answerHistory.filter(Boolean).length / 5) || 1 }).map((_, stackIdx) => (
                                <div key={stackIdx} className="flex flex-col-reverse gap-1 min-w-[24px]">
                                    {answerHistory.filter(Boolean).slice(stackIdx * 5, (stackIdx + 1) * 5).map((_, i) => (
                                        <div key={i} className="w-6 h-6 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Skip Button (Center) */}
                        <div className="flex-1 flex items-center justify-center shrink-0 mx-2 mb-10">
                            <button className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold text-sm hover:text-primary transition-colors whitespace-nowrap">
                                <SkipForward size={20} />
                                SKIP
                            </button>
                        </div>

                        {/* Red Stacks (Right) */}
                        <div className="flex gap-2 overflow-x-auto max-w-[40%] scrollbar-hide py-1 justify-end flex-row-reverse">
                            {Array.from({ length: Math.ceil(answerHistory.filter(x => !x).length / 5) || 1 }).map((_, stackIdx) => (
                                <div key={stackIdx} className="flex flex-col-reverse gap-1 min-w-[24px]">
                                    {answerHistory.filter(x => !x).slice(stackIdx * 5, (stackIdx + 1) * 5).map((_, i) => (
                                        <div key={i} className="w-6 h-6 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center shrink-0 relative">
                                            <X size={14} className="text-red-600 stroke-[3]" />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>


                    <div className="flex items-center justify-end">
                        <button className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center ios-shadow transition-transform active:scale-95">
                            <Lightbulb className="fill-current" size={24} />
                        </button>
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
