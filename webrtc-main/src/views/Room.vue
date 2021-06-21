<!--
 * @Version: 2.0
 * @Autor: xieyan
 * @Date: 2021-06-12 17:39:07
 * @LastEditors: xieyan
 * @LastEditTime: 2021-06-21 10:54:17
-->
<template>
  <div class="remote1"
    v-loading="loading"
    :element-loading-text="loadingText"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0 , 0.7)"
  >
    <div class="shade" v-if="!isJoin">
        <div class="input-container">
            <el-input class="input-account" type="text" size="middle" v-model="account" placeholder="请输入昵称" keyup.enter="join"></el-input>
            <el-button size="middle"  @click="join">确定</el-button>
        </div>
    </div>
    <div class="userList">
        <h5>在线用户: {{userList.length}}</h5>
        <p v-for="v in userList" :key="v.count">
            {{v.account}}
            <i v-if="v.account === account || v.account === isCall">
                {{v.account === account ? 'me' : ''}}
                {{v.account === isCall ? 'calling': ''}}
            </i>
            <span @click="apply(v.account)" v-if="v.account !== account && v.account !== isCall">呼叫{{v.account}}</span>
        </p>
    </div>
    <div class="video-container">
        <div>
            <ul>
                <li v-for="v in handleList" :key="v.type">
                    <el-color-picker v-model="color" show-alpha v-if="v.type === 'color'" @change="colorChange" :disabled="!isToPeer"></el-color-picker>
                    <button :disabled="v.type === 'cancel' ? !isToPeer || allowCancel:
                        v.type === 'go' ? !isToPeer || allowGo
                        :!isToPeer"
                            @click="handleClick(v)"
                            v-if="!['color', 'lineWidth', 'polygon'].includes(v.type)"
                            :class="{active: currHandle === v.type}"
                    >
                        {{v.name}}
                </button>
                    <el-popover
                            placement="top"
                            width="400"
                            trigger="click"
                            v-if="v.type === 'polygon'"
                    >
                        <el-input-number v-model="sides" controls-position="right" @change="sidesChange" :min="3" :max="10"></el-input-number>
                        <button slot="reference" :disabled="!isToPeer" @click="handleClick(v)" :class="{active: currHandle === v.type}">{{v.name}}</button>
                    </el-popover>
                    <el-popover
                            placement="top"
                            width="400"
                            trigger="click"
                            v-if="v.type === 'lineWidth'"
                    >
                        <el-slider v-model="lineWidth" :max=20 @change="lineWidthChange"></el-slider>
                        <button slot="reference" :disabled="!isToPeer">{{v.name}} <i>{{lineWidth + 'px'}}</i></button>
                    </el-popover>
                </li>
            </ul>
            <div>
                <h5>画板</h5>
                <canvas width="400" height="500" ref="canvas"></canvas>
            </div>
        </div>
        <div>
            <h5>聊天</h5>
            <div class="chat">
                <div class="message" v-for="(v, i) in messageList" :key="i">
                    <p>
                        {{v.account}} - {{v.time}}
                    </p>
                    <p class="mes">{{v.mes}}</p>
                </div>
                <textarea v-model="sendText"></textarea><br>
                <button :disabled="!isToPeer" @click="send(['text'])">发送</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import socket from '../utils/socket';
