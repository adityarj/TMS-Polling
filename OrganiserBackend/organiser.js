var app = angular.module('project', []);

var prefix = 'https://tms-polling.herokuapp.com/api/';

app.controller('LoginController', ['$rootScope','$scope', '$http', function ($rootScope,$scope,$http) {

	$scope.handleLogin = function() {

		$http({
			method: 'POST',
			url: prefix + 'organiser/authenticate/login',
			data: $scope.user
		}).then(function success(data) {

			console.log(data);
			$rootScope.$broadcast('LoggedIn',50);

		}, function error(error) {

			console.log("error");

		});

	};
		
}]);

app.controller('VoterList', ['$rootScope','$scope','$http', function ($rootScope,$scope,$http) {
	

	console.log("lasg");

	$scope.voters = null;

	$rootScope.$on('LoggedIn',function(val) {

		$http({
			method: 'GET',
			url: prefix + 'organiser/voter/all',
		}).then(function success(data) {

			console.log(data);

		}, function error (error) {

			console.log("error");

		});

	});

}])