var webpack = require('webpack');

module.exports = {
    devtool: 'eval',
    entry: [
        './reacttest-src/reactive'
    ],
    output: {
        path: __dirname + '/reacttest/',
        filename: 'reactive.js',
        publicPath: '/reacttest/'
    },
    plugins: [
    ],
    resolve: {
        extensions: ['', '.js']
    },
    module: {
        loaders: [
            { test: /\.js$/, loaders: ['jsx?harmony'], exclude: /node_modules/ },
        ]
    }
};