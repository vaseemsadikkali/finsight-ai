const postcssConfig = {
  plugins: {
    '@tailwindcss/postcss': {},   // Core Fix: Replaces standard 'tailwindcss' for your version
    'autoprefixer': {},            // Ensures clean fallback layers across older layout browsers
    'postcss-preset-env': {
      stage: 2,
      features: {
        'lab-function': true,      // Downlevels lab() color vectors safely so Turbopack doesn't crash
      },
    },
  },
};

export default postcssConfig;