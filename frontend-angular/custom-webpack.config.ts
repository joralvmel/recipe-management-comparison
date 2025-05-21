import * as webpack from 'webpack';
import DotenvWebpackPlugin from 'dotenv-webpack';

export default {
  plugins: [
    new DotenvWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.USE_BACKEND': JSON.stringify(process.env['USE_BACKEND'] || 'false'),
      'process.env.API_URL': JSON.stringify(process.env['API_URL'] || 'http://localhost:3000')
    })
  ]
} as webpack.Configuration;
