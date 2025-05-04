import { EnvironmentPlugin } from 'webpack';
import Dotenv from 'dotenv-webpack';
module.exports = {
  plugins: [new Dotenv()],
};
