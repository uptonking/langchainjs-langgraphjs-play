// shared webpack config object for dev, build, prod, demo...
import rspack from '@rspack/core';

const isDev = process.env.NODE_ENV !== 'production';

/** @type {import("@rspack/cli").Configuration} */
export const commonConfig = {
  module: {
    rules: [
      {
        test: /\.(t|j)sx$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            isModule: true,
            sourceMaps: true,
            jsc: {
              target: 'es2020',
              loose: false,
              externalHelpers: true,
              preserveAllComments: isDev ? true : false,
              parser: {
                syntax: 'typescript',
                jsx: true,
              },
              transform: {
                react: {
                  // runtime: 'automatic',
                  runtime: 'classic',
                  throwIfNamespace: true,
                  useBuiltins: true,
                  // development: isDev,
                  // refresh: isDev
                },
                // useDefineForClassFields: false,
              },
            },
          },
        },
        type: 'javascript/auto',
      },
      {
        test: /\.ts$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            isModule: true,
            sourceMaps: true,
            jsc: {
              target: 'es2020',
              loose: false,
              externalHelpers: true,
              preserveAllComments: isDev ? true : false,
              parser: {
                syntax: 'typescript',
              },
            },
          },
        },
        type: 'javascript/auto',
      },
      {
        test: /\.s(a|c)ss$/,
        use: [
          { loader: 'style-loader', options: { esModule: false } },
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader', options: { esModule: false } },
          'css-loader',
        ],
      },
      {
        test: /\.(jpg|jpeg|png|gif|ico)$/,
        type: 'asset',
      },
      {
        test: /\.(svg)$/,
        type: 'asset/source',
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        type: 'asset',
        // type: 'asset/resource',
      },
    ],
  },

  plugins: [
    // new ReactRefreshPlugin(),
    new rspack.ProgressPlugin(),
  ],
  resolve: {
    extensions: ['.tsx', '.jsx', '.ts', '.js', '.mjs', '.cjs'],
  },
  experiments: {
    // css: false,
    // outputModule: true,
    rspackFuture: {
      bundlerInfo: { force: true },
      // newTreeshaking: true,
    },
  },
  optimization: {
    // Disabling minification because it takes too long on CI
    minimize: false,
    // removeAvailableModules: true,
    // mergeDuplicateChunks: true,
  },
};
