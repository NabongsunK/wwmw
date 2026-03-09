import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
       extend: {
            colors: {
                'bg-black': 'rgb(10 10 10)',
            }
       },
    },
    darkMode: 'class',
    plugins: [typography],
}

export default config;