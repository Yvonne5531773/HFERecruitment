(function () {
    'use strict';
    angular.module('company').controller('CompanyIntroductionController', CompanyIntroductionController);
    CompanyIntroductionController.$inject = ['$scope', '$state', '$http', '$cookies', '$uibModal', 'instance', 'toaster','lodash','DictionaryService','CompanyService'];

    function CompanyIntroductionController($scope,$state,$http,$cookies,$uibModal,instance,toaster,lodash,DictionaryService,CompanyService) {
        if(instance.msg){
            toaster.pop(instance.msg.type, instance.msg.content);
            instance.msg = null;
        }
        var _ = lodash;
        $scope.segmentType = {};
        const TIP_DELETE_SUCCESS = "删除成功";
        const TIP_DELETE_FAILED = "删除失败";
        $scope.companyIntroductions= [];
        $scope.allSegmentTypes = [];
        $scope.isEditScale = false;
        $scope.isEditAddress = false;
        $scope.currentUser = JSON.parse($cookies.get('USER_INFO'))?JSON.parse($cookies.get('USER_INFO')):{};
        $scope.segmentType.value = !_.isEmpty(localStorage.getItem('segmentTypeVal'))? localStorage.getItem('segmentTypeVal') : $scope.currentUser.company;
        $scope.loadData = function () {
            if(!_.isEmpty($scope.segmentType)){
                localStorage.setItem('segmentTypeVal', $scope.segmentType.value);
                CompanyService.getCompanyInfos({'type': $scope.segmentType.value}, function(err, companyIntroductions){
                    if(!err){
                        if(!_.isEmpty(companyIntroductions.data)) {
                            $scope.companyInfo = companyIntroductions.data[0];
                            $scope.companyIntroductions = _.sortBy($scope.companyInfo.company, function(item){return item.sequence});
                        }else{
                            $scope.companyInfo = {};
                            $scope.companyIntroductions = [];
                        }
                    }
                })
            }
        };

        $scope.createCompanyIntroduction = function () {
            instance.sequences = _.map($scope.companyIntroductions, 'sequence');
            instance.ids = _.map($scope.companyIntroductions, '_id');
            instance.entity = {
                'type' : $scope.segmentType.value
            };
            $scope.companyInfo.company = instance.ids;
            $scope.companyInfo.type = $scope.segmentType.value;
            instance.companyInfo = $scope.companyInfo;
            if(!_.isEmpty($scope.companyIntroductions)){
                instance.entity.isFlow = $scope.companyIntroductions[0].isFlow;
            }
            var sequenceList = _.map($scope.companyIntroductions, 'sequence');
            if(!_.isEmpty(sequenceList)){
                instance.entity.sequence = _.max(sequenceList)+1;
            }else{
                instance.entity.sequence = 1;
            }
            $state.go('companySegmentCreate', $scope.companyInfo);
        };

        $scope.updateCompanyIntroduction = function (entity) {
            instance.sequences = _.pull(_.map($scope.companyIntroductions, 'sequence'), entity.sequence);
            instance.entity = _.clone(entity);
            $scope.companyInfo.dictionary = $scope.segmentType._id;
            instance.companyInfo = $scope.companyInfo;
            $state.go('companySegmentEdit',{ id:entity._id, companyInfo: $scope.companyInfo });
        };

        $scope.updateCompanyInfoScale = function (entity) {
            upsertCompanyInfoCommon(entity);
            $scope.isEditScale = false;
        };
        $scope.updateCompanyInfoAddress = function (entity) {
            upsertCompanyInfoCommon(entity);
            $scope.isEditAddress = false;
        };
        $scope.updateCompanyInfoTele = function (entity) {
            upsertCompanyInfoCommon(entity);
            $scope.isEditTele = false;
        };
        $scope.updateCompanyInfoLink = function (entity) {
            upsertCompanyInfoCommon(entity);
            $scope.isEditLink = false;
        };
        $scope.updateCompanyInfoRecuritmentlink = function (entity) {
            upsertCompanyInfoCommon(entity);
            $scope.isEditRecuritmentlink = false;
        };
        function upsertCompanyInfoCommon(entity){
            entity.type = $scope.segmentType.value;
            entity.dictionary = $scope.segmentType._id;
            CompanyService.upsertCompanyInfo(entity, function(err, res){
                if(err) {
                    toaster.pop('error', 'Create fail,try again');
                }else $scope.loadData();
            });
        }

        $scope.deleteCompanyIntroduction = function(entity){
            if(!_.isEmpty(entity)){
                $.confirm({
                    title: '确定要删除？',
                    content: false,
                    confirmButton:'确定',
                    cancelButton:'取消',
                    confirmButtonClass: 'btn-info',
                    cancelButtonClass: 'btn-default',
                    theme:'black',
                    keyboardEnabled:true,
                    confirm: function(){
                        CompanyService.deleteCompany(entity._id, function(err, data){
                            if (err) {
                                toaster.pop('error', TIP_DELETE_FAILED);
                            } else {
                                for (var i = 0; i < $scope.companyIntroductions.length; i++) {
                                    if (typeof($scope.companyIntroductions[i]._id) != 'undefined'
                                            && $scope.companyIntroductions[i]._id === entity._id) {
                                        $scope.companyIntroductions.splice(i, 1);
                                        break;
                                    }
                                }
                                $scope.companyInfo.company =_.map($scope.companyIntroductions, function(data){return data._id});
                                CompanyService.upsertCompanyInfo($scope.companyInfo, function(err, data){
                                    if (err) {
                                        toaster.pop('error', TIP_DELETE_FAILED);
                                    }else{
                                        toaster.pop('success', TIP_DELETE_SUCCESS);
                                    }
                                })
                            }
                        });
                    },
                    cancel: function(){
                    }
                });
            }
        };

        $scope.changeCompanySegmentLayout = function(){
            if(!_.isEmpty($scope.companyIntroductions)){
                var criteria = {};
                criteria.segmentType = $scope.segmentType.value;
                criteria.isFlow = !$scope.companyIntroductions[0].isFlow;
                CompanyService.changeCompanySegmentLayout(criteria, function(err, data){
                    if(err){
                        toaster.pop('error', 'Create fail,try again');
                    }else{
                        toaster.pop('success', 'Update success');
                        $scope.loadData();
                    }
                });
            }
        };

        $scope.editScale = function(){
            $scope.isEditScale = !$scope.isEditScale;
        }
        $scope.editAddress = function(){
            $scope.isEditAddress = !$scope.isEditAddress;
        }
        $scope.editTele = function(){
            $scope.isEditTele = !$scope.isEditTele;
        }
        $scope.editLink = function(){
            $scope.isEditLink = !$scope.isEditLink;
        }
        $scope.editRecuritmentlink = function(){
            $scope.isEditRecuritmentlink = !$scope.isEditRecuritmentlink;
        }

        $scope.uploadFile = function(companyInfo) {
            CompanyService.getUpfiles({createUser: $scope.currentUser.userid}, function(err, upfiles){
                if(err)
                    console.log(err);
                else {
                    instance.applicantEntity = {
                        upfiles: upfiles,
                        companyInfo: companyInfo,
                        dictionary: $scope.segmentType._id
                    }
                    $uibModal.open({
                        templateUrl: 'client/maintain/company/views/companyUpload.html',
                        controller: 'CompanyUploadController',
                        backdrop: 'static'
                    });
                }
            })
        }

        instance.loadData = $scope.loadData;

        DictionaryService.getDictionarys({category:{'$in':['用人单位-本部','用人单位-幼稚园','用人单位-小学',
            '用人单位-中学','用人单位-高中','用人单位-培训学校',]}}, function(err, result){
            if(result.data) {
                $scope.allSegmentTypes = _.filter(result.data,function(data){
                    return data.value===$scope.currentUser.company||$scope.currentUser.company==='珠海华发教育产业投资控股有限公司'
                })
                $scope.allSegmentTypeVals = $scope.allSegmentTypes.map(function (data) {
                    return data.value;
                })
                $scope.segmentType = (_.filter(result.data,function(data){
                    return data.value===$scope.segmentType.value
                }))[0]
                if(!_.isEmpty($scope.allSegmentTypeVals)){
                    $scope.loadData();
                }
            }
        });
        DictionaryService.getDictionarys({category: '用人单位-规模'}, function(err, result){
            if(result.data) {
                $scope.allScaleTypes = result.data.map(function (data) {
                    return data.value;
                });
            }
        });
    }
})();
