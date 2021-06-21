/*
 * @Version: 2.0
 * @Autor: xieyan
 * @Date: 2021-06-12 17:06:42
 * @LastEditors: xieyan
 * @LastEditTime: 2021-06-12 17:08:30
 */
module.exports = path => () => import('@/views/' + path + '.vue');