import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0d1117',
        panel: '#161b22',
        panel2: '#1c2028',
        hair: '#2a2f38',
        amber: {
          DEFAULT: '#ffb400',
          soft: 'rgba(255,180,0,0.18)',
          tap: 'rgba(255,180,0,0.28)'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
export default config
