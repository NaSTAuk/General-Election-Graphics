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
    }
]);

app.controller('scoringCtrl', ['$scope', '$interval', '$http', 'socket',
    function($scope, $interval, $http, socket){
        $scope.tickInterval = 60000; 
        
        socket.on("score", function (msg) {
				$scope.score = msg;
			});
        
        var fetchScore = function () {
          var config = {headers:  {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          };

          $http.get('data/score.json', config)
            .success(function(data) {
              if(isNaN(data.Con) || isNaN(data.Lab) || isNaN(data.LD)){
                console.log("Live data is giving us nonsense");
                return;
              };
              if(!$scope.manualScore){
                $scope.conScore = data.Con;
                $scope.labScore = data.Lab;
                $scope.libScore = data.LD;
                $scope.snpScore = data.SNP;
                $scope.othScore = data.Oth;
                $scope.grnScore = data.Green;
                $scope.pcScore = data.PC;
                $scope.dupScore = data.DUP;
              };
                socket.emit('conScore', data.Con);
                socket.emit('labScore', data.Lab);
                socket.emit('libScore', data.LD);
                socket.emit('snpScore', data.SNP);
                socket.emit('othScore', data.Oth);
                socket.emit('grnScore', data.Green);
                socket.emit('pcScore', data.PC);
                socket.emit('dupScore', data.DUP);
              }
          );
        };
    
        socket.on("score", function (state) {
            $scope.showScore = state.showScore;
            $scope.showSubtitle = state.showSubtitle;
            $scope.showcon = state.showcon;
            $scope.showlab = state.showlab;
            $scope.showlib = state.showlib;
            $scope.showsnp = state.showsnp;
            $scope.showtop = state.showtop;
            $scope.showgrn = state.showgrn;
            $scope.showpc = state.showpc;
            $scope.showdup = state.showdup;
            $scope.showoth = state.showoth;
            $scope.showall = state.showall;
            $scope.manualScore = state.manualScore;
            $scope.subtitle = state.subtitle;
         });

        $scope.$watch('score', function() {
            if (!$scope.score) {
                getScoreData();
            }
        }, true);

        function getScoreData() {
            socket.emit("score:get");
        }
                
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
			clock.innerHTML = 'Polls Close: ' + ('0' + t.hours).slice(-2) + ':' + ('0' + t.minutes).slice(-2) + ':' + ('0' + t.seconds).slice(-2);
			if(t.total<=0){
			  clearInterval(timeinterval);
			}
		  },1000);
		}
		
		var deadline = new Date(Date.parse('08 Jun 2017 22:00:00 GMT+0100'));
		initializeClock('clockdiv', deadline);

        //Intial fetch
        fetchScore();
        // Start the timer
        $interval(fetchScore, $scope.tickInterval);
    }

]);

app.controller('footballCtrl', ['$scope', 'socket',
    function($scope, socket){

        socket.on("football", function (msg) {
            $scope.football = msg;
        });

        socket.on("clock:tick", function (msg) {
            $scope.clock = msg.slice(0, msg.indexOf("."));
        });

        $scope.$watch('football', function() {
            if (!$scope.football) {
                getFootballData();
            }
        }, true);

        function getFootballData() {
            socket.emit("football:get");
            socket.emit("clock:get");
        }
    }
]);

app.controller('gridCtrl', ['$scope', 'socket',
    function($scope, socket){
        socket.on("grid", function (payload) {
            if (payload === "hide") {
                //We first remove every element with a delay
                setTimeout(function(){$scope.grid = {};}, 1000);
                $scope.show = false;
            } else {
                $scope.show = true;
                $scope.grid = payload;
            }
        });
    }
]);
