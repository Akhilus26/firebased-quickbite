module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@/components': './components',
            '@/stores': './stores',
            '@/api': './api',
            '@/design': './design',
            '@/config': './config'
          },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
        }
      ]
    ]
  };
};
