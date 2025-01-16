/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
      extend: {
          colors: {
              blue: {
                  DEFAULT: '#334f67',
                  '100': '#102e48',
                  '200': '#97b9c5',
                  '300' : '#b2c8dc',
              },
              base: {
                  DEFAULT: '#1d1d1d',
                  '100': '#292929',
                  '700': '#757575',
              },
              brand: {
                  DEFAULT: '#ef2456',
                  '100': '#ff4052',
                  '200': '#dc4654',
              },
              grey: {
                  DEFAULT: '#9a9a9a',
                  '100': '#f7f7f7',
                  '200': '#e3e3e3',
                  '300': '#abb7c1',
              }

          },
          fontSize: {
              '13': '13px',
              '15': '15px',
          },
          fontFamily: {
              'poppins': ['"Poppins"'],
          },
          borderWidth: {
              '50': '50px',
          }
      },
      container: {
          center: true,
          padding: {
              DEFAULT: '20px',
              '2xl': '50px',
          },
          screens: {
              '2xl': '1860px',
          },     
  }
  },
  plugins: [],
}