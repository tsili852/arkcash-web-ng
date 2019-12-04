module.exports = {
  theme: {
    extend: {
      screens: {
        'xl': '1300px'
      },
      colors: {
        'navy-darkest': '#04101B',
        'navy-darker': '#081F36',
        'navy-dark': '#0C2F51',
        'navy': '#0D345A',
        'navy-light': '#56718C',
        'navy-ligher': '#9EAEBD',
        'navy-lightest': '#E7EBEF'
      },
      spacing: {
        '72': '18rem',
        '80': '20rem',
        '88': '22rem',
        '96': '24rem'
      },
      width: {
        '72': '18rem',
        '80': '20rem',
        '88': '22rem',
        '96': '24rem'
      },
      borderRadius: {
        'xl': '1rem'
      }
    }
  },
  variants: {},
  plugins: [
    require('@tailwindcss/custom-forms'),
  ]
}
