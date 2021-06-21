/*
 * @Version: 2.0
 * @Autor: xieyan
 * @Date: 2021-06-12 16:50:16
 * @LastEditors: xieyan
 * @LastEditTime: 2021-06-12 20:39:08
 */
import io from 'socket.io-client';
let host = location.origin;
const socket = io.connect(host);
export default socket;
