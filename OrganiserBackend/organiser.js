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

	//Handle registering a voter
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

	//Add voter to the event (pushed to server)
	$scope.addVoterEvent = function(voterId) {
		//Send http request to add voter
		$http({
			method: 'POST',
			url: prefix + 'organiser/voter/join',
			params: {
				token: $rootScope.token
			},
			data: {
				voterId: voterId,
				eventId: $rootScope.activeEvent
			}
		}).then(function success(data) {
			console.log(data);
		}, function error(error) {
			console.log(error);
		});

		$rootScope.activeVoters.push(voterId);
	}

	//Conclude adding voter, clear out temporary variables
	$scope.concludeAddVoter = function() {
		$rootScope.activeVoters = [];
		$rootScope.activeEvent = eventId;
	}

}]);

//Filter to arrange the choices in a neater manner
app.filter('quadRow',function() {

	return function(input) {

		var rows = [];
		console.log(input);
		for (var i = 0; i<input.length; i+=4) {
			rows.push(input.slice(i,i+4));
		}

		return rows;

	}
});

//Handles all event related stuff, including questions and choices.
app.controller('EventList', ['$rootScope','$scope', '$http', '$timeout', function ($rootScope, $scope, $http,$timeout) {

	$scope.events = [];
	$scope.time = null;
	$rootScope.activeEvent = null;
	$rootScope.activeVoters = [];

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

	//Delete an event from the face of the earth
	$scope.deleteEvent = function(eventId) {

		$http({
			method: 'DELETE',
			url: prefix + 'organiser/event/' + eventId,
			params: {
				token: $rootScope.token
			}
		}).then(function success(data) {
			console.log(data);
		}, function error(data) {
			console.log(data);
		});

	}

	//Add a new question
	$scope.addQuestion = function(question,eventId) {

		var choices = [];

		question.choices.forEach(function(row) {
			row.forEach(function(choice) {
				choices.push(choice);
			});
		});

		console.log(eventId);

		$http({
			method: 'POST'
,			url: prefix + 'organiser/question',
			params: {
				token: $rootScope.token
			},
			data: {
				eventId: eventId,
				question: question.prompt,
				choices: choices
			}
		}).then(function success(data) {
			console.log(data);
		}, function error(data) {
			console.log(data);
		});
	}

	//Add a new choice, change is locally saved
	$scope.addChoice = function(choices) {
		if (choices.slice(-1)[0][1]) {
			choices.push([null]);
		} else {
			choices.slice(-1)[0].push(null);
		}
	}

	//Refresh question choices
	$scope.refreshQuestion = function(question) {
		question.prompt = null;
		question.choices = [[null,null]];
	}


	//Start Event
	$scope.startEvent = function(eventId) {

		$http({
			method: 'POST',
			url: prefix + 'organiser/event/'+eventId+'/start',
			params: {
				token: $rootScope.token
			}
		}).then(function success(data) {
			console.log(data);

		}, function error(data) {
			console.log('error');
		});
	}

	//Transformative controller
	$scope.transformQuadRow = function(input) {
		var rows = [];
		for (var i = 0; i<input.length; i+=4) {
			rows.push(input.slice(i,i+4));
		}

		console.log(rows);
		return rows;
	}

	//This is a weird ass solution to add voters to the list 
	$scope.addVoters = function(eventId,voters) {

		console.log(eventId, voters);

		$rootScope.activeVoters = [];
		$rootScope.activeEvent = eventId;

		voters.forEach(function (voter) {
			$rootScope.activeVoters.push(voter.id);
		})
	}

}]);