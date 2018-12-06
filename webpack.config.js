const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'web', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist', '__dashboard'),
    filename: 'ims-frontend.bundle.js',
    publicPath: process.env.NODE_ENV === 'development' ? '/' : '/__dashboard/',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.mjs'],
  },
  module: {
    strictExportPresence: true,
    rules: [
      { parser: { requireEnsure: false } },
      {
        test: /\.(js|mjs|jsx)$/,
        enforce: 'pre',
        use: [
          {
            options: {
              eslintPath: require.resolve('eslint'),
            },
            loader: require.resolve('eslint-loader'),
          },
        ],
      },
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          {
            test: /\.(js|mjs|jsx)$/,
            loader: require.resolve('babel-loader'),
            exclude: /node_modules/,
            options: {
              customize: require.resolve(
                'babel-preset-react-app/webpack-overrides',
              ),
              cacheDirectory: true,
              cacheCompression: false,
            },
          },
          {
            test: /\.css$/,
            use: [
              require.resolve('style-loader'),
              require.resolve('css-loader'),
            ],
          },
          {
            test: /\.(scss|sass)$/,
            use: [
              require.resolve('style-loader'),
              require.resolve('css-loader'),
              require.resolve('sass-loader'),
            ],
          },
          {
            exclude: [/\.(js|mjs|jsx)$/, /\.html$/, /\.json$/],
            loader: require.resolve('file-loader'),
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin([path.resolve(__dirname, 'dist')]),
    new HtmlWebpackPlugin({
      titile: 'Interactive Mock Server',
      inject: true,
      template: path.resolve(__dirname, 'web', 'index.html'),
      baseUrl: process.env.NODE_ENV === 'development' ? '/' : '/__dashboard/',
    }),
  ],
  devServer: {
    contentBase: path.resolve(__dirname, 'web'),
    port: 9100,
    before: app => {
      app.get(/__dashboard.*/, (req, res) => {
        const whitelist = ['.js', '.css', '.html'];
        if (whitelist.every(e => !new RegExp(`${e}/?`).test(req.baseUrl))) {
          res.redirect('/');
        }
      });
    },
    proxy: {
      '/__api/**': {
        target: 'http://localhost:9000',
        secure: false,
      },
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
  },
};
