/*
 * @Version: 2.0
 * @Autor: xieyan
 * @Date: 2021-06-12 16:42:35
 * @LastEditors: xieyan
 * @LastEditTime: 2021-06-12 16:42:35
 */
module.exports = {
    root: true,
    env: {
      node: true
    },
    'extends': [
      'plugin:vue/essential',
      'eslint:recommended'
    ],
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    },
    parserOptions: {
      parser: 'babel-eslint'
    }
  }
  