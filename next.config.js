const withPlugins = require('next-compose-plugins');
const images = require('next-images');
const sass = require('@zeit/next-sass');
const webpack = require('webpack');

require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});

const nextConfig = {
  distDir: 'build',
  webpack: (config) => {
    const newConfig = config;
    newConfig.node = {
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
    };
    const env = Object.keys(process.env).reduce((acc, curr) => {
      acc[`process.env.${curr}`] = JSON.stringify(process.env[curr]);
      return acc;
    }, {});
    newConfig.plugins.push(new webpack.DefinePlugin(env));
    return newConfig;
  },
};

module.exports = withPlugins([
  [sass, {
    cssModules: true,
    cssLoaderOptions: {
      importLoaders: 1,
      localIdentName: '[local]_[hash:base64:3]',
    },
  }],
  images,
], nextConfig);
