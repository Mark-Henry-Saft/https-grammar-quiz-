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
