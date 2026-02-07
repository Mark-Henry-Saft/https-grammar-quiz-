
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
