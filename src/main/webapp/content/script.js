var PolicyEditor = angular.module("PolicyEditor", [ 'ngRoute' ]);
PolicyEditor.config(function($routeProvider) {
	$routeProvider.when('/login', {
		controller : 'loginController',
		templateUrl : 'routes/login.html'
	}).when('/assets', {
		controller : 'assetsController',
		templateUrl : 'routes/assets.html'
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
			$scope.assets = data;
		}).error(function(data, status, headers, config) {
			$scope.assets = data;
		});
	};
	init();
}

PolicyEditor.controller('defaultController', function($scope) {
	// Empty
});
