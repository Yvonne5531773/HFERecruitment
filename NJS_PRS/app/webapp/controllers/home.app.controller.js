/**
 * Created by hfjylzh on 2/20/2017.
 */

'use strict';

var indexService = require('../services/index.app.service');
var companyInfoService = require('../../maintain/services/companyInfo.app.service');
var dictionaryService = require('../../maintain/services/dictionary.app.service');
var logger = require('../../../config/lib/logger');
var _ = require('lodash');
var moment = require('moment');
var async = require('async');
var url = require('url');
var qs = require('querystring');

exports.show = show;

function show(req, res, next){
    var applicant = req.session.applicant? req.session.applicant:{},
        params = url.parse(req.url).query,
        sort = {},
        conditionNew = false;
    if(!_.isEmpty(params)) {
        sort = qs.parse(params).index == 1 ? {updated: -1} : {browseCount: -1};
        conditionNew = qs.parse(params).index == 1 ? true : false;
    }
    indexService.index({query:{},sort:sort}, function(err, result){
        if (err) {
            return res.json([]);
        }else{
            async.waterfall(
                [
                    function(callback){
                        var positionGroup = [];
                        dictionaryService.getDictionarys({category:'职位管理-职位类型'}, function(err, jobTypes){
                            _.forEach(jobTypes, function(jobType){
                                var group = {};
                                group.jobType = jobType.value;
                                group.value = (_.groupBy(result, function(res){
                                    return res.jobType==jobType.value
                                })).true;
                                group.value = _.unionBy(group.value,'name');
                                positionGroup.push(group);
                            });
                            _.forEach(result, function(res){
                                res.updated = moment(res.updated).format('YYYY-MM-DD HH:mm');
                            });
                            callback(null, {result: result, positionGroup: positionGroup});
                        });
                    },
                    function(obj, callback){
                        dictionaryService.getDictionarys({category:{'$in':['用人单位-本部','用人单位-幼稚园','用人单位-小学',
                            '用人单位-中学','用人单位-高中','用人单位-培训学校',]}}, function(err, result){
                            var allWorkAddrs = {};
                            allWorkAddrs.centrals=[],allWorkAddrs.preschools=[],allWorkAddrs.primaryschools=[],
                                allWorkAddrs.middleschools=[],allWorkAddrs.highschools=[],allWorkAddrs.trainschools=[];
                            if(result) {
                                _.forEach(result, function(data){
                                    if(data.category==='用人单位-本部') allWorkAddrs.centrals.push(data);
                                    else if(data.category==='用人单位-幼稚园') allWorkAddrs.preschools.push(data);
                                    else if(data.category==='用人单位-小学') allWorkAddrs.primaryschools.push(data);
                                    else if(data.category==='用人单位-中学') allWorkAddrs.middleschools.push(data);
                                    else if(data.category==='用人单位-高中') allWorkAddrs.highschools.push(data);
                                    else if(data.category==='用人单位-培训学校') allWorkAddrs.trainschools.push(data);
                                });
                            }
                            obj.allWorkAddrs = allWorkAddrs;
                            callback(null, obj);
                        });
                    }
                ],
                function(err, result){
                    companyInfoService.getCompanyInfos({},function(err, companyInfos) {
                        _.forEach(companyInfos, function(companyInfo){
                            _.forEach(result.result, function(res){
                                if(companyInfo.type === res.workAddr){
                                    res.companyInfo = companyInfo;
                                }
                            })
                        });
                        res.render('./app/webapp/views/home', {
                            positions: result.result,
                            positionGroup: result.positionGroup,
                            conditionIndex: true,
                            applicant: applicant,
                            conditionHot: !conditionNew,
                            conditionNew: conditionNew,
                            companyInfoFs: companyInfos.splice(0, 6),
                            companyInfoSs: companyInfos.length>6?companyInfos.splice(6, 12):[],
                            allWorkAddrs: result.allWorkAddrs,
                            showWorkAddrs: result.allWorkAddrs.centrals.concat(result.allWorkAddrs.preschools)
                                .concat(result.allWorkAddrs.primaryschools).concat(result.allWorkAddrs.middleschools)
                        });
                    });
                });
        }
    });
}