const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Update entry point
      webpackConfig.entry = {
        main: [
          env === 'development' && 
            require.resolve('react-dev-utils/webpackHotDevClient'),
          paths.appIndexJs,
        ].filter(Boolean),
      };

      // Add Electron node modules to webpack's externals
      webpackConfig.externals = {
        electron: 'commonjs electron',
        'electron-store': 'commonjs electron-store',
        'electron-log': 'commonjs electron-log',
        'electron-updater': 'commonjs electron-updater',
        'sqlite3': 'commonjs sqlite3',
        'sharp': 'commonjs sharp',
      };

      // Update output
      webpackConfig.output = {
        ...webpackConfig.output,
        filename: 'static/js/[name].js',
        chunkFilename: 'static/js/[name].chunk.js',
        path: path.resolve(__dirname, 'build'),
        publicPath: './',
      };

      // Add source map support
      webpackConfig.devtool = env === 'production' 
        ? 'source-map' 
        : 'cheap-module-source-map';

      // Add resolve aliases
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@': path.resolve(__dirname, 'app'),
        '@shared': path.resolve(__dirname, 'app/shared'),
        '@backend': path.resolve(__dirname, 'app/backend'),
        '@renderer': path.resolve(__dirname, 'app/renderer'),
        '@components': path.resolve(__dirname, 'app/renderer/components'),
        '@hooks': path.resolve(__dirname, 'app/renderer/hooks'),
        '@contexts': path.resolve(__dirname, 'app/renderer/contexts'),
      };

      // Add fallbacks for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
      };

      // Optimize chunks
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          automaticNameDelimiter: '~',
          cacheGroups: {
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
        runtimeChunk: {
          name: entrypoint => `runtime-${entrypoint.name}`,
        },
      };

      // Add custom plugins for Electron
      webpackConfig.plugins.push(
        new (require('webpack').DefinePlugin)({
          'process.env.ELECTRON': JSON.stringify(true),
          'process.env.NODE_ENV': JSON.stringify(env),
        })
      );

      return webpackConfig;
    },
  },
  devServer: {
    hot: true,
    port: 3000,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
    },
    devMiddleware: {
      writeToDisk: true,
    },
    onListening: function (devServer) {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      const port = devServer.server.address().port;
      console.log(`🚀 React dev server running on port ${port}`);
    },
  },
  babel: {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react',
      '@babel/preset-typescript',
    ],
    plugins: [
      '@babel/plugin-transform-runtime',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-object-rest-spread',
      'babel-plugin-macros',
    ],
  },
  jest: {
    configure: {
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/app/$1',
        '^@shared/(.*)$': '<rootDir>/app/shared/$1',
        '^@backend/(.*)$': '<rootDir>/app/backend/$1',
        '^@renderer/(.*)$': '<rootDir>/app/renderer/$1',
        '^@components/(.*)$': '<rootDir>/app/renderer/components/$1',
        '^@hooks/(.*)$': '<rootDir>/app/renderer/hooks/$1',
        '^@contexts/(.*)$': '<rootDir>/app/renderer/contexts/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/app/setupTests.ts'],
      collectCoverageFrom: [
        'app/**/*.{ts,tsx}',
        '!app/**/*.d.ts',
        '!app/main.ts',
        '!app/renderer/index.tsx',
      ],
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      },
    },
  },
};
