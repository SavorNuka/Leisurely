/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
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
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(61,74,46,0.10)',
        'card-hover': '0 4px 16px rgba(61,74,46,0.16)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
