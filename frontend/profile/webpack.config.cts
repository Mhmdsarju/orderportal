import path from 'node:path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { container } from 'webpack';
import type { Configuration as WebpackConfiguration } from 'webpack';
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import webpack from 'webpack';

import shared from '../shared-store/webpack.shared';

const { ModuleFederationPlugin } = container;

const config: WebpackConfiguration & {
  devServer?: DevServerConfiguration;
} = {
  entry: './src/index.tsx',

  mode: 'development',

  devtool: 'source-map',

  devServer: {
    port: 4103,
    historyApiFallback: true,

    headers: {
      'Access-Control-Allow-Origin': '*',
    },

    static: path.resolve(__dirname, 'public'),

    hot: true,
  },

  output: {
    publicPath: 'auto',
    clean: true,
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],

    modules: [
      path.resolve(__dirname, '../../node_modules'),
      'node_modules',
    ],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      __ORDERPORTAL_API_URL__: JSON.stringify(
        process.env.API_BASE_URL ?? 'http://localhost:3000/api',
      ),
    }),

    new ModuleFederationPlugin({
      name: 'profile',
      filename: 'remoteEntry.js',

      exposes: {
        './ProfileApp': './src/ProfileApp.tsx',
      },

      shared,
    }),

    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};

export default config;