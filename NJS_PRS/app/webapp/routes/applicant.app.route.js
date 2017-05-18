/**
 * Created by hfjylzh on 2/20/2017.
 */
'use strict';


module.exports = function (app) {
    // Root routing
    var applicantController = require('../controllers/applicant.app.controller');


    app.route('/login/checkUsername').post(applicantController.checkUsername);

    app.route('/login/checkApplicant').post(applicantController.checkApplicant);

    app.route('/applicant/register').post(applicantController.register);

    app.route('/applicant/register/validateAndCreate').get(applicantController.validateAndCreate);

    app.route('/applicant/login').post(applicantController.login);

    app.route('/applicant/logout').get(applicantController.logout);

    app.route('/applicant/getApplicants').post(applicantController.getApplicants);

    app.route('/applicant/upsertShow').get(applicantController.upsertShow);

    app.route('/applicant/upsert').post(applicantController.upsert);

    app.route('/applicant/resetShow').get(applicantController.resetShow);

    app.route('/applicant/reset').post(applicantController.reset);

    app.route('/applicant/resetPwd').get(applicantController.resetPwd);

    app.route('/applicant/upsertPwd').post(applicantController.upsertPwd);

    app.route('/applicant/interview').get(applicantController.feedback);
};