const path = require('path');

module.exports = {
   resolve: {
      modules: [path.resolve(__dirname, './src'), 'node_modules'],
      extensions: ['.js', '.jsx', '.json'],
      alias: {
         repositories: path.resolve(__dirname, './src/repositories')
      }
   },
}