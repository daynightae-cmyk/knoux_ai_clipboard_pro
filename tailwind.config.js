export default {
  darkMode: ['class', '[data-mode="dark"]'],
  content: [
    './index.html',
    './app/renderer/**/*.{js,ts,jsx,tsx,mdx}',
    './app/renderer/components/**/*.{js,ts,jsx,tsx}',
    './app/renderer/views/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        knoux: {
          purple500: '#8226EE',
          purple700: '#500FC8',
          violet900: '#381584',
          indigo950: '#1C0B4E',
          blackPurple: '#0D0527',
          orchid400: '#A74CE7',
          lilac300: '#C17CEB',
          lavender100: '#CFB4EA',
          lavenderWhite: '#F3E6FB',
          softWhite: '#FCFAFF'
        }
      },
      boxShadow: {
        'knoux-glow': '0 8px 32px rgba(130, 38, 238, 0.08), 0 2px 8px rgba(130, 38, 238, 0.04)',
        'knoux-glow-lg': '0 20px 60px rgba(130, 38, 238, 0.15)'
      }
    }
  },
  plugins: []
};
