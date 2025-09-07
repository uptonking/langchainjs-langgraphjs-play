import rspack from '@rspack/core';

import path from 'node:path';
import { merge } from 'webpack-merge';

import { prodConfig } from './rspack.prod.mjs';

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
  },
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
  // optimization: {
  //   moduleIds: 'named',
  //   chunkIds: 'named',
  //   minimize: true,
  // },
  // devServer: {
  //   contentBase: path.resolve(__dirname, '../build'),
  // },
});

export default prodOutputConfig;
