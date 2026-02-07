
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "primary": "#137fec",
                "background-light": "#f6f7f8",
                "background-dark": "#101922",
            },
            fontFamily: {
                "display": ["Lexend", "sans-serif"],
                "sans": ["Lexend", "sans-serif"],
            },
            borderRadius: {
                "lg": "1rem",
                "xl": "1.5rem",
            },
            backgroundImage: {
                'pattern': "radial-gradient(#d1d5db 0.5px, transparent 0.5px)",
                'pattern-dark': "radial-gradient(#1e293b 0.5px, transparent 0.5px)",
            },
            backgroundSize: {
                'pattern': '20px 20px',
            }
        },
    },
    plugins: [],
}
