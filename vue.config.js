module.exports = {
  publicPath: '/',
  outputDir: 'docs',
  devServer: {
    disableHostCheck: true,
    port: 4000,
    public: '0.0.0.0:4000',
  },

  chainWebpack(config) {
    config.devtool('source-map')
  },
};
