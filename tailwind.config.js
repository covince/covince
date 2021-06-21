const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

const covinceConfig = require("covince/tailwind.config");

module.exports = {
  ...covinceConfig,
  purge: {
    content: ["./src/**/*.jsx", "./node_modules/covince/src/**/*.jsx"],
  },
  plugins: []
};
