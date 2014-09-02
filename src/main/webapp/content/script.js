var PolicyEditor = angular.module("PolicyEditor", [ 'ngRoute' ]);
PolicyEditor.config(function($routeProvider) {
	$routeProvider.when('/login', {
		controller : 'loginController',
		templateUrl : 'routes/login.html'
	}).when('/assets', {
		controller : 'assetsController',
		templateUrl : 'routes/assets.html'
	}).when('/assets/:id', {
		controller : 'assetController',
		templateUrl : 'routes/asset.html'
	}).when('/home', {
		controller : 'defaultController',
		templateUrl : 'routes/home.html'
	}).otherwise({
		redirectTo : '/login'
	});
});

function loginController($scope, $rootScope, $http) {
	$scope.login = function() {
		$rootScope.baseURL = "https://" + $scope.host + ":" + $scope.port;
		$scope.url = $rootScope.baseURL + "/SentinelAuthServices/auth/tokens";
		$scope.credential = window .btoa($scope.username + ":" + $scope.password);
		if ($scope.url.lastIndexOf(window.location.origin, 0) !== 0) {
			$scope.url = "/ProxyServlet?url=" + $scope.url;
		}
		$http({
			url : $scope.url,
			method : "POST",
			headers : {
				'Authorization' : 'Basic ' + $scope.credential
			}
		}).success(function(data, status, headers, config) {
			$rootScope.Token = data.Token;
			$rootScope.TokenDigest = data.TokenDigest;
			$http.defaults.headers.common.Authorization = "X-SAML " + data.Token;
			window.location.hash = "#/home";
		}).error(function(data, status, headers, config) {
			$rootScope.Token = null;
			$rootScope.TokenDigest = null;
		});
	};
}

function assetsController($scope, $rootScope, $http) {
	var init = function() {
		$scope.url = $rootScope.baseURL + "/cg-api/assets";
		if ($scope.url.lastIndexOf(window.location.origin, 0) !== 0) {
			$scope.url = "/ProxyServlet?url=" + $scope.url;
		}
		$http({
			url : $scope.url,
			method : "GET",
		}).success(function(data, status, headers, config) {
			$scope.assets = camelCase(data);
		}).error(function(data, status, headers, config) {
			$scope.assets = camelCase(data);
		});
	};
	init();
}

function assetController($scope, $rootScope, $http, $routeParams) {
	var init = function() {
		$scope.url = $rootScope.baseURL + "/cg-api/assets/" + +$routeParams.id;
		if ($scope.url.lastIndexOf(window.location.origin, 0) !== 0) {
			$scope.url = "/ProxyServlet?url=" + $scope.url;
		}
		$http({
			url : $scope.url,
			method : "GET",
		}).success(function(data, status, headers, config) {
			$scope.asset = camelCase(data);
		}).error(function(data, status, headers, config) {
			$scope.asset = camelCase(data);
		});
	};
	init();
}

PolicyEditor.controller('defaultController', function($scope) {
	// Empty
});

function camelCase(obj) {
	var array = [];
	if (obj.constructor === array.constructor) {
		for (var i = 0; i < obj.length; i++) {
			array.push(camelCase(obj[i]));
		}
		return array;
	}
	var object = {};
	var constructor = object.constructor;
	if (obj.constructor !== constructor) {
		return obj;
	}
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			var val = obj[key];
			val = camelCase(val);
			var camelCaseKey = key.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
			object[camelCaseKey] = val;
		}
	}
	return object;
}
