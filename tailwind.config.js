module.exports = {
  purge: {
    content: [
      './src/**/*.jsx'
    ]
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      sans: ['Helvetica Neue', 'arial', 'sans-serif'],
      display: ['Wellcome Bold', 'Helvetica Neue', 'arial', 'sans-serif']
    },
    extend: {
      colors: {
        sanger: {
          'light-blue': '#b2c9d3',
          'medium-blue': '#597fba',
          blue: '#2d3a87',
          'dark-blue': '#232642'
        }
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
}
