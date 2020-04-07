const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

let apiHost
let publicPath
setupEnv = () => {
    switch (process.env.NODE_ENV) {
        case 'development':
            apiHost = "'http://localhost:8000/'"
            publicPath = '/'
            break
        default:
            apiHost = "'https://api.travisbumgarner.photography/'"
            publicPath = '/static'
    }
}
setupEnv()

module.exports = env => {
    return {
        entry: {
            app: './src/index.tsx'
        },
        output: {
            filename: '[name]-[hash].bundle.js',
            path: path.resolve(__dirname, 'dist'),
            publicPath
        },
        resolve: {
            alias: {
                sharedComponents: path.resolve(__dirname, 'src/sharedComponents/'),
                sharedTypes: path.resolve(__dirname, 'src/sharedTypes/index.ts'),
                theme: path.resolve(__dirname, 'src/theme.tsx'),
                utilities: path.resolve(__dirname, 'src/utilities/')
            },
            extensions: ['.ts', '.tsx', '.js']
        },
        module: {
            rules: [
                {
                    test: /\.[jt]s[x]$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
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
