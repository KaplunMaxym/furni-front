import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    /*
     * Стара палітра, перенаведена на змінні теми.
     *
     * Ключі лишилися ті самі — 'black/600', 'react/500', 'green-primary/600'
     * і решта. Так уся наявна розмітка (а це понад півтори сотні місць у
     * детальних сторінках і панелях редактора) автоматично отримує обидві
     * теми, і не треба правити кожен файл руками.
     *
     * Назви тепер описують історію, а не колір: 'black/600' — це основний
     * текст, а не чорний, і у світлій темі він темний, у темній — світлий.
     * Для нового коду беріть семантичні токени з extend нижче: bg-card,
     * text-muted-foreground, border-border.
     */
    colors: {
      // ── текст ────────────────────────────────────────────────────────────
      'black/600': 'rgb(var(--foreground) / <alpha-value>)',   // основний текст
      'black/500': 'rgb(var(--foreground) / <alpha-value>)',
      'black/400': 'rgb(var(--muted-foreground) / <alpha-value>)',
      // Текст поверх кольорових плашок — світлий в обох темах: під ним
      // завжди насичений колір діаграми, а не фон сторінки
      'white/600': 'rgb(var(--on-accent) / <alpha-value>)',
      'gray/600': 'rgb(var(--muted-foreground) / <alpha-value>)',
      'gray/400': 'rgb(var(--muted-foreground) / <alpha-value>)',
      'gray/300': 'rgb(var(--muted-foreground) / <alpha-value>)',
      'react/300': 'rgb(var(--muted-foreground) / <alpha-value>)',

      // ── поверхні ─────────────────────────────────────────────────────────
      'bg': 'rgb(var(--background) / <alpha-value>)',
      'gray/200': 'rgb(var(--secondary) / <alpha-value>)',
      'gray/100': 'rgb(var(--surface) / <alpha-value>)',
      'react/400': 'rgb(var(--surface) / <alpha-value>)',
      'react/500': 'rgb(var(--secondary) / <alpha-value>)',
      'react/600': 'rgb(var(--background) / <alpha-value>)',

      // ── акцент (був салатовий/зелений) ───────────────────────────────────
      'green-primary/600': 'rgb(var(--chart-2) / <alpha-value>)',
      'green-secondary/600': 'rgb(var(--chart-2) / <alpha-value>)',
      'green-dark/600': 'rgb(var(--chart-2) / <alpha-value>)',
      'right-green': 'rgb(var(--chart-2) / <alpha-value>)',
      'green-salat': 'rgb(var(--chart-2) / <alpha-value>)',
      'green-primary/50': 'rgb(var(--surface) / <alpha-value>)',      // підкладка чипів
      'green-primary/50%': 'rgb(var(--chart-2) / 0.25)',
      'emerald/500': 'rgb(var(--chart-2) / <alpha-value>)',
      'emerald/600': 'rgb(var(--chart-2) / <alpha-value>)',
      'emerald/50': 'rgb(var(--surface) / <alpha-value>)',

      // ── стани ────────────────────────────────────────────────────────────
      'red/600': 'rgb(var(--destructive-foreground) / <alpha-value>)',
      'red/500': 'rgb(var(--destructive-foreground) / <alpha-value>)',
      'red-dark/600': 'rgb(var(--destructive) / <alpha-value>)',
      'red-error/50': 'rgb(var(--destructive) / <alpha-value>)',
      'yellow/700': 'rgb(var(--chart-3) / <alpha-value>)',
      'yellow/800': 'rgb(var(--chart-3) / <alpha-value>)',
      'yellow-attentiom/50': 'rgb(var(--surface) / <alpha-value>)',
      'orange/500': 'rgb(var(--chart-3) / <alpha-value>)',

      // ── інформаційні ─────────────────────────────────────────────────────
      'blue/600': 'rgb(var(--chart-1) / <alpha-value>)',
      'blue/400': 'rgb(var(--chart-1) / <alpha-value>)',
      'blue/200': 'rgb(var(--ring) / <alpha-value>)',
      'blue/50': 'rgb(var(--surface) / <alpha-value>)',
      'light-blue-opacity50': 'rgb(var(--surface) / 0.5)',
      'purple/400': 'rgb(var(--chart-4) / <alpha-value>)',
    },
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',

        // theme.colors вище замінює дефолтну палітру Tailwind, і разом з нею
        // зникли службові ключі. Через це border-transparent, bg-transparent
        // тощо ніде в проєкті не працювали — повертаємо.
        transparent: 'transparent',
        current: 'currentColor',
        // Те саме стосується `black`: ключі 'black/400'..'black/600' у палітрі
        // вище — це відтінки тексту, а не прозорість чорного, тож bg-black/80
        // (підкладка модалки) не збиралось. Підкладка лишається чорною в
        // обох темах: вона затемнює сторінку під модалкою.
        black: '#000000',

        // ── семантичні токени ───────────────────────────────────────────────
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
          foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        input: 'rgb(var(--input) / <alpha-value>)',
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        border: 'rgb(var(--border) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        chart: {
          1: 'rgb(var(--chart-1) / <alpha-value>)',
          2: 'rgb(var(--chart-2) / <alpha-value>)',
          3: 'rgb(var(--chart-3) / <alpha-value>)',
          4: 'rgb(var(--chart-4) / <alpha-value>)',
          5: 'rgb(var(--chart-5) / <alpha-value>)',
        },
      },
      borderRadius: {
        'base': '40px',
        'base-mini': '32px',
      },
      screens: {
        'xs': '480px',
        'sm': '610px',
        'tablet': '768px',
        'laptop': '1024px',
        'desktop': '1280px',
        'ultrawide': '1440px',
      },
      boxShadow: {
        // Тінь із проєкту dashboard: у Tailwind 3 класу shadow-xs немає,
        // а кнопки з його набору на нього спираються.
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'round': '0px 3px 16px 0px rgba(130, 145, 173, 0.25)'
      },
      keyframes: {
        "fade-in": {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        "fade-out": {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        pulseScale: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        // Поява полотна модалки — те саме, що dialog.tsx у проєкті dashboard
        // робить парою `fade-in-0 zoom-in-95`. Там це дає плагін
        // tailwindcss-animate; тут описано вручну, щоб не тягнути залежність.
        "dialog-in": {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        "dialog-out": {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.95)' },
        },
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        "fade-in": "fade-in 0.2s ease-out forwards",
        "fade-out": "fade-out 0.2s ease-out forwards",
        // duration-200 у dialog.tsx
        "dialog-in": "dialog-in 0.2s ease-out forwards",
        "dialog-out": "dialog-out 0.2s ease-out forwards",
        pulseScale: 'pulseScale 1s infinite ease-in-out',
      },
      height: {
        'mobile': 'calc(100dvh - 64px)', // Для мобільних
        'tablet': 'calc(100dvh - 72px)', // Для планшетів
        'desktop': '100dvh', // Для десктопів
      },
      minHeight: {
        'mobile': 'calc(100dvh - 64px)', // Для мобільних
        'tablet': 'calc(100dvh - 72px)', // Для планшетів
        'desktop': '100dvh', // Для десктопів
      },
    },
  },
  plugins: [],
};
export default config;
