var app = angular.module('cgApp', ['ngAnimate', 'socket-io']);

app.controller('lowerThirdsCtrl', ['$scope', 'socket',
    function($scope, socket){
        $scope.showLeft = false;

        socket.on("lowerthird:hideall", function (msg) {
            $scope.showLeft = false;
            $scope.showRight = false;
            $scope.showFull = false;
        });
        
        socket.on("lowerthird:hidefull", function (msg) {
            $scope.showFull = false;
        });
        
        socket.on("lowerthird:hideleft", function (msg) {
            $scope.showLeft = false;
        });
        
        socket.on("lowerthird:hideright", function (msg) {
            $scope.showRight = false;
        });

        socket.on("lowerthird:left", function (msg) {
            if($scope.showLeft) {
                $scope.showLeft = false;
            }
            $scope.left = msg;
            $scope.showLeft = true;
        });

        socket.on("lowerthird:right", function (msg) {
            if($scope.showRight) {
                $scope.showRight = false;
            }
            $scope.right = msg;
            $scope.showRight = true;
        });
        
        socket.on("lowerthird:full", function (msg) {
            if($scope.showFull) {
                $scope.showFull = false;
            }
            $scope.full = msg;
            $scope.showFull = true;
        });
    }
]);

app.controller('bugCtrl', ['$scope', '$timeout', 'socket',
    function($scope, $timeout, socket){
        $scope.tickInterval = 1000; //ms

        socket.on("bug", function (state) {
            $scope.state = state;
        });
        
        $scope.$watch('bug', function() {
            if (!$scope.bug) {
                getBugData();
            }
        }, true);
		
		socket.on("bug", function (msg) {
            $scope.bug = msg;
        });
        
        function getBugData() {
            socket.emit("bug:get");
        };
        
        var tick = function () {
            $scope.clock = Date.now(); // get the current time
            $timeout(tick, $scope.tickInterval); // reset the timer
        };

        // Start the timer
        $timeout(tick, $scope.tickInterval);
        
    function getTimeRemaining(endtime){
		  var t = Date.parse(endtime) - Date.now();
		  var seconds = Math.floor( (t/1000) % 60 );
		  var minutes = Math.floor( (t/1000/60) % 60 );
		  var hours = Math.floor( (t/(1000*60*60)) % 24 );
		  var days = Math.floor( t/(1000*60*60*24) );
		  return {
			'total': t,
			'days': days,
			'hours': hours,
			'minutes': minutes,
			'seconds': seconds
		  };
		}
		
	function initializeClock(id, endtime){
		  var clock = document.getElementById(id);
		  var timeinterval = setInterval(function(){
			var t = getTimeRemaining(endtime);
			if (t.total < 0) {
				clock.innerHTML = 'Polls Closed';
			}
			else {
				clock.innerHTML = 'Polls Close ' + ('0' + t.hours).slice(-2) + ':' + ('0' + t.minutes).slice(-2) + ':' + ('0' + t.seconds).slice(-2);
			}	  
		  },1000);
		}
		
		var deadline = new Date(Date.parse('08 Jun 2017 22:00:00 GMT+0100'));
		initializeClock('clockdiv', deadline);
    }
]);

app.controller('scoringCtrl', ['$scope', '$interval', '$http', 'socket',
    function($scope, $interval, $http, socket){        
        socket.on("score", function (msg) {
				$scope.score = msg;
			});
        
        $scope.$watch('score', function() {
            if (!$scope.score) {
                getScoreData();
            }
        }, true);

        function getScoreData() {
            socket.emit("score:get");
        }
    }

]);

app.controller('gridCtrl', ['$scope', 'socket',
    function($scope, socket){
        socket.on("grid", function (payload) {
            if (payload === "hide") {
                $scope.grid = {};
                $scope.show = false;
            } else {
                $scope.show = true;
                $scope.grid = payload;
            }
        });
    }
]);

app.controller('recentgridCtrl', ['$scope', 'socket',
    function($scope, socket){
        socket.on("recentgrid", function (payload) {
            if (payload === "hide") {
                $scope.recentgrid = {};
                $scope.show = false;
            } else {
                $scope.show = true;
                $scope.recentgrid = payload;
            }
        });
    }
]);

app.controller('seatsCtrl', ['$scope', '$http', 'socket',
    function($scope, $http, socket){

        socket.on("seats", function (msg) {
            $scope.seats = msg;
        });

        $scope.$watch('seats', function() {
            if (!$scope.seats) {
                getSeatsData();
            }
        }, true);

        function getSeatsData() {
            socket.emit("seats:get");
        }
    }
]);


app.controller('constituencyCtrl', ['$scope', 'socket',
    function($scope, socket){
        socket.on("constituency", function (payload) {
            if (payload === "hide") {
                $scope.show = false;
            } else {
                $scope.show = true;
                $scope.constituency = payload;
            }
        });
    }
]);