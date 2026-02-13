import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
       extend: {
            colors: {
                'bg-black': 'rgb(10 10 10)',
            }
       },
    },
    darkMode: 'class',
    plugins: [],
}

export default config;