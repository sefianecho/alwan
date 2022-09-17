const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = {
    entry: {
        alwan: './src/js/index.js'
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].min.css'
        }),
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(require('../package.json').version)
        })
    ],
    module: {
        rules: [
            {
                test: /\.s?css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    output: {
        filename: 'js/[name].min.js',
        library: {
            type: 'umd',
            name: 'Alwan',
            export: 'default',
            umdNamedDefine: true
        }
    }
}