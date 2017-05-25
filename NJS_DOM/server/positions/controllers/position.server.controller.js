'use strict';

var request = require('superagent');
var mongoose = require('mongoose');
var positionSchema = mongoose.model('Position');
var dictionarySchema = mongoose.model('Dictionary');

const ACTIVE = "已发布";
const INACTIVE = "未发布";

module.exports.publish = function (req, res) {
    var positions = req.body;
    if(positions.length === 0){
        return res.end();
    }
    positions.forEach(function(p){
        positionSchema.update({_id : p._id}, {$set:{status:'已发布',updated:new Date()}})
            .exec(function(err,result) {
                res.end();
            });
    });
};


module.exports.stopPublish = function (req, res) {
    var positions = req.body;
    if(positions.length === 0){
        return res.end();
    }
    positions.forEach(function(p){
        positionSchema.update({_id : p._id}, {$set:{status:'未发布',updated:new Date()}})
            .exec(function(err,result) {
                res.end();
            });
    });
};


module.exports.preview = function (req, res) {
    positionSchema.find({status: '已发布'}).then(function (result) {
        res.render('./server/position/views/position', {
            positions: result
        });
    });
};

module.exports.deletePosition = function(req, res){
    var positions = req.body;
    if(positions.length === 0){
        return res.end();
    }
    positions.forEach(function(p){
        positionSchema.remove({_id : p._id})
            .exec(function(err,result) {
                res.end();
            });
    });
};

module.exports.index = function(req, res){
    req.body.query.status = '已发布';
    positionSchema.find(req.body.query)
        .sort(req.body.sort)
        .then(result => {
            return res.status(200).json(result);
        });
};
