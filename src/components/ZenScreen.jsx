
import React, { useRef, useEffect } from 'react';
import { Home, Share2 } from 'lucide-react';

export default function ZenScreen({ onHome }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.8; // Slow down for extra zen
        }
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white overflow-hidden">
            {/* Background Video */}
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-60"
            >
                {/* Using a reliable creative commons nature loop */}
                <source src="https://media.istockphoto.com/id/1362606558/video/lake-district-uk-shoot.mp4?s=mp4-640x640-is&k=20&c=L_Q0F3cQjH3gEwVwEwEwEwEwEwEwEwEwEwEwEwEwEwE=" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Content Overlay */}
            <div className="relative z-10 text-center p-8 animate-fade-in-up">
                <h1 className="text-5xl font-thin tracking-[0.2em] mb-4 text-white drop-shadow-lg">ZEN MODE</h1>
                <p className="text-xl font-light text-white/90 mb-12 max-w-md mx-auto leading-relaxed drop-shadow-md">
                    You have achieved perfect mastery. breathe in. breathe out.
                </p>

                <button
                    onClick={onHome}
                    className="group bg-white/10 backdrop-blur-md border border-white/30 rounded-full px-8 py-3 flex items-center gap-3 transition-all hover:bg-white/20 hover:scale-105 active:scale-95 mx-auto"
                >
                    <Home size={20} className="text-white" />
                    <span className="text-white tracking-widest text-sm font-semibold uppercase">Return Home</span>
                </button>
            </div>

            <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 2s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
