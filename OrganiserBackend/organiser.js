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

		}, function error(error) {
			console.log("error");
		});
	}

	$scope.revertReset = function() {

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

		(function tickVoter() {
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

				$scope.timeout = $timeout(tickVoter,2000);

			}, function error (error) {
				console.log("error")
			});
		})();

		$http({
			method: 'GET',
			url: prefix + 'organiser/results',
			params: {
				token: $rootScope.token,
				eventId: 1
			}
		}).then(function success(data) {
			console.log(data);
		})

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
			$rootScope.tick();
		}, function error(error) {
			console.log(error);
		});

		$rootScope.activeVoters.push(voterId);
	}

	//Conclude adding voter, clear out temporary variables
	$scope.concludeAddVoter = function() {
		$rootScope.activeVoters = [];
		$rootScope.activeEvent = null;
	}

}]);

//Filter to arrange the choices in a neater manner
app.filter('quadRow',function() {

	return function(input) {

		var rows = [];
		for (var i = 0; i<input.length; i+=4) {
			rows.push(input.slice(i,i+4));
		}

		return rows;

	}
});

//Service to add results to a global variable;
app.service('results', ['$rootScope','$http', function ($rootScope,$http) {

	$rootScope.resultsArray = [];

	var state = false;

	this.getResultsLatch = function() {
		return state;
	}

	this.setResultsLatch = function(newState) {
		state = newState;
	}

	this.resetEventResults = function() {
		$rootScope.resultsArray = [];
	}

	this.addEventResult = function(eventId) {
		$http({
			method: 'GET',
			url: prefix + 'organiser/results',
			params: {
				token: $rootScope.token,
				eventId: eventId
			}
		}).then(function success(e) {

			var total = 0;

			//Finding total number of votes per question and adding them in
			for (var i = 0; i<e.data.length;i++) {

				console.log(e.data[i])

				for(var j = 0; j<e.data[i].votes.length; j++) {
					console.log(e.data[i].votes[j]);
					total+=e.data[i].votes[j][1];
				}

				if (total != 0) {

					for (var j=0; j<e.data[i].votes.length; j++) {
						e.data[i].votes[j][1] = e.data[i].votes[j][1]/total;
					}

				}
				
				total = 0;
			}

			var newData = {
				id: eventId,
				data: e.data
			}

			var sampleData = {
				id: eventId,
				data: [
					{
						question: "Are you gay?",
						id: eventId,
						votes: [
							["Yes",0.333333],
							["No",0.666666]
						]
					}
				]
			};

			$rootScope.resultsArray.push(newData);

			console.log($rootScope.resultsArray);

		}, function error(error) {
			console.log(error);
		})
	}
}])

//Handles all event related stuff, including questions and choices.
app.controller('EventList', ['$rootScope','$scope', '$http', '$timeout','results', function ($rootScope, $scope, $http,$timeout,results) {

	$scope.events = [];
	$scope.time = null;
	$rootScope.activeEvent = null;
	$rootScope.activeVoters = [];
	$scope.newEvent = null;

	$rootScope.tick = function() {
		$http({
				method: 'GET',
				url: prefix + 'organiser/event/all',
				params: {
					token: $rootScope.token
				}
			}).then(function success(e) {
				$scope.events = []

				if (results.getResultsLatch()) {
					results.setResultsLatch(false);
				} else {
					results.resetEventResults();

					e.data.forEach(function(event) {
						results.addEventResult(event.id);
					});

					results.setResultsLatch(true);
				}

				for (var i = 0; i<e.data.length; i+=2) {
					$scope.events.push(e.data.slice(i,i+2));
				}

				console.log($scope.events);
			}, function error(error) {
				console.log(error);
			});
	}

	$rootScope.$on('LoggedIn',function(val) {
		$rootScope.tick();
		setTimeout($rootScope.tick,2000);
	});

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
			$rootScope.tick();
			setTimeout($rootScope.tick,2000);
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
			$rootScope.tick();
			setTimeout($rootScope.tick,2000);
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
			$rootScope.tick();
			setTimeout($rootScope.tick,2000);
		}, function error(data) {
			console.log('error');
		});
	}

	$scope.endEvent = function(eventId) {

		$http({
			method: 'POST',
			url: prefix + 'organiser/event/'+eventId+'/end',
			params: {
				token: $rootScope.token
			}
		}).then(function success(data) {
			console.log(data);
			$rootScope.tick();
			setTimeout($rootScope.tick,2000);
		}, function error(data) {
			console.log('error');
		});
	}
	//Transformative controller
	$scope.transformQuadRow = function(input) {
		var rows = [];
		for (var i = 0; i<input.length; i+=2) {
			rows.push(input.slice(i,i+2));
		}

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

	//Add a new event to the organiser panel
	$scope.addEvent = function() {
		$http({
			method: 'POST',
			url: prefix + 'organiser/event',
			params: {
				token: $rootScope.token,
			},
			data: {
				name: $scope.newEvent
			}
		}).then(function success(data) {
			console.log(data);
			$scope.newEvent = null;
			$rootScope.tick();
			setTimeout($rootScope.tick,2000);
		}, function error(error) {
			console.log(error);
		})
	}

	//Delete a question from an event
	$scope.deleteQuestion = function(questId) {
		$http({
			method: 'DELETE',
			url: prefix + 'organiser/question/' + questId,
			params: {
				token: $rootScope.token
			}
		}).then(function success(data) {
			console.log(data);
			$rootScope.tick();
			setTimeout($rootScope.tick,2000);
		}, function error(error) {
			console.log(error);
		})
	}

	//Compute the style for each object and return to form the visualization
	$scope.computeStyle = function(value,index) {

		var color = ['#d53e4f','#fc8d59','#fee08b','#e6f598','#99d594'];

		return {
			width: value * 500 + 'px',
			background: color[index],
			display: 'inline-block',
			height: 30+'px',
		};
	}

	//To round variables for the function in ngRepeat
	$scope.roundValue = function(value) {
		return Math.round(value * 100);
	}

	//Find index of the required event and return it
	$scope.findIndex = function(eventId) {

		var index;

		 $rootScope.resultsArray.forEach(function(result) {
			if (eventId == result.id) {
				console.log($rootScope.resultsArray[$rootScope.resultsArray.indexOf(result)])
				index = $rootScope.resultsArray.indexOf(result);
			}
		})

		console.log(index);

		return index;
	}
}]);