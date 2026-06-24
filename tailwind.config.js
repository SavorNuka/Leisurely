/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Legacy tokens — preserved for backward-compat across all existing components
        sage: {
          DEFAULT: '#7D9B76',
          light: '#9BB594',
          dark: '#5E7A58',
        },
        terracotta: {
          DEFAULT: '#C17B5A',
          light: '#D4957A',
          dark: '#A0623E',
        },
        cream: '#F5F0E8',
        olive: {
          DEFAULT: '#3D4A2E',
          light: '#556640',
        },
        // New design-system tokens
        sand: {
          50:  '#FDFCF9',
          100: '#F2F1EC',
          200: '#EAE8E1',
          300: '#D9D5C8',
        },
        saffron: {
          400: '#E8A94B',
          500: '#D4941E',
        },
        clay: {
          400: '#C8674A',
          500: '#A84E33',
        },
        ink: {
          900: '#1C1A18',
          700: '#3D3A35',
          400: '#7A756C',
        },
      },
      fontFamily: {
        // Swap underlying fonts while keeping the same utility names so all
        // existing font-serif / font-sans classes pick up the new typefaces.
        serif:   ['"Fraunces"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card:        '0 2px 8px rgba(28,26,24,0.08), 0 0 0 1px rgba(28,26,24,0.04)',
        'card-hover':'0 6px 20px rgba(28,26,24,0.12), 0 0 0 1px rgba(28,26,24,0.06)',
        focus:       '0 0 0 3px rgba(232,169,75,0.4)',
      },
      keyframes: {
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'card-pop': {
          '0%':   { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 200ms ease-out',
        'card-pop': 'card-pop 180ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in':  'fade-in 150ms ease-in-out',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
