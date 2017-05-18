/**
 * Created by hfjylzh on 2/20/2017.
 */
'use strict';


module.exports = function (app) {
    // Root routing
    var homeController = require('../controllers/home.app.controller');


    app.route('/').get(homeController.show);

};