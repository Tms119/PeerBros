/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0a',
                foreground: '#f3f4f6',
                accent: '#c0a080', // champagne/gold accent
                obsidian: '#111111',
                panel: '#1a1a1a',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            animation: {
                'noise': 'noise 1s steps(2) infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'pulse-slower': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'mesh-scroll': 'mesh-scroll 20s linear infinite',
                'scrollText': 'scrollText 20s linear infinite',
            },
            keyframes: {
                noise: {
                    '0%, 100%': { transform: 'translate(0,0)' },
                    '10%': { transform: 'translate(-5%,-5%)' },
                    '20%': { transform: 'translate(-10%,5%)' },
                    '30%': { transform: 'translate(5%,-10%)' },
                    '40%': { transform: 'translate(-5%,15%)' },
                    '50%': { transform: 'translate(-10%,5%)' },
                    '60%': { transform: 'translate(15%,0)' },
                    '70%': { transform: 'translate(0,15%)' },
                    '80%': { transform: 'translate(3%,35%)' },
                    '90%': { transform: 'translate(-10%,10%)' },
                },
                'mesh-scroll': {
                    '0%': { transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) translateZ(-200px)' },
                    '100%': { transform: 'perspective(1000px) rotateX(60deg) translateY(0px) translateZ(-200px)' },
                },
                'scrollText': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                }
            }
        },
    },
    plugins: [],
}
