const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'development', // or 'production'
    entry: './src/app/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'src/app')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [
                    path.resolve(__dirname, 'node_modules'),
                    path.resolve(__dirname, 'dist'),
                    path.resolve(__dirname, 'src/node_modules'),
                    path.resolve(__dirname, 'src/app/bundle.js')
                ],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    resolve: {
        fallback: {
            "fs": false,
            "path": false,
            "child_process": false,
            "os": false,
            "process": false,
            "util": require.resolve('util/'),
            "url": false,
            "stream": false,
            "assert": require.resolve('assert/'),
            "constants": require.resolve('constants-browserify')
        }
    },
    plugins: [
        new webpack.IgnorePlugin({
            resourceRegExp: /^node:/
        })
    ]
};
