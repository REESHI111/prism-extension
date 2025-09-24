const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: {
      background: './src/background/service-worker.ts',
      'content-script': './src/content/content-script.ts',
      popup: './src/popup/index.tsx',
    },
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true,
    },
    
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext]',
          },
        },
      ],
    },
    
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public/manifest.json',
            to: 'manifest.json',
          },
          {
            from: 'src/assets',
            to: 'assets',
            noErrorOnMissing: true,
          },
          {
            from: 'src/data',
            to: 'data',
            noErrorOnMissing: true,
          },
        ],
      }),
      
      new HtmlWebpackPlugin({
        template: './src/popup/popup.html',
        filename: 'popup.html',
        chunks: ['popup'],
      }),
    ],
    
    devtool: isProduction ? false : 'source-map',
    
    optimization: {
      minimize: isProduction,
    },
    
    watch: argv.mode === 'development',
    watchOptions: {
      ignored: /node_modules/,
    },
  };
};