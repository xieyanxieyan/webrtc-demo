<!--
 * @Version: 2.0
 * @Autor: xieyan
 * @Date: 2021-06-12 17:10:35
 * @LastEditors: xieyan
 * @LastEditTime: 2021-07-02 20:07:44
-->
<template>
  <div class="room">
      <div class="video-box" ref="video-box">
          <video autoplay controls class="video-mine" ref="video-mine"></video>
      </div>
  </div>
</template>

<script>
import socket from '../utils/socket';
export default {
  data() {
    return {
        roomid: '',
        peer: null,
        peerList: {},
        candidate: null,
        localStream: null,
    }
  },
  watch: {
      userList: {
          handler(){},
          deep: true
      }
  },
  beforeDestroy(){
      for (let k in this.peerList){
          this.peerList[k].close();
          this.peerList[k] = null;
      }
  },
  mounted(){
      this.$nextTick(() => {
              this.getUserMedia().then(() => {
              socket.emit('join', {roomid: this.$route.params.roomid, account: this.$route.params.account})
          })
          this.socketInit();
      })
  },
  methods: {
      getUserMedia() {
            // 获取本地的媒体流，并绑定到一个video标签上输出，并且发送这个媒体流给其他客户端
            return new Promise((resolve, reject) => {
                let myVideo = this.$refs['video-mine'];
                let getUserMedia = (navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia ||
                    navigator.msGetUserMedia);
                getUserMedia.call(navigator, {
                    "audio": true,
                    "video": true
                }, (stream) => {
                    myVideo.srcObject = stream;
                    this.localStream = stream;
                    resolve()
                }, function (error) {
                    reject(error)
                })
            })
      },
      socketInit() {
          socket.on('joined', (data, account) => {
              if(data.length > 1) {
                  data.forEach(v => {
                      let obj = {};
                      let arr = [v.account, this.$route.params.account];
                      obj.account = arr.sort().join('-');
                      if(!this.peerList[obj.account] && v.account !== this.$route.params.account) {
                          this.getPeerConnection(obj)
                      }
                  });
                  if(account === this.$route.params.account) {
                      for(let k in this.peerList){
                          this.createOffer(k, this.peerList[k]);
                      }
                  }
              }
          })
          socket.on('offer', v=> {
              this.peerList[v.account] && this.peerList[v.account].setRemoteDescription(v.sdp, () => {
                  this.peerList[v.account].createAnswer().then((desc) => {
                      this.peerList[v.account].setLocalDescription(desc, () => {
                          socket.emit('answer', {'sdp': this.peerList[v.account].localDescription, roomid: this.$route.params.roomid, account: v.account})
                      })
                  })
              }, (err) => {
                  console.log(err)
              })
          })
          socket.on('answer', v=> {
              this.peerList[v.account] && this.peerList[v.account].setRemoteDescription(v.sdp, function() {}, (err) => {
                  console.log(err)
              })
          })
          socket.on('__ice_candidate', v=> {
              if(v.candidate){
                  this.peerList[v.account] && this.peerList[v.account].addIceCandidate(v.candidate).catch(() => {})
              }
          })
          socket.on('disconnected', id => {
              let dom = document.querySelector('#' + id);
              if(dom){
                  dom.remove();
              }
          })
      },
      getPeerConnection(v) {
          let videoBox = this.$refs['video-box'];
          let iceServer = {
              "iceServers": [
                  {
                      "url": "stun:stun.l.google.com:19302"
                  }
              ]
          }
        let PeerConnection = (window.RTCPeerConnection ||
        window.webkitRTCPeerConnection ||
        window.mozRTCPeerConnection);
          let peer = new PeerConnection(iceServer);
          peer.addStream(this.localStream);
          peer.onaddstream = function (event) {
              let videos = document.querySelector('#a'+ v.account);
              if(videos){
                videos.srcObject = event.stream;
              } else {
                let video = document.createElement('video');
                video.controls = true;
                video.autoplay = 'autoplay';
                video.srcObject = event.stream;
                video.id = 'a' + v.account;
                videoBox.append(video)
              }
          };
          peer.onicecandidate = (event) => {
              if(event.candidate) {
                  socket.emit('__ice_candidate', {
                      'candidate': event.candidate, roomid: this.$route.params.roomid, account: v.account
                  })
              }
          }
          this.peerList[v.account] = peer;
      },
      createOffer(account, peer) {
          peer.createOffer({
              offerToRecieveAudio: 1,
              offerToReceiveVideo: 1
          }).then((desc) => {
              peer.setLocalDescription(desc, () => {
                  socket.emit('offer', {'sdp': peer.localDescription, roomid: this.$route.params.roomid, account: account})
              })
          })
      },
  },
  components: {

  }
}
</script>

<style scoped lang="scss">
    .many{
        text-align: center;
    }
    .btn{
        margin-top: 20px;
    }
    .center{
        width:500px;
        height: 400px;
        position: absolute;
        left:0;
        top:0;
        bottom:0;
        right:0;
        margin: auto;
    }
</style>
