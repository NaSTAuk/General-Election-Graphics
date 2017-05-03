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
        $scope.tickInterval = 5000;
        $scope.yorkScore = "";
        $scope.lancScore = "";

        var fetchScore = function () {
          var config = {headers:  {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          };

          $http.get('data/score.json', config)
            .success(function(data) {
              if(isNaN(data.Conservative) || isNaN(data.ScottishNationalParty)){
                console.log("Roses live is giving us nonsense");
                return;
              };
              if(!$scope.manualScore){
                $scope.yorkScore = data.Conservative;
                $scope.lancScore = data.ScottishNationalParty;
              };
                socket.emit('lancScore', data.Conservative);
                socket.emit('yorkScore', data.ScottishNationalParty);
            }
          );
        };

        socket.on("score", function (state) {
            $scope.showScore = state.showScore;
            $scope.manualScore = state.manualScore;
            if(state.manualScore){
              $scope.yorkScore = state.yorkScore;
              $scope.lancScore = state.lancScore;
            };
        });

        $scope.$watch('score', function() {
            if (!$scope.score) {
                getScoreData();
            }
        }, true);

        function getScoreData() {
            socket.emit("score:get");
        }

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
