const path = require('path')
const webpack = require('webpack')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const {getIfUtils, removeEmpty} = require('webpack-config-utils')

let VENDOR_LIBS = [
    'jquery', 
    'tether',
    'bootstrap',
];

module.exports = env => {
    const {ifProd, ifNotProd} = getIfUtils(env)
    return {
        entry: {
            vendor: VENDOR_LIBS,
            app: './src/scripts/app'
        }, 
        output: {
            path: path.join(__dirname, 'dist'),
            filename: 'js/[name].js',
            pathinfo: ifNotProd()
        },

        module: {
            rules: removeEmpty([
                { 
                    test: /\.js$/, 
                    exclude: /node_modules/, 
                    loader: 'babel-loader',
                },
                
                ifProd({
                    test: /\.s?css$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: ['css-loader?sourceMap', 'resolve-url-loader', 'postcss-loader?sourceMap', 'sass-loader?sourceMap'],
                        publicPath: '../'
                    })                   
                }),  
                
                ifNotProd({
                    test: /\.s?css$/,
                    use: [
                        { loader: 'style-loader', options: { sourceMap: true } },
                        { loader: 'css-loader', options: { sourceMap: true } },
                        { loader: 'resolve-url-loader', options: { sourceMap: true } },
                        { loader: 'postcss-loader', options: { sourceMap: true } },
                        { loader: 'sass-loader', options: { sourceMap: true } }
                    ]
                }), 

                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: path => {
                                    if (! /node_modules|bower_components/.test(path)) {
                                        return 'images/[name].[ext]?[hash]';
                                    }

                                    return 'images/vendor/' + path
                                        .replace(/\\/g, '/')
                                        .replace(
                                            /((.*(node_modules|bower_components))|images|image|img|assets)\//g, ''
                                        ) + '?[hash]';
                                }
                            }
                        },
                        'image-webpack-loader?bypassOnDebug'
                    ]
                },
                {
                    test: /\.(woff2?|ttf|eot|otf)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: path => {
                                    if (! /node_modules|bower_components/.test(path)) {
                                        return 'fonts/[name].[ext]?[hash]';
                                    }

                                    return 'fonts/vendor/' + path
                                        .replace(/\\/g, '/')
                                        .replace(
                                            /((.*(node_modules|bower_components))|fonts|font|assets)\//g, ''
                                        ) + '?[hash]';
                                }
                            }
                        }
                    ]
                }
            ])
        },

        devtool: ifProd('source-map', 'eval'),

        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            hot: true,
            stats: 'minimal'
        },

        resolve: {
            alias: { jquery: path.resolve(__dirname, 'node_modules/jquery/dist/jquery.js') }, // resolve summernote
        },

        plugins: removeEmpty([
            new ProgressBarPlugin(),
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'window.jQuery': 'jquery',
                Tether: 'tether',
                'window.Tether': 'tether',
            }),
            ifProd(new CleanWebpackPlugin(['dist/js', 'dist/css'], {
                root:     __dirname,
                verbose:  true,
                dry:      false
            })),
            new ExtractTextPlugin({ 
                filename: 'css/style.css', allChunks: true
            }),
            //ifProd(new InlineManifestWebpackPlugin()),
            new webpack.optimize.CommonsChunkPlugin({
                names: ['vendor', 'manifest'],
            }),
            ifProd(new webpack.optimize.UglifyJsPlugin({
                compress: {
                    screw_ie8: true,
                    warnings: false,
                },
            })),
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: ifProd('"production"', '"development"')
                }
            }),
            ifNotProd(new webpack.HotModuleReplacementPlugin()),
            ifNotProd(new webpack.NamedModulesPlugin()),

            new HtmlWebpackPlugin({
                title: 'Home',
                //favicon: './src/images/favicon.png',
                filename: './index.html',
                template: './src/index.html'
            }),
        ])
    }
}
