const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

let apiHost
let publicPath
setupEnv = () => {
    console.log(process.env.NODE_ENV)
    switch (process.env.NODE_ENV) {
        case 'development':
            apiHost = "'http://localhost:8000/'"
            publicPath = '/'
            break
        default:
            apiHost = "'https://api.travisbumgarner.photography/'"
            publicPath = '/static'
    }
    console.log(apiHost)
}
setupEnv()

module.exports = env => {
    return {
        entry: {
            app: './src/index.js'
        },
        output: {
            filename: '[name]-[hash].bundle.js',
            path: path.resolve(__dirname, 'dist'),
            publicPath
        },
        resolve: {
            alias: {
                Components: path.resolve(__dirname, 'src/components/'),
                Containers: path.resolve(__dirname, 'src/containers/'),
                Views: path.resolve(__dirname, 'src/views/'),
                Theme: path.resolve(__dirname, 'src/theme.js'),
                Utilities: path.resolve(__dirname, 'src/utilities/'),
                Constants: path.resolve(__dirname, 'src/constants/')
            }
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    query: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        plugins: [require('babel-plugin-transform-class-properties')]
                    }
                }
            ]
        },
        devServer: {
            contentBase: './dist',
            port: 3000,
            historyApiFallback: true,
            publicPath: '/'
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './index.template.ejs',
                inject: 'body'
            }),
            new webpack.DefinePlugin({ __API__: apiHost })
        ]
    }
}
