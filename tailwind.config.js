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
          '400' : '#c1d5e7',
          '500' : '#386489',
          '600' : '#0a5074',
          '700' : '#425b71',
          '800' : '#195486',
        },
        green: {
          DEFAULT: '#289798',
        },
        base: {
          DEFAULT: '#1d1d1d',
          '100': '#292929',
          '200': '#757575',
          '300': '#545454',
          '400': '#f2f2f2',
          '500': '#333333',
          '700': '#757575', 
        },
        brand: {
          DEFAULT: '#ef2456',
          '100': '#ff4052',
          '200': '#dc4654',
          '300': '#df395e',
        },
        onsale: {
          DEFAULT: '#ef2456',
          '100': '#ff4052',
          '200': '#dc4654',
          '300': '#ed143d'
        },
        grey: {
          DEFAULT: '#9a9a9a',
          '100': '#f7f7f7',
          '200': '#e3e3e3',
          '300': '#abb7c1',
          '400': '#fafafa',
          '500' : '#6f6f6f', 
          '600' : '#dddddd', 
          '700' : '#b2b2b2', 
          
        },
      },
      boxShadow: {
        'text': '0px 0px 10px rgba(0, 0, 0, 0.3)',
      },
      spacing: {
        'negative-5': '0.313rem',
        '50' : '50px',
        'j2' : '2px',
        'j3' : '3px',
        'j5' : '5px',
        'j10' : '10px',
        'j120' : '12px',
        'j15' : '15px',
        'j7' : '29.72px',
        'j30' : '30px', 
      },
      backgroundImage: {
        'pink-gradient': 'linear-gradient(to right, #dc4654 0%, #dc4654 50%, #dc4654 51%, #ff4052 100%);',
        'Hoverpink': 'linear-gradient(to right, #dc4654 0%, #dc4654 50%, #dc4654 51%, #ff4052 100%);',
        'ul-listItem': "url('/image/icon-longArrow-brand.svg')",
      },
      width: {
        '30': '30%',
        '70': '70%',
        'j70': '70px',
        'j25': '300px',
        'j75': 'calc(100% - 300px)',
        '420': '420px',
        'j600': '600px',
        'j900': '900px' 
      },
      height: {        
        'j70': '70px',    
      },
      fontSize: {
        '0': '0px',
        '97': '97.5%',
        '90': '90%',
        '10': '10px',
        '11': '11px',
        '13': '13px',
        '14': '14px',
        '15': '15px',
        '17': '17px',
        '18': '18px',
        '19': '19px',
        '22': '22px',
        '25': '25px',
        '26': '26px',
        '27': '27px',
        '34': '34px',
        '38': '38px',
        '40': '40px',
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
      },
      lineHeight: {
        'j18': '18px',  // Added line height of 18px
      },
      keyframes: {
        blink1: {
          '0%, 100%': { opacity: '0' },
          '5%, 90%': { opacity: '1' },
        }
      },
      animation: {
        blink1 : 'blink1 5s linear'
      },
      screens: {
        'sm' : '480px',
        'tb' : '992px',
        'jlg' : '1200px',
        'jxl' : '1301px',
        '2xl' : '1501px',
        'j2xl': '1600px',
        '3xl': '1800px',
      }
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '20px',
        j2xl: '50px',
      },
      screens: {
        j2xl: '1600px',  // only define this one breakpoint
        '3xl': '1800px',
      },
    },
    plugins: [],
  }
}
  
  