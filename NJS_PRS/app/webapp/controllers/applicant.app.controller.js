/**
 * Created by hfjylzh on 2/20/2017.
 */

'use strict';

var applicantService = require('../services/applicant.app.service');
var progressService = require('../../maintain/services/progress.app.service');
var nodemailer = require('nodemailer');
var _ = require('lodash');
var async = require('async');
var url = require('url');
var config = require('../../../config/config');
var util = require('util');
var qs = require('querystring');

exports.checkUsername = checkUsername;
exports.checkApplicant = checkApplicant;
exports.create = create;
exports.login = login;
exports.logout = logout;
exports.getApplicants = getApplicants;
exports.upsertShow = upsertShow;
exports.upsert = upsert;
exports.register = register;
exports.validateAndCreate = validateAndCreate;
exports.reset = reset;
exports.resetShow = resetShow;
exports.resetPwd = resetPwd;
exports.upsertPwd = upsertPwd;
exports.feedback = feedback;

function checkUsername(req, res, next){
    var username = req.body;
    applicantService.checkUsername({username: username.email}, function(err, result){
        if (err) {
            return res.json({message: err});
        }else{
            res.json(result);
        }
    });
}

function checkApplicant(req, res, next){
    var username = req.body.email,
        password = req.body.password;
    applicantService.checkApplicant({username:username,password:password}, function(err, result){
        if (err) {
            return res.json({message: err});
        }else{
            res.json(result);
        }
    });
}

function create(req, res, next) {
    var applicant = req.body;
    applicant.username = applicant.email;
    applicantService.create(applicant, function(err, result){
        if (err) {
            return res.json({message: err});
        }else{
            req.session.applicant = result;
            res.redirect('/');
        }
    });
};

function register(req, res, next) {
    console.log('in register ')
    var transporter = nodemailer.createTransport(config.transport),
        mailOptions = config.mailOptions,
        link = config.url.prs + util.format('/applicant/register/validateAndCreate?username=%s', req.body.email);
    mailOptions.to = req.body.email;
    mailOptions.html = '<h2>华发教育招聘，用户注册验证链接:</h2>' +
    '<h3><a href=' + link + '>' + link;
    console.log('in register mailOptions.html',mailOptions.html)
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            return res.json({err:'邮件发送失败'});
        }
        req.session.preApplicant = {username:req.body.email,password:req.body.password};
        console.log('in register req.session.preApplicant', req.session.preApplicant)
        console.log('发送成功 info',info);
        return res.json(info);
    });
};

function validateAndCreate(req, res, next) {
    var params = url.parse(req.url).query,
        preApplicant = req.session.preApplicant;
    console.log('in validateAndCreate preApplicant',preApplicant)
    if(preApplicant.username==qs.parse(params).username){
        applicantService.create(preApplicant, function(err, result){
            if (err) {
                return res.json({message: err});
            }else{
                req.session.applicant = result;
                res.redirect('/');
            }
        });
    }
};

function login(req, res, next) {
    var email = req.body.email;
    applicantService.checkUsername({username:email}, function(err, applicants){
        if (err) {
            return res.json({error:err});
        }else if(!_.isEmpty(applicants)){
            console.log('in login applicants', applicants[0].applied)
            req.session.applicant = applicants[0];
            return res.json({});
        }
    })
};

function logout(req, res, next) {
    if (req.session.applicant) {
        delete req.session.applicant;
    }
    res.redirect('/');
};

function getApplicants(req, res, next){
    applicantService.checkUsername(req.body, function(err, result){
        console.log('in getApplicants result', result)
        if (err) {
            return res.json({message: err});
        }else{
            res.json(result);
        }
    });
}

function upsertShow(req, res, next){
    var applicant = req.session.applicant;
    res.render('./app/webapp/views/applicantUpsert', {
        applicant: applicant
    });
}

function upsert(req, res, next){
    var applicant = req.session.applicant,
        oldPassword = req.body.oldPassword,
        newPassword = req.body.newPassword;
    if(_.isEmpty(applicant)) return res.json({err: '未登陆，请重新登陆'});
    applicantService.checkApplicant({username:applicant.username,password:oldPassword}, function(err, result){
        if (err) {
            return res.json({err: err});
        }else{
            result.password = newPassword;
            result.updated = new Date();
            applicantService.upsertPwd(result, function(err, applicant){
                if (err) {
                    return res.json({err: err});
                }else{
                    req.session.applicant = null;
                    res.json(applicant);
                }
            });
        }
    });
}

function resetShow(req, res, next){
    res.render('./app/webapp/views/reset', {
    });
}

function reset(req, res, next) {
    applicantService.checkUsername({username:req.body.email}, function(err, result){
        if(_.isEmpty(result)) return res.json({err:'邮箱不存在'});
        else{
            var transporter = nodemailer.createTransport(config.transport),
                mailOptions = config.mailOptions,
                link = config.url.prs + util.format('/applicant/resetPwd?username=%s', req.body.email);
            mailOptions.to = req.body.email;
            mailOptions.html = '<h2>华发教育招聘，用户密码重置链接:</h2>' +
                '<h3><a href=' + link + '>' + link;
            console.log('in register mailOptions.html',mailOptions.html)
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    return res.json({err:'邮件发送失败'});
                }
                console.log('发送成功 info',info);
                return res.json(info);
            });
        }
    })
};

function resetPwd(req, res, next) {
    var params = url.parse(req.url).query,
        username = qs.parse(params).username;
    res.render('./app/webapp/views/resetPwd', {
        username: username
    });
};

function upsertPwd(req, res, next){
    var username = req.body.username,
        password = req.body.password,
        criteria = {};
    criteria.username = username;
    criteria.password = password;
    criteria.updated = new Date();
    applicantService.checkUsername({username:username}, function(err, result){
        if (err) {
            return res.json({err: err});
        }else if(_.isEmpty(result)) return res.json({err: '输入邮箱不存在'});
        else{
            result[0].password = password;
            result[0].updated = new Date();
            applicantService.upsertPwd(result[0], function(err, applicant){
                if (err) {
                    return res.json({err: err});
                }else{
                    res.json(applicant);
                }
            });
        }
    });
}

function feedback(req, res, next){
    var params = url.parse(req.url).query;
    if(!_.isEmpty(qs.parse(params).applicant) && !_.isEmpty(qs.parse(params).position)) {
        progressService.getProgress({applicant:qs.parse(params).applicant, position:qs.parse(params).position}, function(err, result){
            if (err) {
                return res.json({err: err});
            }else if(_.isEmpty(result)) return res.json({err: '出现错误，参与失败'});
            else{
                result[0].feedback = true;
                console.log('in feedback result[0]',result[0])
                progressService.upsertProgress(result[0], function(err, applicant){
                    if (err) {
                        return res.json({err: err});
                    }else{
                        res.render('./app/webapp/views/feedback', {
                            feedback: true
                        });
                    }
                });
            }
        });
    }else return res.json({err:'出现错误，参与失败'});

}