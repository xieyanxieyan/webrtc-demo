/*
 * @Version: 2.0
 * @Autor: xieyan
 * @Date: 2021-06-11 14:42:24
 * @LastEditors: xieyan
 * @LastEditTime: 2021-07-02 20:06:07
 */
const Koa = require('koa');
const Socket = require('koa-socket');
const koaSend = require('koa-send');
const static = require('koa-static');
const path = require('path');
const users = {}; // 保存用户
const socks = {}; // 保存socket
const io = new Socket();

const app = new Koa();
io.attach(app);

app.use(static(
    path.join(__dirname, './public')
));

app.use(async (ctx, next) => {
    if (!/\./.test(ctx.request.url)) {
        await koaSend(
            ctx,
            'index.html',
            {
                root: path.join(__dirname, './'),
                maxage: 1000 * 60 * 60 * 24 * 7,
                gzip: true,
            } // eslint-disable-line
        );
    } else {
        await next();
    }
});


app._io.on('connection', sock => {
    // 进入房间
    sock.on('join', data=> {
        sock.join(data.roomid, () => {
            if(!users[data.roomid]) {
                users[data.roomid] = [];
            }
            let obj = {
                account: data.account,
                id: sock.id
            }
            let arr = users[data.roomid].filter(v => v.account === data.account);
            if(!arr.length) {
                users[data.roomid].push(obj);
            }
            console.log(users[data.roomid])
            socks[data.account] = sock;
            app._io.in(data.roomid).emit('joined', users[data.roomid], data.account, sock.id)
        });
    });

    sock.on('offer', data => {
        sock.to(data.roomid).emit('offer', data)
    })
    sock.on('answer',  data=> {
        sock.to(data.roomid).emit('answer', data)
    })
    sock.on('__ice_candidate', data => {
        sock.to(data.roomid).emit('__ice_candidate', data)
    })
    // 1 v 1
    sock.on('reply', data => {
        socks[data.account].emit('reply', data);
    })
    // 转发申请
    sock.on('apply', data => {
        socks[data.account].emit('apply', data);
    })
    sock.on('1v1answer', data=> {
        socks[data.account].emit('1v1answer', data);
    })
    sock.on('1v1ICE', data=> {
        socks[data.account].emit('1v1ICE', data);
    })
    sock.on('1v1offer', data => {
        socks[data.account].emit('1v1offer', data);
    })
    sock.on('1v1hangup', () => {
        socks[data.account].emit('1v1hangup', data);
    })
});
app._io.on('disconnect', (sock) => {
    for(let k in  users){
        users[k] = users[k].filter(v => v.id !==sock.id)
    }
    console.log(`disconnect id => ${users}`)
})
app.listen(3002, () => {
    console.log('app stated at port 3002' )
})
