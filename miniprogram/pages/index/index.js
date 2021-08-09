// pages/index/index.js

let mqtt = require("../../utils/mqtt.js") //引入mqtt文件

//随机生成字符串，因为clientId你设成一个固定字符串的话，当你编译
// 代码的时候就会以这个ID连接服务器，当预览或者真机调试的时候还是这个
// ID，就会发生ID冲突的问题，当时差点被这个不起眼的BUG整疯
function randomString(len) {
  len = len || 32;
  let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  let maxPos = $chars.length;
  let pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}
//连接配置
const options = {
  connectTimeout: 4000,  //超时时间
  clientId: randomString(30),  //随机生成ID
  username: '12',  //用户名
  password: '33',  //密码
}



Page({

  /**
   * 页面的初始数据
   */
  data: {
    showModal: false,
    single: true,
    phone: null,
    inputV: '',
    inputName: null,
    inputNameUser: null
  },


  modalConfirm(){
    const {inputNameUser,inputName, inputV} = this.data;

    wx.setStorage({
      key:"name",
      data: this.data.inputName
    })

    // 链接 mqtt 服务器  订阅 主持人 发布的主题，同时发布自己的主题
    let client = mqtt.connect('wxs://www.wjmwjh.top:5050', options) //你自己的域名
    client.on('connect', (e) => {
      console.log('成功连接服务器!')
    })
    client.subscribe(inputV, {
      qos: 0
    }, function (err) {
      if (!err) {
        console.log("订阅房间" + inputV)
        wx.showToast({
          title: `订阅房间-${inputV}-成功`,
          icon: 'success',
          duration: 2000
        })
      }
    })
    client.on('message', function (topic, message, packet) {
      console.log(packet.payload.toString());
    })

    // 你要 评定的 规模  发送
    client.publish(inputV, `你要评定的  规模`)
  },

  index_inputFunc (value, cursor, keyCode) {
    console.log(value, cursor, keyCode);
    this.setData({
      inputV: value.detail.value
    })
  },

  index_inputNameFunc (value, cursor, keyCode) {
    this.setData({
      inputName: value.detail.value
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let value = wx.getStorageSync('phone')
    let name = wx.getStorageSync('name')
    if (value) {
      this.setData({
        phone: value
      })
    }
    if (name) {
      this.setData({
        inputNameUser: name
      })
    }
    this.setData({
      showModal: true
    })
  },

  getPhoneNumber: function (e) {
    console.log(e);
    wx.cloud.callFunction({
      name: 'getPhone',
      data: {
        weRunData: wx.cloud.CloudID(e.detail.cloudID),
      }
    }).then(res=>{
      console.log(res);
      this.setData({
        phone: res.result
      })
      wx.setStorage({
        key:"phone",
        data: res.result
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },




})