
import React from 'react';
import { Info, CheckCircle, XCircle } from 'lucide-react';

export default function FeedbackSheet({ show, correct, explanation, onNext, onRetry }) {
    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom duration-300">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md mx-auto shadow-2xl overflow-hidden">
                <div className={`h-1.5 w-full ${correct ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {correct ? <CheckCircle size={24} /> : <XCircle size={24} />}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                {correct ? 'Correct!' : 'Incorrect'}
                            </h4>
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                {explanation || (correct ? "Great job!" : "Review the rule above.")}
                            </p>
                            <button
                                onClick={onNext}
                                className={`w-full h-14 rounded-xl font-bold text-lg text-white transition-transform active:scale-95 shadow-md ${correct ? 'bg-green-500 shadow-green-600' : 'bg-red-500 shadow-red-600'
                                    }`}
                            >
                                {correct ? 'Next Question' : 'Continue'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
