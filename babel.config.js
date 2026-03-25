module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@services': './src/services',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@styles': './src/styles',
            '@appTypes': './src/types',
            '@context': './src/context',
            '@assets': './assets',
          },
        },
      ],
      // IMPORTANT: reanimated must be last
      'react-native-reanimated/plugin',
    ],
  };
};
