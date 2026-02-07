
import React from 'react';
import { Play, Calendar, Zap } from 'lucide-react';

export default function StartScreen({ onStart, onDailyStart, dailyStats }) {
    const today = new Date().toDateString();
    const isDailyComplete = dailyStats?.lastPlayed === today;

    return (
        <div className="bg-pattern min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white dark:bg-slate-900 rounded-2xl ios-shadow p-8 max-w-sm w-full border border-slate-100 dark:border-slate-800">
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
                </div>
            </div>
        </div>
    );
}
