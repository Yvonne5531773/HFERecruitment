/**
 * Created by lica4 on 11/16/2016.
 */

angular.module('applicant').factory('ApplicantService', ApplicantService);

ApplicantService.$inject = ['$http'];

function ApplicantService($http) {

    return {
        getApplicants: getApplicants,
        getResume: getResume,
        upsertProgress: upsertProgress,
        getProgress: getProgress,
        sendInterviewByEmail: sendInterviewByEmail
    };

    function getApplicants(data, callback) {
        var url = "/applicant/getApplicants";
        $http.post(url, data).then(function (data) {
            if(data){
                return callback(null, data);
            }else {
                return callback(null, null);
            }
        });
    }

    function getResume(data, callback) {
        var url = "/resume/getResume";
        $http.post(url, data).then(function (data) {
            if(data){
                return callback(null, data);
            }else {
                return callback(null, null);
            }
        });
    }

    function upsertProgress(data, callback) {
        var url = "/api/progress";
        $http.post(url, data).then(function (data) {
            if(data){
                return callback(null, data);
            }else {
                return callback(null, null);
            }
        });
    }

    function getProgress(data, callback) {
        var url = "/api/progress/getProgress";
        $http.post(url, data).then(function (data) {
            if(data){
                return callback(null, data);
            }else {
                return callback(null, null);
            }
        });
    }

    function sendInterviewByEmail(data, callback) {
        var url = "/api/progress/sendInterviewByEmail";
        $http.post(url, data).then(function (data) {
            console.log('in sendInterviewByEmail data',data)
            if(!data.err){
                return callback(null, data);
            }else {
                return callback(data.err, null);
            }
        });
    }
} 