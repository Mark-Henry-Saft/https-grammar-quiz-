
import React from 'react';
import { RotateCcw, Trophy, Share2 } from 'lucide-react';

export default function ResultScreen({ score, total, onRestart, playClick }) {
    const percentage = Math.round((score / total) * 100);

    return (
        <div className="bg-pattern min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white dark:bg-slate-900 rounded-2xl ios-shadow p-8 max-w-sm w-full border border-slate-100 dark:border-slate-800">
                <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Trophy className="text-yellow-600 dark:text-yellow-400 fill-current" size={48} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Lesson Complete!</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    You scored <span className="font-bold text-slate-900 dark:text-white">{score}</span> out of <span className="font-bold text-slate-900 dark:text-white">{total}</span>
                </p>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 mb-8 overflow-hidden">
                    <div
                        className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={() => {
                            if (playClick) playClick();
                            const text = `🔥 I just hit ${score}/${total} on the Mastery Quiz! Can you beat my time?`;
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

                    <button
                        onClick={() => { if (playClick) playClick(); onRestart(); }}
                        className="btn-secondary w-full h-14 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                        <RotateCcw size={20} />
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
}
