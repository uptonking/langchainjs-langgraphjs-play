import rspack from '@rspack/core';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
// import type { Configuration } from '@rspack/cli';

// const config: Configuration = {
const config = {
  entry: {
    main: './src/render.tsx',
  },
  module: {
    rules: [
      {
        test: /\.tsx$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            sourceMaps: true,
            jsc: {
              parser: {
                syntax: 'typescript',
                jsx: true,
              },
              externalHelpers: true,
              preserveAllComments: false,
              transform: {
                react: {
                  runtime: 'automatic',
                  throwIfNamespace: true,
                  useBuiltins: false,
                },
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
            sourceMaps: true,
            jsc: {
              parser: {
                syntax: 'typescript',
              },
              externalHelpers: true,
              preserveAllComments: false,
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
        test: /\.(jpg|jpeg|png|gif|svg|ico)$/,
        type: 'asset',
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        // type: 'asset/resource',
        type: 'asset',
      },
    ],
  },
  optimization: {
    // Disabling minification because it takes too long on CI
    minimize: false,
  },
  plugins: [
    new ReactRefreshPlugin(),
    new rspack.HtmlRspackPlugin({
      template: './public/react-app.html',
    }),
    new rspack.CopyRspackPlugin({
      patterns: [
        {
          from: 'public',
        },
      ],
    }),
  ],
  experiments: {
    // css: true,
    rspackFuture: {
      // disableApplyEntryLazily: true,
    },
  },
  devServer: {
    port: 8999,
  },
};

export default config;
