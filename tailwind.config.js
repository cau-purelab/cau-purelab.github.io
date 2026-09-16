/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                playfair: ['"Playfair Display"', 'serif'],
            },
            spacing: {
                // 고정 Navbar 높이 (src/index.css의 --nav-h와 같은 값).
                // main의 상단 패딩(pt-nav)과 sticky 요소의 top-nav가 이 한 값을 공유한다.
                nav: 'var(--nav-h)',
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
                // 느린 회전 — 장식용 로더에 사용. prefers-reduced-motion에서는 index.css가 속도를 조정한다.
                'spin-slow': 'spin 6s linear infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}
