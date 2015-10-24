angular.module('controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, dashDBService) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    dashDBService.setAuth($scope.loginData.username, $scope.loginData.password);
    dashDBService.setHost($scope.loginData.hostname);

    $scope.closeLogin();
  };
})

.controller('ScriptCtrl', function($scope, $http, dashDBService, $ionicPlatform, scriptService){
    $scope.setSelected = scriptService.setSelected;

    $scope.getScripts = function() {
          var url_ = 'https://' + dashDBService.getHost() + ':8443/dashdb-api/home'

          $http({
                  url: url_,
                  method: 'GET',
                  headers: {
                    'Authorization' : dashDBService.getAuth() // Note the appropriate header
                  },
                }).success(function(response, data) {

                    var files = [];
                    var lines = response.result.split(/\n/);
                    for(var i = 0; i < lines.length; i++){
                      if( lines[i].substr(-1) === "R" ) {
                        lines[i] = lines[i].substr(1);
                        files.push(lines[i]);
                      } 
                    }                    
                        $scope.rscripts = files;
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.hideSpinnerClass = "hidden";
                        // window.localStorage.setItem('scripts', JSON.parse($scope.rscripts));
                    }).error(function(response) {
                        console.log('Loading saved data');
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.hideSpinnerClass = "hidden";
                        // $scope.rscripts = JSON.parse(window.localStorage.getItem('scripts'));
            });
        };

        $ionicPlatform.ready(function() {
        $scope.getScripts();
        console.log('ready');
    });



})

.controller('ScriptExecutorCtrl', function($scope, $http, scriptService, dashDBService){
  var script = scriptService.getSelected();
  var url = 'https://' + dashDBService.getHost() + ':8443/dashdb-api/rscript' + script;
    $scope.executionResult;

    $scope.$on('$ionicView.enter', function() {
        $http({
              url: url,
              method: 'POST',
              transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
              headers: {
                'Authorization' : dashDBService.getAuth() // Note the appropriate header
              }
            }).success(function(response) {
                console.log("response="+ JSON.stringify(response));
                    if(response.resultCode === "SUCCESS") {
                        $scope.executionResult = "R script was executed successfully";
                    } else {
                        $scope.executionResult = "Error executing R script";
                    }
                }).error(function(response) {
                    $scope.executionResult = "Error reaching dashDB";
                    console.log("error="+ JSON.stringify(response));
        });

    });
})

.controller('GraphRetrieverCtrl', function($scope, $http, $sce, dashDBService, imageService){

  $scope.myImage;
  $scope.rscripts;

  var image = imageService.getSelected();

  var url = 'https://' + dashDBService.getHost() + ':8443/dashdb-api/home' + image;

  $scope.$on('$ionicView.beforeEnter', function() {
      $http({
            url: url,
            method: 'GET',
            headers: {
              'Accept': 'application/pdf',
              'Authorization' : dashDBService.getAuth() // Note the appropriate header
            },
            responseType: 'arraybuffer'
          }).success(function(response) {
              var blob = new Blob([response], {type: 'image/jpeg'});
              var fileURL = URL.createObjectURL(blob);

             $scope.myImage = $sce.trustAsResourceUrl(fileURL);
              }).error(function(response) {
                  console.log("error="+ JSON.stringify(response));
      });
      
  });

})

.controller('GraphCtrl', function($scope, $http, $sce, dashDBService, imageService, $ionicPlatform){
    $scope.setSelected = imageService.setSelected;

    $scope.getImages = function() {
          var url_ = 'https://' + dashDBService.getHost() + ':8443/dashdb-api/home'

          $http({
                  url: url_,
                  method: 'GET',
                  headers: {
                    'Authorization' : dashDBService.getAuth() // Note the appropriate header
                  },
                }).success(function(response, data) {
                    var files = [];
                    var lines = response.result.split(/\n/);
                    for(var i = 0; i < lines.length; i++) {
                        if(lines[i].substr(-3) === "jpg") {
                        lines[i] = lines[i].substr(1);
                        files.push(lines[i]);
                      } 
                    }                    
                        $scope.graphs = files;
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.hideSpinnerClass = "hidden";
                        // window.localStorage.setItem('graphs', JSON.parse($scope.graphs));
                    }).error(function(response) {
                        console.log('Loading saved data');
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.hideSpinnerClass = "hidden";
                        // $scope.rscripts = JSON.parse(window.localStorage.getItem('graphs'));
            });
        };

        $ionicPlatform.ready(function() {
        $scope.getImages();
        console.log('ready');
    });


})

.controller('ProdCtrl', function($rootScope, $scope, $http, $ionicPlatform, productService, dashDBService) {

    $scope.products;
    $scope.hideSpinnerClass;  

    //attach service function to scope
    $scope.setSelected = productService.setSelected;

    $scope.getProducts = function() {

        var url = 'https://' + dashDBService.getHost() + ':8443/services/healthsnapshot/HealthViewsResultSetDataProvider.form';

        var query = "SELECT PRODUCT_NAME FROM GOSALES.PRODUCT_NAME_LOOKUP LIMIT 20";

        var payload = {
            sql: query,
            dbProfileName: "BLUDB",
            RSBufferingType: "FLAT_ROWS",
            cmd: "execSQL"
        }

        $http({
              url: url,
              method: 'POST',
              transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
              data: payload,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization' : dashDBService.getAuth()
              }
            }).success(function(response) {
                    $scope.products = response.items;
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.hideSpinnerClass = "hidden";
                    // window.localStorage.setItem('list', JSON.parse($scope.products));
                }).error(function(response) {
                    console.log('Loading saved data');
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.hideSpinnerClass = "hidden";
                    // $scope.products = JSON.parse(window.localStorage.getItem('list'));
        });
    };


    $ionicPlatform.ready(function() {
        $scope.getProducts();
        console.log('ready');
    });

    $rootScope.$on('refreshList', function () {
      $scope.getProducts();
    });

});
