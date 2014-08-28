var PolicyEditor = angular.module("PolicyEditor", [ 'ngRoute' ]);
PolicyEditor.config(function($routeProvider) {
	$routeProvider.when('/login', {
		controller : 'loginController',
		templateUrl : 'routes/login.html'
	}).when('/home', {
		controller : 'defaultController',
		templateUrl : 'routes/home.html'
	}).otherwise({
		redirectTo : '/login'
	});
});

function loginController($scope, $rootScope, $http) {
	$scope.login = function() {
		$scope.url = "https://" + $scope.host + ":" + $scope.port + "/SentinelAuthServices/auth/tokens";
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

PolicyEditor.controller("loginController", [ "$scope", "$rootScope", "$http", loginController ]);

PolicyEditor.controller('defaultController', function($scope) {
	// Empty
});
