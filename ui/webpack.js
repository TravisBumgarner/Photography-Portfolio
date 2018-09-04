const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: {
        app: './src/index.js'
    },
    output: {
        filename: '[name]-[hash].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['@babel/preset-env', '@babel/preset-react'],
                    plugins: [
                        require('babel-plugin-transform-class-properties')
                    ]
                }
            }
        ]
    },
    devServer: {
        contentBase: './dist',
        port: 3000,
        historyApiFallback: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.template.ejs',
            inject: 'body'
        })
    ]
}
