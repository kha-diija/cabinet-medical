/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{jsx}",
    ],
    // ✅ IMPORTANT : Change darkMode pour utiliser la classe sur body
    darkMode: ['class', 'body'],
    theme: {
        extend: {},
    },
    plugins: [],
}