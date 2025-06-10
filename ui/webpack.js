const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'app.[contenthash].js',
    path: path.resolve(__dirname, 'build'),
    assetModuleFilename: 'fonts/[name].[contenthash][ext]',
    publicPath: '/'
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource' // Use asset/resource for font files
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      src: path.resolve(__dirname, 'src')
    }
  },
  devtool: 'source-map',
  devServer: {
    compress: true,
    port: 3000,
    hot: true,
    historyApiFallback: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/public/index.template.ejs',
      favicon: './src/public/favicon.png',
      inject: 'body'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/public'),
          to: path.resolve(__dirname, 'build'),
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['**/index.template.ejs'] // Don't copy the template
          }
        }
      ]
    })
  ]
}
