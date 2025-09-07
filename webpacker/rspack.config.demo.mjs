import rspack from '@rspack/core';

import path from 'node:path';
import { merge } from 'webpack-merge';

import { devServerConfig } from './rspack.server.mjs';

/** @type {import('@rspack/cli').Configuration} */
const demoConfig = merge(
  devServerConfig,

  {
    entry: {
      main: './src/render.tsx',
    },
    output: {
      filename: 'main.js',
      path: path.resolve(import.meta.dirname, '../dist'),
      // path: path.resolve(process.cwd(), 'dist')
      // path: path.resolve(__dirname, '../build'),
    },
    module: {
      rules: [
        // {
        //   test: /\.tsx$/,
        //   use: {
        //     loader: 'builtin:swc-loader',
        //     options: {
        //       sourceMap: true,
        //       jsc: {
        //         parser: {
        //           syntax: 'typescript',
        //           jsx: true,
        //         },
        //         externalHelpers: true,
        //         preserveAllComments: false,
        //         transform: {
        //           react: {
        //             runtime: 'automatic',
        //             throwIfNamespace: true,
        //             useBuiltins: false,
        //           },
        //         },
        //       },
        //     },
        //   },
        //   type: 'javascript/auto',
        // },
        // {
        //   test: /\.(jpg|jpeg|png|gif|svg|ico)$/,
        //   type: 'asset',
        // },
      ],
    },
    optimization: {
      // Disabling minification because it takes too long on CI
      minimize: false,
      moduleIds: 'named',
      chunkIds: 'named',
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
  },
);

export default demoConfig;
