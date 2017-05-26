'use strict';

var progressService = require('../services/progress.app.service');
var logger = require('../../../config/lib/logger');
var config = require('../../../config/config');
var nodemailer = require('nodemailer');

exports.getProgress = getProgress;
exports.upsertProgress = upsertProgress;
exports.sendInterviewByEmail = sendInterviewByEmail;

function getProgress(req, res, next){
    var criteria = req.body;
    progressService.getProgress(criteria, function(err, datas){
        if (err) {
            logger.error(err);
            return res.json([]);
        }else{
            return res.json(datas);
        }
    });
}

function upsertProgress(req, res, next){
    var progress = req.body;
    progressService.upsertProgress(progress, function(err, result){
        if (err) {
            logger.error(err);
            return res.json([]);
        }else{
            return res.json(result);
        }
    });
}

function sendInterviewByEmail(req, res, next){
    var transporter = nodemailer.createTransport(config.transport),
        mailOptions = config.mailOptions,
        link = config.url.prs + req.body.link;
    mailOptions.to = req.body.toEmail;
    mailOptions.html = req.body.name+'，您好: <br/>'+req.body.successMessage+'<br /><br />面试时间: '+req.body.interviewTime+'<br />面试地点: '
        +req.body.interviewAddress+'<br />';
    mailOptions.html += req.body.contact?'<span>联系人: '+req.body.contact+'<br /></span>':'';
    mailOptions.html += '联系电话: '+req.body.contactPhone+'<br />';
    mailOptions.html += req.body.content?'<span>'+req.body.content+'</span>':'';
    mailOptions.html += '<h2>参与面试请点击链接:</h2>' +
        '<h3><a href=' + link + '>' + link + '</a></h3>';
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            return res.json({err:'邮件发送失败'});
        }
        console.log('发送成功 info',info);
        return res.json(info);
    });
}