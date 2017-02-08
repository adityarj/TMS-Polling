var app = angular.module('project', []);

var prefix = 'https://tms-polling.herokuapp.com/api/';


//Handles the login function
app.controller('LoginController', ['$rootScope','$scope', '$http', function ($rootScope,$scope,$http) {

	$rootScope.loginStatus = false;

	$scope.handleLogin = function() {

		$http({
			method: 'POST',
			url: prefix + 'organiser/authenticate/login',
			data: $scope.user
		}).then(function success(e) {

			console.log(e);

			$rootScope.token = e.data.token;
			$rootScope.$broadcast('LoggedIn');

			$rootScope.loginStatus = true;

		}, function error(error) {
			console.log("error");
		});

	};

	$scope.handleLogout = function() {

		$rootScope.$broadcast('LoggedOut');
		$rootScope.loginStatus = false;
		$scope.user = null;

	};
}]);

//Handles voter related operations
app.controller('VoterList', ['$rootScope','$scope','$http','$timeout', function ($rootScope,$scope,$http,$timeout) {

	$scope.regVoters = [];
	$scope.unregVoters = [];

	$rootScope.$on('LoggedIn',function(val) {

		(function tick() {
			$http({
				method: 'GET',
				url: prefix + 'organiser/voter/all',
				params: {
					token: $rootScope.token
				}
			}).then(function success(e) {
				console.log(e);
				$scope.regVoters = [];
				$scope.unregVoters = [];
				e.data.forEach(function(voter) {
					if (voter.organiser_verified) {
						$scope.regVoters.push(voter);
					} else {
						$scope.unregVoters.push(voter);
					}
				});

				$scope.timeout = $timeout(tick,2000);

			}, function error (error) {
				console.log("error")
			});
		})();

	});

	$rootScope.$on('LoggedOut',function(val) {
		$timeout.cancel($scope.timeout);
	})

	//Delete a voter
	$scope.handleDelete = function(voter) {

		$http({
			method: 'DELETE',
			url: prefix + 'organiser/voter/' + voter.id,
			params: {
				token: $rootScope.token
			}
		}).then(function success(data) {
			console.log(data);
		}, function error (error) {
			console.log("error");
		});
	}

	$scope.handleRegister = function(voter) {

		$http({
			method: 'POST',
			url: prefix + 'organiser/voter/' + voter.id,
			params: {
				token: $rootScope.token
			}
		}).then(function success(data) {
			console.log(data);
		},function error(error) {
			console.log("error");
		});
	}

}]);

//Handles all event related stuff, including questions and choices.
app.controller('EventList', ['$rootScope','$scope', '$http', function ($rootScope, $scope, $http) {

	$scope.events = null;

	$rootScope.$on('LoggedIn',function(val) {

		$http({
			method: 'GET',
			url: prefix + 'organiser/event/all',
			params: {
				token: $rootScope.token
			}
		}).then(function success(e) {
			console.log(e);
		}, function error(error) {
			console.log(error);

		});
	});

	$scope.handleEventDelete = function(event) {

		$http({
			method: 'DELETE',
			url: prefix + 'organiser/event/' + event.inheritedData()
		}).then(function success(data) {
			console.log(data);
		}, function error(data) {
			console.log(data);
		});

	}
}]);