/*
 * @Version: 2.0
 * @Autor: xieyan
 * @Date: 2021-06-12 15:12:59
 * @LastEditors: xieyan
 * @LastEditTime: 2021-06-12 21:34:27
 */
const path = require('path');
module.exports = {
    publicPath: './',
    lintOnSave: true,
    outputDir: path.resolve(__dirname, '../public'),
    assetsDir: 'static',
    indexPath: path.resolve(__dirname, '../index.html'),
    devServer: {
        proxy: {
            '/': {
                ws: false,
                target: 'http://localhost: 3002',
                changeOrigin: true
            }
        },
        port: '3000'
    },
    productionSourceMap: false,
    chainWebpack: config => {
        config.resolve
        .symlinks(true);
        config
        .entry('index')
        .add('babel-polyfill')
    }
}