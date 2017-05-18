'use strict';

module.exports = {
  url :{
    dom : 'http://localhost:3000',
    prs: 'http://192.168.150.51:3001',
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
      from: '524294223@qq.com', // 发送者
      // to: 'lzh5531773@hotmail.com', // 接受者,可以同时发送多个,以逗号隔开
      subject: 'nodemailer2.5.0邮件发送', // 标题
      // html: '<h2>华发教育:</h2>' +
      // '<h3><a href="http://blog.csdn.net/zzwwjjdj1/article/details/524294223">http://blog.csdn.net/zzwwjjdj1/article/details/524294223</a></h3>',
      // attachments: [{
      //     filename: '01.png',
      //     path: './img/r-book1.png',
      //     cid: '00000001'
      // }]
  },
  transport: {
      service: 'qq',
      auth: {
          user: '524294223@qq.com',
          pass: 'hcovhmjtpmqmbiic' //授权码,通过QQ获取
      }
  }
};