import { Palette } from '../utils/palette';
export default {
  name: 'palette',
  data() {
    return {
        loading: false,
        loadingText: '呼叫中',
        roomid: 'palette',
        isJoin: false,
        account: window.sessionStorage.account || '',
        isToPeer: false, // 是否立即建立P2P连接
        // roomid:  window.sessionStorage.roomid || '',
        userList: [],
        isCall: false,
        peer: null, 
        offerOption: {
           offerToReceiveAudio: 1,
           offerToReceiveVideo: 1 
        },
        handleList: [
            {name: '圆', type: 'arc'},
            {name: '线条', type: 'line'},
            {name: '矩形', type: 'rect'},
            {name: '多边形', type: 'polygon'},
            {name: '橡皮擦', type: 'eraser'},
            {name: '撤回', type: 'cancel'},
            {name: '前进', type: 'go'},
            {name: '清屏', type: 'clear'},
            {name: '线宽', type: 'lineWidth'},
            {name: '颜色', type: 'color'}
        ],
        color: 'rgba(19, 206, 102, 1)',
        currHandle: 'line',
        lineWidth: 5,
        palette: null, // 画板
        allowCancel: true,
        allowGo: true,
        sides: 3,
        channel: null,
        messageList: [],
        sendText: ''
    }
  },
  mounted() {
      this.initSocket();
      if(this.account){
        this.join();
      }
  },
  methods: {
      sidesChange() {
          this.palette.changeWay({sides: this.sides})
      },
      lineWidthChange() {
        this.palette.changeWay({lineWidth: this.lineWidth})
      },
      initPalette(){
          this.palette = new Palette(this.$refs['canvas'], {
              drawColor: this.color,
              drawType: this.currHandle,
              lineWidth: this.lineWidth,
              allowCallback: this.allowCallback,
              moveCallback: this.moveCallback
          })
      },
      handleClick(v){
          if(['cancel', 'go', 'clear'].includes(v.type)){
              this.moveCallback(v.type);
              this.palette[v.type]();
              return;
          }
          this.palette.changeWay({type: v.type});
          if(['color', 'lineWidth'].includes(v.type)) return;
          this.currHandle = v.type;
      },
      allowCallback(cancel, go) {
          this.allowCancel = !cancel;
          this.allowGo = !go
      },
      moveCallback(...arr){
          this.send(arr)
      },
      formatTime(date) {
          const hour = date.getHours();
          const minute = date.getMinutes();
          const second = date.getSeconds();
          return [hour, minute, second].map(this.formatNumber).join(':')
      },
      formatNumber(n){
        n = n.toString();
        return n[1] ? n : '0' + n  
      },
      send(arr){
          if(arr[0] === 'text'){
              let params = {account: this.account, time: this.formatTime(new Date()), mes: this.sendText, type: 'text'};
              this.channel.send(JSON.stringify(params));
              this.messageList.push(params);
              this.sendText = '';
          } else {
              this.channel.send(JSON.stringify(arr));
          }
      },
      colorChange() {
          this.palette.changeWay({color: this.color})
      },
      initSocket() {
        socket.on('joined', data => {
            this.userList = data;
        })
        socket.on('reply', async(data) => {
            this.loading = false;
            switch (data.type) {
                case '1': // 同意
                    this.isCall = data.self;
                    // 对方同意后创建自己的peer
                    await this.createP2P(data);
                    // 建立dataChannel

                    await this.createDataChannel(data);
                    // 给对方发送offer
                    this.createOffer(data);
                    break;
                case '2': // 拒绝
                    this.$message({
                        message: '对方拒绝了你的请求',
                        type: 'warning'
                    })
                    break;
                case '3': // 正在通话中
                    this.$message({
                        message: '对方正在通话中！',
                        type: 'warning'
                    })
                    break;
            }
        })
        socket.on('1v1ICE', (data) =>{ // 接收到 ICE
            this.onIce(data);
        });
        socket.on('apply', data => {
            if(this.isCall){
                this.reply(data.self, '3');
                return;
            }
            this.$confirm(data.self + '向你请求视频通话，是否同意？', '提示', {
                confirmButtonText: '同意',
                cancelButtonText: '拒绝',
                type: 'warning'
            }).then(async () => {
                await this.createP2P(data);
                console.log()
                await this.onDataChannel();
                this.isCall = data.self;
                this.reply(data.self, '1')
            }).catch((err) => {
                console.error(err)
                this.reply(data.self, '2')
            })
        });
        socket.on('1v1offer', data => {
            this.onOffer(data)
        })
        socket.on('1v1answer', data => { // 接受到anser
            this.onAnswer(data)
        })
      },
      async onAnswer(data) {
          try{
              await this.peer.setRemoteDescription(data.sdp)
          }catch(e){
              console.log('onAnswer：', e)
          }
      },
      async onOffer(data) { // 接收offer并发送方answer
        try{
            // 接收端设置远程offer描述
            await this.peer.setRemoteDescription(data.sdp);
            // 接收端创建answer
            let answer = await this.peer.createAnswer();
            // 接收端设置本地answer描述
            await this.peer.setLocalDescription(answer);
            // 给对方发送answer
            socket.emit('1v1answer', {account: data.self, self: this.account, sdp: answer})
        }catch(e){
            console.log('onOffer： ', e)
        }
          
      },
      
      async createOffer(data) {
          try{
              // 创建offer
              let offer = await this.peer.createOffer(this.offerOption);
              // 呼叫端设置本地offer描述
              await this.peer.setLocalDescription(offer);
              //给对方发送offer
              socket.emit('1v1offer', {
                  account: data.self,
                  self: this.account, 
                  sdp: offer
              })
          }catch(e){
              console.log('createoffer: ', e)
          }
      },

      initPeer(data){
          // 创建输出端PeerConnection
          let PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
          this.peer = new PeerConnection();
          this.peer.onicecandidate = (event) => {
              if(event.candidate) {
                  socket.emit('1v1ICE', {account: data.self, self: this.account, sdp: event.candidate});
              }
          }
      },
        async onIce(data) { // 接收ICE候选
            try{
                await this.peer.addIceCandidate(data.sdp); // 设置远程ICE
            }catch(e){
                console.error('onAnswer: ', e)
            }
        },
      async createP2P(data) {
          this.loading = true;
          this.loadingtext = '正在建立通话连接';
          await this.initPeer(data); // 获取到媒体流后，调用函数初始化RTCPeerConnection
      },
      reply(account, type){
          socket.emit('reply', {account: account, self: this.account, type: type})
      },
      createDataChannel() {
          console.log('createDataChannel----->>')
          try{
              this.channel = this.peer.createDataChannel('messagechannel');
              this.handleChannel(this.channel);
          }catch(e){
              console.log('createChannel：',e)
          }
      },
      onDataChannel() {
          this.peer.ondatachannel = (event) => {
              this.channel = event.channel;
              this.handleChannel(this.channel);
          }
      },
      handleChannel(channel) {
          channel.binaryType = 'arraybuffer';
          channel.onopen = (event) => {
            console.log('channel onopen', event)
            this.loading = false;
            this.isToPeer = true;
            this.initPalette();
          }
          channel.onclose = function(event){
              console.log('channel onclose', event);
          }
          channel.onmessage = (e) => {
              if(Array.isArray(JSON.parse(e.data))){
                  let [type, ...arr] = JSON.parse(e.data);
                  this.palette[type](...arr);
              } else {
                  this.messageList.push(JSON.parse(e.data));
              }
          }
      },
      join() {
          if(!this.account) return;
          this.isJoin = true;
          window.sessionStorage.account = this.account;
          socket.emit('join', {account: this.account, roomid: this.roomid})
      },
      apply(account) {
          this.loading = true;
          this.loadingText = '呼叫中';
          socket.emit('apply', {account, self: this.account})
      }
  }
}
</script>

