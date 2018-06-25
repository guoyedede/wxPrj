var app = getApp();
var meafe = require('../../utils/util_meafe.js');
Page({
  data: {
    userInfo: {},
    funcList: {},
    grswUnReadNum: 0
  },
  bindQuery: function() {
    wx.navigateTo({
      url: '../../query/query'
    })
  },
  bindGGWUser: function() {
    wx.navigateTo({
      url: '../page_bind/page_bind'
    })
  },
  bindKehuPhoto: function() {
    wx.navigateTo({
      url: '../../page_rec_photo/page_main/page_main'
    })
  },
  bindChannel: function() {
    wx.navigateTo({
      url: '../../channel/channel'
    })
  },
  onLoad: function () {
    var _this = this;
    _this.tryLogin();
  },
  //设置下方代码主要是从其他界面返回的时候，显示最新的用户信息，有可能在用户绑定界面就改变了用户信息
  onShow: function () {
    var _this = this;
    _this.getWxUserInfo();
    _this.getGrswCount();
  },
  refreshLogo: function () {
    var _this = this;
    console.log(app.userInfo);
      _this.setData({
        userInfo: app.userInfo
      });
  },
  //个人事务
  bindNeiwangGrswClick: function() {
    wx.navigateTo({
      url: '../../neiwang/grsw_list/grsw_list'
    })
  },
  //公司信息
  bindNeiwangGsxxClick: function() {
    wx.navigateTo({
      url: '../../neiwang/news_list/news_list'
    })
  },
  //通讯录
  bindNeiwangTxlClick: function() {
    wx.navigateTo({
      url: '../../neiwang/tongxunlu/tongxunlu'
    })
  },
  //每次显示时执行，分为全新登录，有openid登录和有work_id刷新未读数3种情况
  onShow: function() {
    let that = this;
    that.getGrswCount();
    if(!app.userInfo.STAFF_NM){
      that.loginRemoteServer();
      that.tryLogin(app.userInfo.openid);
    }
  },
  //获取openid和userinfo
  tryLogin: function() {
    var _this = this;
    wx.showLoading({
      title: '登陆中...',
    });
    wx.login({
      success: res => _this.getOpenid(res.code),
      complete: () => wx.hideLoading(),
    })
  },
  //根据code获取openid,再获取userinfo
  getOpenid: function(code) {
    app.code = code;
    let that = this;
    wx.request({
      /*
      url: 'https://www.meafe.cn/wx/GetXcxOpenid?&code=' + app.code ,
      success: function (res) {
        //根据openid获取用户信息
        app.userInfo.openid = res.data;
        if (suc) suc(res)
      }*/
      url: 'https://www.meafe.cn/code?code=' + code,
      success: res => {
        if (res.statusCode == 200) {
          app.userInfo.openid = res.data.openid;
          that.loginRemoteServer();
        }
      },
    });
  },
  loginRemoteServer: function () {
    var _this = this;
    meafe.ListData({service:"selectUserList", open_id: app.userInfo.openid},
      function (obj) {
        wx.hideLoading();
        if (obj.length > 0) {
          for (var f in obj[0]){
            app.userInfo[f]=obj[0][f];
          }
          if (app.userInfo && app.userInfo.openid) {
            _this.setData({
              userInfo: app.userInfo
            });
          }
          _this.getGrswCount();
          //加载web按钮清单
          _this.getFuncList();
        }
        else {
        }
      }, function () {
        _this.setLoginFailed();
      });
  },
  setLoginFailed: function () {
    wx.hideLoading();
    var _this = this;
    wx.showModal({
      title: '登陆出错，是否重试',
      content: '',
      success: function (res) {
        if (res.confirm) {
          _this.tryLogin();
        } else if (res.cancel) {
          _this.setData({ hidden: true });
        }
      }
    })
  },
  /*
  //根据openid从服务器获取userinfo
  loginRemoteServer: function(openid) {
    let that = this;
    wx.request({
      url: 'https://www.meafe.cn/lite/get_info/?openid=' + openid,
      success: res => {
        if (res.statusCode == 200 && res.data.length > 0) {
          app.globalData.ggwUserInfo = res.data[0];
          that.setData({
            userInfo: res.data[0]
          });
          if (res.data[0].work_id)
            that.getGrswCount();
        }
      },
    });
  },
  */
  bindNeiwangTxlClick: function () {
    wx.navigateTo({
      url: '../../neiwang/tongxunlu/tongxunlu'
    })
  },
  bindOpenWeb: function (opt) {
    console.log(opt);
    app.webview_url = opt.currentTarget.id+"?staff_no="+app.userInfo.STAFF_NO;
    wx.navigateTo({
      url: '../../pages/webview/webview'
    })
  },
  getGrswCount:function(){
    var _this = this;
    if (app.userInfo.STAFF_NO && app.userInfo.STAFF_NO.length > 0) {
      //console.log('get grsw count');
      wx.request({
        url: 'https://www.meafe.cn/sxf/get_grsw_cnt/?staff_no=' + app.userInfo.STAFF_NO
        , success: function (res) {
          _this.setData({ grswUnReadNum: res.data })
        }
      })
    }
  },
  getFuncList: function () {
    var _this =this;
    meafe.ListData({service: "selectFuncList", staff_no: app.userInfo.SFATT_NO}
      , function (res) {
        _this.setData({ funcList: res })
      }
    )
  }
})
