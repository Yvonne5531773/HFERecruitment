
angular.module('dictionary').controller('DictionaryController',['instance', '$scope', '$http', 'toaster', '$uibModal', 'DictionaryService','CompanyService',
    'PositionService','UserService',
    function (instance, $scope, $http, toaster, $uibModal, DictionaryService, CompanyService, PositionService,UserService) {

  const TIP_UPDATE_SUCCESS = "更新成功";
  const TIP_UPDATE_FAILED = "更新失败，请重试";
  const TIP_DELETE_SUCCESS = "删除成功";
  const TIP_DELETE_FAILED = "删除失败";
  $scope.dictionaryGrid = {
      enableSorting: true,
      showGridFooter: true,
      showColumnFooter: true,
      enableColumnResizing: true,
      paginationPageSizes: [10, 50, 75],
      paginationPageSize: 20,
      enableRowSelection: true,
      exporterOlderExcelCompatibility: true,
      exporterMenuPdf: false,
      enableFullRowSelection: true
  };
  var dictionaryGridColumnDefs = [
      {
        field: 'category',
        allowCellFocus:false,
        displayName: '类别',
        enableCellEdit: true,
        editableCellTemplate: 'ui-grid/dropdownEditor',
        editDropdownRowEntityOptionsArrayPath: 'allCategorys',
        editDropdownIdLabel: 'value'
      },
      // {field: 'key', displayName:'编码' ,allowCellFocus:false},
      {field: 'value', displayName:'值', allowCellFocus:false},
      {
        field: 'sort',
        displayName:'编号',
        allowCellFocus:false
      }
  ];

  $scope.dictionaryGrid.multiSelect = true;
  $scope.dictionaryGrid.modifierKeysToMultiSelect = true;
  $scope.dictionaryGrid.columnDefs = dictionaryGridColumnDefs;

  $scope.dictionaryGrid.onRegisterApi = function( gridApi ) {
      $scope.gridApi = gridApi;
  };

  $scope.getData = function(){
    $scope.allIcons = [
      {value : 'Technique', },
      {value : 'Test'},
      {value : 'Design'},
      {value : 'Service'},
      {value : 'Support'}
     ];
    DictionaryService.getDictionarys({}, function(err, res){
        if(res){
          var allCategorys = [],
              allValues = [],
              gridDatas = [];
          for (var i = 0; i < res.data.length; i ++) {
            var data = res.data[i];
            if (~['POSITION_TYPE', 'WELFARE_TYPE', 'HR_CENTRAL_TYPE','HR_PRESCHOOL_TYPE','HR_PRIMARYSCHOOL_TYPE',
                    'HR_MIDDLESCHOOL_TYPE','HR_HIGHSCHOOL_TYPE','HR_TRAINSCHOOL_TYPE','SCALE_TYPE'].indexOf(res.data[i].key)) {
              allCategorys.push(data);
            } else {
              gridDatas.push(data);
              if(data.value !== undefined)
                allValues.push(data.value);
            }
          }
          $scope.allCategorys = allCategorys;
          $scope.allValues = allValues;
          gridDatas.forEach(function (gridData) {
            gridData.allCategorys = allCategorys;
            gridData.allIcons = $scope.allIcons;
          });
          $scope.dictionaryGrid.data = gridDatas;
        }else{
            console.log('rep failed');
        }
    });
  };

  instance.refreshForCreateOrUpdate = function(dictionary){
      if(dictionary != null){
          $scope.dictionaryGrid.data.push(dictionary);
      }else{
          $scope.getData();
      }
      $scope.getData();
  };

  $scope.dictionaryGrid.onRegisterApi = function(gridApi){
    //set gridApi on scope
    $scope.gridApi = gridApi;
    gridApi.edit.on.afterCellEdit($scope, function (row) {
        if(!_.isEmpty(row.category)&&!_.isEmpty(row.value)){
            var query = {};
            if(!_.isEmpty(row.sort)) query.sort = row.sort
            query.category = row.category, query.value = row.value;
            DictionaryService.getDictionarys(query, function(err, result){
                if(_.isEmpty(result.data)){
                    if(!_.isEmpty(row.value) && !_.isEmpty(row._id)){
                        CompanyService.getCompanyInfos({dictionary:row._id}, function(err, company){
                            if(!_.isEmpty(company.data))
                                CompanyService.upsertCompanyInfo({_id:company.data[0]._id,type:row.value}, function(err, res){})
                        })
                        PositionService.getPositions({dictionary:row._id}, function(err, position){
                            if(!_.isEmpty(position.data)){
                                _.forEach(position.data, function(position){
                                    PositionService.upsertPosition({_id:position._id,workAddr:row.value}, function(err, res){})
                                })
                            }
                        })
                        UserService.findUsers({dictionary:row._id}, function(err, user){
                            if(!_.isEmpty(user)){
                                _.forEach(user, function(user){
                                    UserService.upsertUser({userid:user.userid,company:row.value}, function(err, res){})
                                })
                            }
                        })
                    }
                    DictionaryService.upsertDictionary(row, function(err, result){
                        if(err){
                            toaster.pop('error', TIP_UPDATE_FAILED);
                        } else {
                            instance.refreshForCreateOrUpdate(null);
                        }
                    });
                }else{
                    toaster.pop('error', '插入失败，有重复数据存在');
                }
            })
        }
    });
  };
  $scope.create = function () {
      var newRow = {
          allCategorys : $scope.allCategorys,
          allIcons : $scope.allIcons,
      };
    $scope.dictionaryGrid.data.splice(($scope.dictionaryGrid.paginationCurrentPage-1) * $scope.dictionaryGrid.paginationPageSize,0,newRow);
  };

  $scope.delete = function () {
    $scope.gridApi.selection.getSelectedRows().forEach(function (row) {
        DictionaryService.deleteDictionary(row._id, function(err, data){
            if(err){
                toaster.pop('error', TIP_DELETE_FAILED);
                instance.refreshForCreateOrUpdate(null);
            }else {
                toaster.pop('success', TIP_DELETE_SUCCESS);
                instance.refreshForCreateOrUpdate(null);
            }
        });
        $scope.gridApi.selection.clearSelectedRows();
    });
  };

    $scope.searchDictionary = function (){
        var criteria = {};
        if(!_.isEmpty($scope.category)){
            criteria.category = $scope.category;
        }
        if(!_.isEmpty($scope.value)){
            criteria.value = {$regex: $scope.value,$options:"$i"};
        }
        DictionaryService.getDictionarys(criteria, function(err, res){
            if(res){
                res.data.forEach(function (dictionary) {
                    dictionary.allCategorys = $scope.allCategorys;
                    dictionary.allIcons = $scope.allIcons;
                })
                $scope.dictionaryGrid.data = res.data;
            }else{
                console.log('rep failed');
            }
        })
    };

    $scope.cancelDictionary = function() {
        $scope.category = null;
        $scope.value = null;
    };
}]);
