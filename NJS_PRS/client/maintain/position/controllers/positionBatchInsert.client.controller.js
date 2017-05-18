/**
 * Created by lica4
 */
'use strict';

angular.module('position').controller('PositionBatchInsert', ['instance', '$scope', '$http', '$uibModal', '$uibModalInstance', 'toaster',
    '$cookies','PositionService',
    function (instance, $scope, $http, $uibModal, $uibModalInstance, toaster, $cookies, PositionService) {
        const TIP_INSERT_SUCCESS = "批量插入成功";
        const TIP_INSERT_FAILED = "批量插入失败，请重试";
        $scope.positions = instance.positions;
        $scope.allPositionTypes = instance.allPositionTypes;
        $scope.allCompanies = instance.allCompanies;
        $scope.negotiables = ['是', '否'];
        $scope.allCertificateTypes = ['','不限','大专','本科','硕士','博士'];
        $scope.allExperiences = ['','不限','应届毕业生','1年以下','1-3年','3-5年','5-10年','10年以上'];
        $scope.natures = ['全职','实习','返聘'];

        $scope.settings = {
            colHeaders: true,
            contextMenu: ['row_above', 'row_below', 'remove_row'],
            showRowHeader: true,
            showColHeader: true,
            maxCols:15,
            manualColumnMove:true,
            manualRowMove:true,
            columnSorting:true,
            manualRowResize:true,
            columns: [
                {
                    title: '职位名称', data: 'name', name: 'name', width: "100",
                },
                {
                    title: '职位类型', type: 'dropdown', data: 'jobType', name: 'jobType', width: "100",
                    source: $scope.allPositionTypes, strict: false, trimDropdown: false,
                },
                {
                    title: '工作单位', type: 'dropdown', data: 'workAddr', source: $scope.allCompanies, strict: false,
                    trimDropdown: false, width: "100", name: 'workAddr'
                },
                {
                    title: '招聘人数', data: 'count', name: 'count', width: "60",
                },
                {
                    title: '工作城市', data: 'city', name: 'city', width: "60",
                },
                {
                    title: '工作地址', data: 'location', name: 'location', width: "100",
                },
                {
                    title: '最低月薪', data: 'salaryLow', name: 'salaryLow', width: "60",
                },
                {
                    title: '最高月薪', data: 'salaryHigh', name: 'salaryHigh', width: "60",
                },
                {
                    title: '是否面议', type: 'dropdown', trimDropdown: false, source: $scope.negotiables,
                    strict: false, data: 'negotiable', name: 'negotiable', width: "60",
                },
                {
                    title: '学历', type: 'dropdown', trimDropdown: false, source: $scope.allCertificateTypes,
                    strict: false, data: 'certificate', name: 'certificate', width: "60",
                },
                {
                    title: '工作经验', type: 'dropdown', trimDropdown: false, source: $scope.allExperiences,
                    strict: false, data: 'experience', name: 'experience', width: "80",
                },
                {
                    title: '福利', data: 'welfareForShow', name: 'welfareForShow', width: "100",
                },
                {
                    title: '工作性质', type: 'dropdown', trimDropdown: false, source: $scope.natures,
                    strict: false, data: 'nature', name: 'nature', width: "60",
                },
                {
                    title: '回复信息', data: 'successMessage', name: 'successMessage', width: "100",
                }]
        };

        $scope.save = function (valid) {
            if (!valid) {
                toaster.pop('error', TIP_INSERT_FAILED);
                return;
            }
            var insertPositions = _.without($scope.positions, '', undefined, null);
            var tipPositions = _.without(_.map($scope.positions,function(user){return user.name}), '', undefined, null);
            var content = "确定要插入数据？"
            if (insertPositions.length > 0) content = '将新增以下职位：' + tipPositions.join(',') + '。' + content;
            $.confirm({
                title: content,
                content: false,
                confirmButton: '确定',
                cancelButton: '取消',
                confirmButtonClass: 'btn-info',
                cancelButtonClass: 'btn-default',
                theme: 'black',
                keyboardEnabled: true,
                confirm: function () {
                    _.forEach(insertPositions, function(position){
                        (function(position){
                            if(!_.isEmpty(position)) {
                                position.updated = new Date();
                                position.created = new Date();
                                position.negotiable = position.negotiable === '是' ? 'true' : 'false';
                                position.welfare = _.split(position.welfareForShow, ',')
                                PositionService.upsertPosition(position, function (err, result) {
                                    if (err) {
                                        toaster.pop('error', TIP_INSERT_FAILED);
                                    } else {
                                        $uibModalInstance.close('ok');
                                        toaster.pop('success', position.name+' 插入成功');
                                        instance.refreshForCreateOrUpdate(null);
                                    }
                                });
                            }
                        })(position);
                    });
                }
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        };
    }
]);