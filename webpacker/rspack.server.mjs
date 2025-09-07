// webpack config for dev demo using webpack-dev-server

import { merge } from 'webpack-merge';

import { devConfig } from './rspack.dev.mjs';

export const devServerConfig = merge(devConfig, {
  devServer: {
    // contentBase: path.resolve(__dirname, '../build'),
    // open: true,
    // host: '0.0.0.0',
    port: 8999,
    // hot: true,
    historyApiFallback: true,
    // compress: true,
    // inline: true,
    // clientLogLevel: 'silent',
    // clientLogLevel: 'debug',
  },
});
