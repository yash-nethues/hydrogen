/** @type {import('tailwindcss').Config} */
export default {
    content: ['./app/**/*.{js,jsx,ts,tsx}'],
    theme: {
      extend: {
        colors: {
          blue: {
              DEFAULT: '#334f67',
              '100': '#102e48',
              '200': '#97b9c5',
              '300' : '#b2c8dc',
              '400' : '#c1d5e7'
           },
          base: {
              DEFAULT: '#1d1d1d',
              '100': '#292929',
              '700': '#757575'
          },
          brand: {
              DEFAULT: '#ef2456',
              '100': '#ff4052',
              '200': '#dc4654'
          },
          grey: {
              DEFAULT: '#9a9a9a',
              '100': '#f7f7f7',
              '200': '#e3e3e3',
              '300': '#abb7c1',
              '400': '#fafafa',
              '500' : '#6f6f6f' 
          },
  
      },
      boxShadow: {
        'text': '0px 0px 10px rgba(0, 0, 0, 0.3)',
      },
      spacing: {
          'negative-5': '0.313rem',
          '50' : '50px',
          'p-2' : '2px'   
        },
       backgroundImage: {
        'pink-gradient': 'linear-gradient(to right, #dc4654 0%, #dc4654 50%, #dc4654 51%, #ff4052 100%)',
  
        },
      margin: {
          '50' : '50px'
      },
      width: {
        '30': '30%',
        '70': '70%',
        '420': '420px'
   
      },

      fontSize: {
        '0': '0px',
        '10': '10px',
        '13': '13px',
        '14': '14px',
        '15': '15px',
        '17': '17px',
        '18': '18px',
        '22': '22px',
        '25': '25px',
        '34': '34px',
        '38': '38px',
        '40': '40px',
        '48': '2.5vw',
          
      },
      fontFamily: {
          Poppins: ['Poppins']
      },
      borderWidth: {
          '50': '50px'
      },
      borderRadius: {
        '5xl': '3rem',

      },
      borderColor:{
          'gray' : '#ccc'
      },
      backgroundColor: {
        themegray: '#fafafa',
        themeteal: '#289798'
  
      }
  },
  container: {
      center: true,
      padding: {
          DEFAULT: '20px',
          '2xl': '50px'
      },
      screens: {
          '2xl': '1800px'
      },
  },
    plugins: [],
  }
}
  
  