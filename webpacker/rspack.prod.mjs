// webpack config for production

import { merge } from 'webpack-merge';

import { commonConfig } from './rspack.common.mjs';

export const prodConfig = merge(commonConfig, {
  mode: 'production',
  // target: ['web', 'es2020'],
  plugins: [
    // new MiniCssExtractPlugin({
    //   filename: 'styles.css',
    //   ignoreOrder: false,
    // }),
  ],
});
