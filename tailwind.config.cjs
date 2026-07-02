/**
 * Refreshed for 2026: deep-indigo primary, slate neutrals, soft elevation
 * scale, tighter heading rhythm. Existing brand tokens (accent / navy /
 * primary-blue / etc.) are kept so legacy components don't break; new code
 * should reach for `brand`, `ink`, `surface`, `hairline` instead.
 */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // — 2026 brand: deep teal. "Blue is invisible" in fintech (every
        // competitor uses it); teal is trustworthy but stands apart.
        brand: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',   // primary
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // — Neutrals: warm stone scale (replaces cold slate). Easier on the
        // eye for long browsing sessions on a finance app.
        ink: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        // — Accent: emerald for "best deal" highlights. Pops against teal.
        // DEFAULT lets legacy `text-accent` / `bg-accent` (without level)
        // continue to work — re-pointed to a brand-adjacent teal for sites
        // that still use the bare token.
        accent: {
          DEFAULT: '#0f766e',  // matches brand-700 — preserves legacy look
          50:  '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        // Semantic surfaces (paired with .dark overrides in index.css via CSS vars)
        surface: {
          DEFAULT:  '#ffffff',
          subtle:   '#fafaf9',
          elevated: '#ffffff',
          inverse:  '#0c0a09',
        },
        hairline: {
          subtle:  '#e7e5e4',
          DEFAULT: '#d6d3d1',
          strong:  '#a8a29e',
        },
        // — Legacy tokens re-pointed so existing className use still looks OK —
        navy: '#134e4a',
        'light-bg': '#fafaf9',
        'body-text': '#1c1917',
        'primary-blue': '#0f766e',
        'soft-blue': '#f0fdfa',
        'text-dark': '#1c1917',
        'gray-bg': '#fafaf9',
        primary: '#0f766e',
        secondary: '#dc2626',
        text: '#1c1917',
        background: '#fafaf9',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          "'Segoe UI'",
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        display: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          "'Segoe UI'",
          'sans-serif',
        ],
      },
      fontSize: {
        // Tighter display sizes for 2026 hero/headline rhythm.
        'display-sm': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        'display':    ['2.5rem',   { lineHeight: '2.75rem', letterSpacing: '-0.025em' }],
        'display-lg': ['3.25rem',  { lineHeight: '3.5rem',  letterSpacing: '-0.03em' }],
      },
      letterSpacing: {
        'tighter-2': '-0.02em',
      },
      boxShadow: {
        // Soft, large-blur, low-opacity. The 2026 standard.
        'soft':    '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.04)',
        'lift':    '0 4px 16px -4px rgb(15 23 42 / 0.08), 0 2px 6px -2px rgb(15 23 42 / 0.04)',
        'lift-lg': '0 12px 32px -8px rgb(15 23 42 / 0.12), 0 4px 12px -4px rgb(15 23 42 / 0.06)',
        'inset-glow': 'inset 0 0 0 1px rgb(20 184 166 / 0.18)',
        'focus-ring': '0 0 0 3px rgb(20 184 166 / 0.32)',
      },
      borderRadius: {
        // Slightly larger default for the 2026 rounded-but-not-pillowy look.
        'xl': '0.875rem',
        '2xl': '1.125rem',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'out-back':  'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'fade-in':     'fadeIn 0.25s ease-out',
        'fade-up':     'fadeUp 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
        'scale-in':    'scaleIn 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer':     'shimmer 1.6s linear infinite',
      },
      keyframes: {
        fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeUp:   { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:  { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer:  { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
      },
    },
  },
  plugins: [],
};
