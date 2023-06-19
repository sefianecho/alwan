const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env) => {
    const config = {
        mode: env.prod ? 'production' : 'development',

        devtool: env.prod ? 'source-map' : 'inline-source-map',

        entry: {
            alwan: './src/index.js',
        },

        devServer: {
            static: './test',
            hot: true,
        },

        plugins: [
            new MiniCssExtractPlugin({
                filename: 'css/[name].min.css',
            }),
            new DefinePlugin({
                VERSION: JSON.stringify(require('./package.json').version),
            }),
        ],

        module: {
            rules: [
                {
                    test: /\.s?css$/i,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
                },
                {
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: 'babel-loader',
                },
            ],
        },

        optimization: {
            minimizer: env.prod && [
                new TerserPlugin({
                    terserOptions: {
                        mangle: {
                            properties: {
                                regex: /^_/,
                            },
                        },
                    },
                }),
            ],
        },

        output: {
            filename: 'js/[name].min.js',
            library: {
                type: 'umd',
                name: 'Alwan',
                export: 'default',
                umdNamedDefine: true,
            },
        },
    };

    if (!env.prod) {
        config.plugins.push(
            new HtmlWebpackPlugin({
                title: 'Alwan: a simple lightweight color picker',
                template: './test/index.html',
                filename: 'index.html',
            })
        );
    }

    return config;
};
