const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  purge: {
    content: [
      './src/**/*.jsx'
    ]
  },
  darkMode: 'class',
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
        subheading: 'theme("colors.gray.500")',
        dark: {
          primary: '#9fc5ff', // inverted and hue-rotated
          heading: 'theme("colors.gray.200")',
          subheading: 'theme("colors.gray.300")'
        }
      },
      spacing: {
        header: defaultTheme.spacing[16],
        'header-md': `calc(${defaultTheme.spacing[28]} + ${defaultTheme.spacing[2]})`,
        'header-overlap': '4.5rem' // 3 x 1.5rem / spacing.6 = "18"
      },
      gridTemplateRows: {
        '1-full': '100%'
      },
      screens: {
        big: '2160px'
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
}
