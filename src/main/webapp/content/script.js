var PolicyEditor = angular.module("PolicyEditor", [ 'ngRoute' ]);
PolicyEditor.config(function($routeProvider) {
	$routeProvider.when('/login', {
		controller : 'loginController',
		templateUrl : 'routes/login.html'
	}).when('/assetGroups', {
		controller : 'assetGroupsController',
		templateUrl : 'routes/assetGroups.html'
	}).when('/assetGroups/:id', {
		controller : 'assetGroupController',
		templateUrl : 'routes/assetGroup.html'
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
		if (window.location.origin !== $rootScope.baseURL) {
			$rootScope.baseURL = "/ProxyServlet?url=" + $rootScope.baseURL;
		}
		$scope.url = $rootScope.baseURL + "/SentinelAuthServices/auth/tokens";
		$scope.credential = window .btoa($scope.username + ":" + $scope.password);
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
		$http.get($rootScope.baseURL + "/cg-api/assets")
		.success(function(data) {
			$scope.assets = camelCase(data);
		});
	};
	init();
}

function assetController($scope, $rootScope, $http, $routeParams) {
	var init = function() {
		$http.get($rootScope.baseURL + "/cg-api/assets/" + $routeParams.id)
		.success(function(data) {
			$scope.asset = camelCase(data);
		});
	};
	init();
}

function assetGroupsController($scope, $rootScope, $http) {
	var init = function() {
		$http.get($rootScope.baseURL + "/cg-api/asset-groups")
		.success(function(data) {
			$scope.assetGroups = camelCase(data);
		});
	};
	init();
}

function assetGroupController($scope, $rootScope, $http, $routeParams) {
	var init = function() {
		$http.get($rootScope.baseURL + "/cg-api/asset-groups/" + $routeParams.id)
		.success(function(data) {
			$scope.assetGroup = camelCase(data);
			$http.get($rootScope.baseURL + "/cg-api/asset-groups/" + $routeParams.id + "/assets")
			.success(function(data1) {
				$scope.assets = camelCase(data1);
				$http.get($rootScope.baseURL + "/cg-api/asset-groups/" + $routeParams.id + "/policy-sets")
				.success(function(data2) {
					$scope.policySets = camelCase(data2);
					$http.get($rootScope.baseURL + "/cg-api/asset-groups/" + $routeParams.id + "/effective-policies")
					.success(function(data3) {
						$scope.policies = camelCase(data3);
					});
				});
			});
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