<style scoped lang="scss">
.input-container{
    width: 200px;
    margin: auto;
    display: inline-flex;
}
.input-account{
    margin-right: 20px;
}
.remote1{
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: flex-start;
    }
    .shade{
        position: fixed;
        width:100vw;
        height: 100vh;
        left: 0;
        top:0;
        z-index: 100;
        background-color: rgba(0,0,0,0.9);
        .input-container{
            position: absolute;
            left:50%;
            top:30%;
            transform: translate(-50%, 50%);
            display: flex;
            justify-content: space-between;
            align-items: center;
            input{
                margin: 0;
            }
        }
    }
    .userList{
        border: 1px solid #ddd;
        margin-right: 50px;
        min-width: 100px;
        h5{
            text-align: left;
            margin-bottom: 5px;
        }
        p{
            border-bottom: 1px solid #ddd;
            line-height: 32px;
            width:200px;
            position: relative;
            overflow: hidden;
            cursor: pointer;
            span{
                position: absolute;
                left:0;
                top:100%;
                background-color: #1fbeca;
                color: #fff;
                height: 100%;
                transition: top 0.2s;
                display: block;
                width: 100%;
            }
            i{
                font-style: normal;
                font-size: 11px;
                border: 1px solid #1fbeca;
                color: #27cac7;
                border-radius: 2px;
                line-height: 1;
                display: block;
                position: absolute;
                padding: 1px 2px;
                right: 5px;
                top: 5px;
            }
        }
        p:last-child{
            border-bottom: none;
        }
        p:hover span{
            top:0;
        }
    }
    ul{
        text-decoration: none!important;
        list-style-type: none;
        margin-top: 60px;
        li{
            margin-bottom: 10px;
        }
    }
    .video-container{
        display: flex;
        justify-content: center;
        >div:first-child{
            display: flex;
            justify-content: flex-start;
            margin-right: 50px;
            canvas{
                border: 1px solid #000;
            }
            ul{
                text-align: left;
            }
        }
        >div:last-child{
            .chat{
                width:500px;
                height: 260px;
                border: 1px solid #000;
                text-align: left;
                padding: 5px;
                box-sizing: border-box;
                .mes{
                    font-size: 14px;
                }
            }
            textarea{
                width:400px;
                height: 60px;
                resize: none;
            }
        }
    }
</style>
