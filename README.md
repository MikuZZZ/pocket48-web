# pocket48-web

A Pocket48 web client developed with Vue.js.

一个用 Vue.js 实现的口袋 48 客户端。可以直接在网页中观看成员直播、录播，公演直播、录播。成员口袋房间等。

Project link:

[https://yetai.ga](https://yetai.ga)

## Features

- [x] 成员列表
  - [x] 添加我推成员
  - [x] 搜索成员(缩写)
- [ ] 成员直播
  - [ ] 电台滚动图片
  - [ ] 贡献榜
  - [ ] 截图
  - [ ] 录播自动转换下载 (使用 videoconverter.js)
  - [x] 直播
    - [x] 观看直播 (使用 rtmp 协议，需要 Flash 支持)
    - <del>[ ] 显示实时弹幕</del> (没有找到接口，无法实现)
    - <del>[ ] 发送弹幕</del> (没有找到接口，无法实现)
  - [ ] 录播
    - [x] 显示弹幕
    - [ ] 切换弹幕显示
- [x] 公演
  - [x] 公演直播
  - [x] 公演录播
- [ ] 口袋房间
  - [ ] 查看消息
    - [ ] 文字消息
    - [ ] 语音消息
    - [ ] 视频消息
  - [ ] 搜索消息
  - [ ] 搜索成员互动
- [ ] 口袋应援榜
- [ ] Mobile UI
- [ ] 数据统计

## Known issue

- 视频拖拽进度调的时候弹幕显示异常
- 看直播时 Flash 有时会 crush

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run dev
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
