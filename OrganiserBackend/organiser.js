var app = angular.module('project', []);

var prefix = 'https://tms-polling.herokuapp.com/api/';


//Handles the login function
app.controller('LoginController', ['$rootScope','$scope', '$http', function ($rootScope,$scope,$http) {

	$rootScope.loginStatus = false;
	$scope.oldPasswordMatch = false;

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

	$scope.checkReset = function() {
		if ($scope.user.password == $scope.password.old) {
			$scope.oldPasswordMatch = true;
		} 
	}

	$scope.handleReset = function() {
		$http({
			url: prefix + 'organiser/password',
			method: 'POST',
			data: {
				oldPassword: $scope.password.old,
				password: $scope.password.new
			},
			params: {
				token: $rootScope.token
			}
		}).then(function success(e) {
			$scope.oldPasswordMatch = false;
			$scope.password.old = null;
			$scope.password.new = null;
			console.log("ok");
		}, function error(error) {
			console.log("error");
		});
	}

	$scope.revertReset = function() {

		console.log("asfaf");
		$scope.oldPasswordMatch = false;
		$scope.password.old = null;
		$scope.password.new = null;
	}
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
app.controller('EventList', ['$rootScope','$scope', '$http', '$timeout', function ($rootScope, $scope, $http,$timeout) {

	$scope.events = [];
	$scope.time = null;

	$rootScope.$on('LoggedIn',function(val) {

		(function tick() {
			$http({
				method: 'GET',
				url: prefix + 'organiser/event/all',
				params: {
					token: $rootScope.token
				}
			}).then(function success(e) {
				$scope.events = []
				for (var i = 0; i<e.data.length; i+=2) {
					$scope.events.push(e.data.slice(i,i+2));
				}
				console.log($scope.events);
				$scope.time = $timeout(tick,5000000);
			}, function error(error) {
				console.log(error);
			});
		})();
	});

	$rootScope.$on('LoggedOut',function(val) {
		$timeout.cancel($scope.time);
	})

	$scope.handleEventDelete = function(event) {

		$http({
			method: 'DELETE',
			url: prefix + 'organiser/event/' + event.id,
			params: {
				token: $rootScope.token
			}
		}).then(function success(data) {
			console.log(data);
		}, function error(data) {
			console.log(data);
		});

	}

	$scope.addQuestion = function(event) {

		$http({
			method: 'POST',
			url: prefix + 'organiser/event/question',
			params: {
				token: $rootScope.token
			}
		}).then(function success(data) {
			console.log(data);
		}, function error(data) {
			console.log(data);
		});
	}
}]);