const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
        hot: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Talwin: a simple lightweight color picker',
            template: 'template.html',
            inject: 'body'
        })
    ],
});