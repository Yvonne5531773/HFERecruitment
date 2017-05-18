'use strict';

module.exports = {
  url :{
    dom : 'http://dom:3000',
    h5: {
      host: 'h5-slide.cloud.dachuanqi.cn',
      url: 'http://h5-slide.cloud.dachuanqi.cn/#/scene/create/'
    }
  },
  log: {
    // logging with Morgan - https://github.com/expressjs/morgan
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: process.env.LOG_FORMAT || 'combined',
    fileLogger: {
      directoryPath: process.env.LOG_DIR_PATH || process.cwd(),
      fileName: process.env.LOG_FILE || 'app.log',
      maxsize: 10485760,
      maxFiles: 2,
      json: false
    }
  },
  upload: {
    dir: 'public/upload/'
  }
};