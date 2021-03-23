const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  purge: {
    content: [
      './src/**/*.jsx'
    ]
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      sans: defaultTheme.fontFamily.sans,
      heading: defaultTheme.fontFamily.sans
    },
    container: false,
    extend: {
      colors: {
        gray: colors.blueGray,
        primary: colors.blue[700],
        heading: 'theme("colors.gray.600")',
        subheading: 'theme("colors.gray.500")'
      },
      spacing: {
        header: defaultTheme.spacing[16],
        'header-md': defaultTheme.spacing[32]
      },
      gridTemplateRows: {
        '1-full': '100%'
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
}
