// default webpack config for dev, build & test

import { merge } from 'webpack-merge';

import rspack from '@rspack/core';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';

import { commonConfig } from './rspack.common.mjs';

function checkAppEnv(env) {
  return (
    process.env.REACT_APP_ENV &&
    process.env.REACT_APP_ENV.toLowerCase().indexOf(env) !== -1
  );
}

// 用在react项目打包阶段，会启用jsx转换，而不会启用热更新
const isEnvReactHot = checkAppEnv('reacthot');

export const devConfig = merge(commonConfig, {
  mode: 'development',
  // devtool: 'eval-source-map',
  devtool: 'eval',
  // target: process.env.NODE_ENV === 'production' ? 'browserslist' : 'web',
  target: 'web',
  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    isEnvReactHot && new ReactRefreshPlugin(),
  ].filter(Boolean),
});
