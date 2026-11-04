import path from 'node:path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { container } from 'webpack';
import type { Configuration as WebpackConfiguration } from 'webpack';
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import webpack from 'webpack';

import shared from '../shared-store/webpack.shared';

const { ModuleFederationPlugin } = container;

const remotes = {
  auth: `auth@${process.env.AUTH_REMOTE_URL ?? 'http://localhost:4101/remoteEntry.js'}`,
  dashboard: `dashboard@${process.env.DASHBOARD_REMOTE_URL ?? 'http://localhost:4102/remoteEntry.js'}`,
  profile: `profile@${process.env.PROFILE_REMOTE_URL ?? 'http://localhost:4103/remoteEntry.js'}`,
  settings: `settings@${process.env.SETTINGS_REMOTE_URL ?? 'http://localhost:4104/remoteEntry.js'}`,
};

const config: WebpackConfiguration & {
  devServer?: DevServerConfiguration;
} = {
  entry: './src/index.tsx',

  mode: 'development',

  devtool: 'source-map',

  devServer: {
    port: 3098,
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
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
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
      name: 'host',
      remotes,
      shared,
    }),

    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};

export default config;