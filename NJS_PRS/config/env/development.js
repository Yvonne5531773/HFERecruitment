'use strict';

module.exports = {
  url :{
    dom : 'http://localhost:3000',
    prs: 'http://14.21.32.178',
    h5: {
      host: 'lica4-w7',
      url: 'http://lica4-w7:3300/#/scene/create/',
      port: 3300
    }
  },
  log: {
    // logging with Morgan - https://github.com/expressjs/morgan
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    fileLogger: {
      directoryPath: process.cwd(),
      fileName: 'app.log',
      maxsize: 10485760,
      maxFiles: 2,
      json: false
    }
  },
  upload: {
    dir: 'public/images/uploads/'
  },
  mailOptions: {
      from: 'zhhfjyhr@sina.com', // 发送者
      // to: 'lzh5531773@hotmail.com', // 接受者,可以同时发送多个,以逗号隔开
      subject: '华发教育招聘系统邮件', // 标题
      // html: '<h2>华发教育:</h2>' +
      // '<h3><a href="http://blog.csdn.net/zzwwjjdj1/article/details/524294223">http://blog.csdn.net/zzwwjjdj1/article/details/524294223</a></h3>',
      // attachments: [{
      //     filename: '01.png',
      //     path: './img/r-book1.png',
      //     cid: '00000001'
      // }]
  },
  transport: {
      host: 'smtp.sina.com',
      auth: {
          user: 'zhhfjyhr@sina.com',
          pass: 'Huafa0756' //授权码,通过QQ获取
      }
  }
};
