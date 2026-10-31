module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './*.js',
    // Standalone UX helpers use their own CSS and no Tailwind utilities.
    '!./app-language-state.js',
    '!./app-notifications.js'
  ],
  safelist: [
    'hidden',
    'flex',
    'bg-indigo-600',
    'text-white',
    'bg-rose-500',
    'bg-emerald-500',
    'translate-x-[calc(100%+4px)]',
    'w-[calc(50%-4px)]'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
