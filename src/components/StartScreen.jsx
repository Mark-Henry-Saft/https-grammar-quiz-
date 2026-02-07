
import React from 'react';
import { Play } from 'lucide-react';

export default function StartScreen({ onStart }) {
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
                <button
                    onClick={onStart}
                    className="btn-tactile w-full h-16 bg-primary text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/30"
                >
                    <Play size={24} className="fill-current" />
                    Begin My Mastery
                </button>
            </div>
        </div>
    );
}
