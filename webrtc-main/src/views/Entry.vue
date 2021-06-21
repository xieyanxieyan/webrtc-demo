<!--
 * @Version: 2.0
 * @Autor: xieyan
 * @Date: 2021-06-17 11:52:20
 * @LastEditors: xieyan
 * @LastEditTime: 2021-06-17 14:16:49
-->
<template>
  <div class="container">
      <el-input class='input' size='mini' v-model="roomid" placeholder="请输入房间号"></el-input>
      <el-input class='input' size='mini' v-model="account" placeholder="请输入账户名"></el-input>
      <el-button  size='mini' @click="handleClick">确定</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
        account: null,
        roomid: null
    }
  },
  components: {

  },
  methods: {
      handleClick() {
          if(this.account && this.roomid){
              this.$router.push({name: 'home', params: {roomid: this.roomid, account: this.account}})
          }
      }
  }
}
</script>

<style scoped lang="scss">
.container{
    width: 200px;
    margin: 40px auto;
    .input{
        margin-bottom: 20px;
    }
}
</style>
