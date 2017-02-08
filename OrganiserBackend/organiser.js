var app = angular.module('project', []);

var prefix = 'https://tms-polling.herokuapp.com/api/';


//Handles the login function
app.controller('LoginController', ['$rootScope','$scope', '$http', function ($rootScope,$scope,$http) {

	$scope.handleLogin = function() {

		$http({
			method: 'POST',
			url: prefix + 'organiser/authenticate/login',
			data: $scope.user
		}).then(function success(e) {

			console.log(e);

			$rootScope.token = e.data.token;
			$rootScope.$broadcast('LoggedIn');

		}, function error(error) {
			console.log("error");
		});

	};

	$scope.handleLogout = function() {

		$http({
			method: 'GET',
			url: prefix + 'organiser/authenticate/logout',
			data: $scope.user
		}).then(function success(data) {
			console.log(data);
			$rootScope.broadcast('LoggedOut');
		}, function error (error) {
			console.log("error");
		});
	}
		
}]);


//Handles voter related operations
app.controller('VoterList', ['$rootScope','$scope','$http', function ($rootScope,$scope,$http) {

	$scope.regVoters = null;
	$scope.unregVoters = null;

	$rootScope.$on('LoggedIn',function(val) {

		$http({
			method: 'GET',
			url: prefix + 'organiser/voter/all',
			params: {
				token: $rootScope.token
			}
		}).then(function success(e) {
			console.log(e);

			$scope.regVoters = e.data.map(function(voter) {
				if (voter.registered) {
					return voter;
				}
			});

			$scope.unregVoters = e.data.map(function(voter) {
				if (!voter.registered) {
					return voter;
				}
			});

		}, function error (error) {
			console.log("error")
		});

	});

	//Delete a voter
	$scope.handleDelete = function(voter) {

		$http({
			method: 'DELETE',
			url: prefix + 'organiser/voter/' + voter.id
		}).then(function success(data) {
			console.log(data);
		}, function error (error) {
			console.log("error");
		})
	}

}]);