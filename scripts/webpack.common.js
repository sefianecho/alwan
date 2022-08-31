const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: {
        talwin: './src/index.js'
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/talwin.css'
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
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    output: {
        filename: 'js/[name].min.js',
        library: {
            type: 'umd',
            name: 'Talwin',
            umdNamedDefine: true
        }
    }
}