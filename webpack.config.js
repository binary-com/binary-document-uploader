const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry : './src',
    output: {
        library      : 'DocumentUploader',
        libraryTarget: 'umd',
        libraryExport: 'default',
        path         : __dirname,
        filename     : 'DocumentUploader.js',
    },
    module: {
        rules: [
            {
                test   : /\.js$/,
                exclude: /node_modules/,
                use    : {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    optimization: {
        minimize : true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
    },
};
