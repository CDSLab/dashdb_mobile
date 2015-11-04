angular.module('starter.services', [])


.service('productService', function() {
  var selectedProduct;

  var setSelected = function(product) {
      selectedRestaurant = product;
  };

  var getSelected = function(){
      return selectedProduct;
  };

  return {
    setSelected: setSelected,
    getSelected: getSelected
  };

})

.service('dashDBService', function(){
  var creds;
  var host_name;
  var b_cred;
  var auth;

  var getAuth = function () {
    return auth;
  }

  var setAuth = function (username, password) {
    creds = username + ':' + password;
    b_cred = btoa(creds);
    auth = 'Basic ' + b_cred;
  }

  var setHost = function(host) {
    host_name = host;
  }

  var getHost = function() {
    return host_name;
  }

  var getFiles = function($http, url_, callback) {
    $http({
      url: url_,
      method: 'GET',
      headers: {
        'Authorization' : auth // Note the appropriate header
      }
    }).success(function(response) {
        console.log("success");
        var lines = response.result.split(/\n/);
        callback(null, lines); 

    }).error(function(statusText) {
            console.log(JSON.stringify(statusText));
            console.log('Unable to get files from dashDB instance.');
            callback(statusText, null);
          });
  }

  return {
    getAuth: getAuth,
    setAuth: setAuth,
    setHost: setHost,
    getHost: getHost,
    getFiles: getFiles
  };
})

.service('scriptService', function(){
  var scriptSelected;

  var setSelected = function(script) {
    scriptSelected = script;
  };

  var getSelected = function() {
    return scriptSelected;
  };

  return {
    setSelected: setSelected,
    getSelected: getSelected
  };

})

.service('imageService', function(){
  var imageSelected;

  var setSelected = function(image) {
    imageSelected = image;
  };

  var getSelected = function() {
    return imageSelected;
  };

  return {
    setSelected: setSelected,
    getSelected: getSelected
  };

});