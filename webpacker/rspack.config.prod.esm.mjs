import rspack from '@rspack/core';

import path from 'node:path';
import { merge } from 'webpack-merge';

import { prodConfig } from './rspack.prod.mjs';

/** @type {import('@rspack/cli').Configuration} */
const prodOutputConfig = merge(prodConfig, {
  entry: {
    // main: path.resolve(__dirname, '../src/render.tsx'),
    main: './src/render.tsx',
  },
  output: {
    filename: 'main.js',
    path: path.resolve(import.meta.dirname, '../build'),
    // path: './build',
    // path: path.resolve(__dirname, '../build'),
    module: true,
    libraryTarget: 'module',
    chunkFormat: 'module',
  },
  target: ['web', 'es2020'],
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: './public/react-app.html',
    }),
    // new rspack.CopyRspackPlugin({
    //   patterns: [
    //     {
    //       from: 'public',
    //     },
    //   ],
    // }),
  ],
  // devServer: {
  //   contentBase: path.resolve(__dirname, '../build'),
  // },
  experiments: {
    // css: true,
    outputModule: true,
  },
  optimization: {
    moduleIds: 'named',
    chunkIds: 'named',
    minimize: false,
  },
});

export default prodOutputConfig;
