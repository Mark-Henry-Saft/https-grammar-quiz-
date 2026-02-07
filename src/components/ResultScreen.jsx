
import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Trophy, Share2, Crown, Flame, Zap } from 'lucide-react';

export default function ResultScreen({ score, total, totalTimeRemaining, topScores = [], onUpdateLeaderboard, onRestart, playClick, onZen }) {
    const percentage = Math.round((score / total) * 100);
    const avgTimeRemaining = total > 0 ? (totalTimeRemaining / total).toFixed(1) : "0.0";

    // Ensure we only save the score once per mount
    const hasSavedRef = useRef(false);

    useEffect(() => {
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
                                    <div className="flex items-center gap-3">
                                        <span className={`font-mono font-bold w-4 ${idx === 0 ? 'text-yellow-600' : 'text-slate-400'}`}>#{idx + 1}</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                                            {/* Just identify current user if stats match? No, hard to know without ID. Just show list. */}
                                            {/* User ID might be nice, but for now just "Player" */}
                                            {entry.score === score && entry.time === totalTimeRemaining ? (idx === 0 ? "You (Legend)" : "You") : `Player ${idx + 1}`}
                                        </span>
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

                {/* Donation Section (Compact) */}
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 w-full animate-fade-in opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex flex-col gap-1 cursor-pointer" onClick={() => navigator.clipboard.writeText('0x109e87DfA42086D2BB09eEC03E4ed03Ada588E3e')}>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold hover:text-primary transition-colors">
                            Support: 0x109e...8E3e (ETH)
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
