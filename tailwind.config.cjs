module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './*.js'
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
