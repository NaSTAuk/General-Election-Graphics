var app = angular.module('StarterApp', ['ngRoute', 'LocalStorageModule', 'angularify.semantic', 'socket-io']);

app.controller('AppCtrl', ['$scope', '$location',
    function($scope, $location){
        $scope.menu = [];

        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };

        $scope.menu.push({
            name: 'General',
            url: '/general',
            type: 'link',
            icon: 'settings',
        });

        $scope.menu.push({
            name: 'Lower Thirds',
            url: '/lowerThirds',
            type: 'link',
            icon: 'violet list layout'
        });
        
        $scope.menu.push({
            name: 'Constituency Info',
            url: '/constituencyinfo',
            type: 'link',
            icon: 'violet home'
        });

        $scope.menu.push({
            name: 'Grid',
            url: '/grid',
            type: 'link',
            icon: 'teal grid layout',
        });
        
        $scope.menu.push({
            name: 'Automated Grids',
            url: '/recentgrid',
            type: 'link',
            icon: 'purple grid layout',
        });
      
        $scope.menu.push({
            name: '2015 Results',
            url: '/2015results',
            type: 'link',
            icon: 'history',
        });
        
        $scope.menu.push({
            name: '2017 Live Results',
            url: '/2017results',
            type: 'link',
            icon: 'green forward',
        });
    }
]);

/*
 *  Configure the app routes
 */
app.config(['$routeProvider', 'localStorageServiceProvider',
    function($routeProvider, localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('la1tv');

        $routeProvider
            .when("/general", {
                templateUrl: '/admin/templates/general.tmpl.html',
                controller: 'generalCGController'
            })
            .when("/lowerThirds", {
                templateUrl: '/admin/templates/lowerThirds.tmpl.html',
                controller: 'lowerThirdsCGController'
            })
            .when("/constituencyinfo", {
                templateUrl: '/admin/templates/constituencyinfo.tmpl.html',
                controller: 'constituencyCGController'
            })
            .when("/roses", {
                templateUrl: '/admin/templates/roses.tmpl.html',
                controller: 'rosesCGController'
            })
            .when("/2015results", {
                templateUrl: '/admin/templates/2015results.tmpl.html',
                controller: 'rosesCGController'
            })
            .when("/2017results", {
                templateUrl: '/admin/templates/2017liveresults.tmpl.html',
                controller: 'seatsCGController'
            })
            .when("/football", {
                templateUrl: '/admin/templates/football.tmpl.html',
                controller: 'footballCGController'
            })
            .when("/grid", {
                templateUrl: '/admin/templates/grid.tmpl.html',
                controller: 'gridCGController'
            })
            .when("/recentgrid", {
                templateUrl: '/admin/templates/recentgrid.tmpl.html',
                controller: 'recentgridCGController'
            })            
            .otherwise({redirectTo: '/general'});
    }
]);

app.controller('generalCGController', ['$scope', 'socket',
    function($scope, socket){
        socket.on("bug", function (msg) {
            $scope.general = msg;
        });

        $scope.$watch('general', function() {
            if ($scope.general) {
                socket.emit("bug", $scope.general);
            } else {
                getBugData();
            }
        }, true);
        
        socket.on("bug", function (msg) {
            $scope.bug = msg;
        });
        
	  function clearAllData() {
		return localStorageService.clearAll();
	  }
	
        function getBugData() {
            socket.emit("bug:get");
        }
    }
]);

app.controller('lowerThirdsCGController', ['$scope', 'localStorageService', 'socket',
    function($scope, localStorageService, socket){

        var stored = localStorageService.get('lower_thirds');

        if(stored === null) {
            $scope.queuedThirds = [];
        } else {
            $scope.queuedThirds = stored;
        }

        $scope.add = function(item) {
            $scope.queuedThirds.push(item);

            $scope.lowerThirdsForm.$setPristine();
            $scope.lowerThird = {};
        };

        $scope.remove = function(index){
            $scope.queuedThirds.splice(index, 1);
        };

        $scope.show = function(side, item) {
            socket.emit("lowerthird:" + side, item);
        };

        $scope.hideall = function() {
            socket.emit("lowerthird:hideall");
        };
        
        $scope.hidefull = function() {
            socket.emit("lowerthird:hidefull");
        };

		$scope.hideleft = function() {
            socket.emit("lowerthird:hideleft");
        };

		$scope.hideright = function() {
            socket.emit("lowerthird:hideright");
        };

        $scope.$on("$destroy", function() {
            localStorageService.set('lower_thirds', $scope.queuedThirds);
        });
    }
]);

app.controller('gridCGController', ['$scope', '$log', 'localStorageService', 'socket',
    function($scope, $log, localStorageService, socket){

        var stored = localStorageService.get('grid');

        if(stored === null) {
            $scope.grid = {};
            $scope.grid.rows = [];
        } else {
            $scope.grid = stored;
        }

        $scope.add = function() {
            $scope.grid.rows.push({left:'', right:'', color:''});
        };

        $scope.remove = function(index){
            $scope.grid.rows.splice(index, 1);
        };

        $scope.show = function() {
            socket.emit('grid', $scope.grid);
            $log.info("grid.show()");
            $log.info($scope.grid);
        };

        $scope.hide = function() {
            socket.emit('grid', 'hide');
            $log.info("grid.hide()");
        };

        $scope.$on("$destroy", function() {
            localStorageService.set('grid', $scope.grid);
        });
}]);

app.controller('recentgridCGController', ['$scope', '$log', '$http', 'localStorageService', 'socket',
    function($scope, $log, $http, localStorageService, socket){

        var stored = localStorageService.get('recentgrid');

        if(stored === null) {
            $scope.recentgrid = {};
            $scope.recentgrid.rows = [];
        } else {
            $scope.recentgrid = stored;
        }

        $scope.add = function() {
            $scope.recentgrid.rows.push({left:'', right:'', color:''});
        };

        $scope.remove = function(index){
            $scope.recentgrid.rows.splice(index, 1);
        };

        $scope.show = function() {
            socket.emit('recentgrid', $scope.recentgrid);
            $log.info("recentgrid.show()");
            $log.info($scope.recentgrid);
        };

        $scope.hide = function() {
            socket.emit('recentgrid', 'hide');
            $log.info("recentgrid.hide()");
        };
          
          var fetchSeats = function () {
          var config = {headers:  {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          };

			$http.get('/data/live-seats.json', config).then(function (response) {
				$scope.recentgrid.liveSeats = response.data;
				$scope.liveSeats = response.data;
			 });    
        };
         
         fetchSeats();
         $scope.PartyOverview = function() {
     	    
          	    var liveSeats = {"rows":[
          	    {"left":$scope.recentgrid.liveSeats[0].Party_Name,"right":$scope.recentgrid.liveSeats[0].PreElection_Seats,"color":$scope.recentgrid.liveSeats[0].Color},
          	    {"left":$scope.recentgrid.liveSeats[1].Party_Name,"right":$scope.recentgrid.liveSeats[1].PreElection_Seats,"color":$scope.recentgrid.liveSeats[1].Color},
          	    {"left":$scope.recentgrid.liveSeats[2].Party_Name,"right":$scope.recentgrid.liveSeats[2].PreElection_Seats,"color":$scope.recentgrid.liveSeats[2].Color},
          	    {"left":$scope.recentgrid.liveSeats[3].Party_Name,"right":$scope.recentgrid.liveSeats[3].PreElection_Seats,"color":$scope.recentgrid.liveSeats[3].Color},
          	    {"left":$scope.recentgrid.liveSeats[4].Party_Name,"right":$scope.recentgrid.liveSeats[4].PreElection_Seats,"color":$scope.recentgrid.liveSeats[4].Color},
          	    {"left":$scope.recentgrid.liveSeats[5].Party_Name,"right":$scope.recentgrid.liveSeats[5].PreElection_Seats,"color":$scope.recentgrid.liveSeats[5].Color},
          	    {"left":$scope.recentgrid.liveSeats[6].Party_Name,"right":$scope.recentgrid.liveSeats[6].PreElection_Seats,"color":$scope.recentgrid.liveSeats[6].Color},
          	    {"left":$scope.recentgrid.liveSeats[7].Party_Name,"right":$scope.recentgrid.liveSeats[7].PreElection_Seats,"color":$scope.recentgrid.liveSeats[7].Color},
          	    {"left":$scope.recentgrid.liveSeats[8].Party_Name,"right":$scope.recentgrid.liveSeats[8].PreElection_Seats,"color":$scope.recentgrid.liveSeats[8].Color},
          	    {"left":$scope.recentgrid.liveSeats[9].Party_Name,"right":$scope.recentgrid.liveSeats[9].PreElection_Seats,"color":$scope.recentgrid.liveSeats[9].Color},
          	    {"left":$scope.recentgrid.liveSeats[10].Party_Name,"right":$scope.recentgrid.liveSeats[10].PreElection_Seats,"color":$scope.recentgrid.liveSeats[10].Color},
          	    {"left":$scope.recentgrid.liveSeats[11].Party_Name,"right":$scope.recentgrid.liveSeats[11].PreElection_Seats,"color":$scope.recentgrid.liveSeats[11].Color},
          	    {"left":$scope.recentgrid.liveSeats[12].Party_Name,"right":$scope.recentgrid.liveSeats[12].PreElection_Seats,"color":$scope.recentgrid.liveSeats[12].Color}
				],"header":"Party Overview"};    
          	    return localStorageService.set('recentgrid',liveSeats);
        };
        
        $scope.PartyOverviewTopFive = function() {
     	    	var otherScoreTopFive = $scope.recentgrid.liveSeats[5].PreElection_Seats + $scope.recentgrid.liveSeats[6].PreElection_Seats + $scope.recentgrid.liveSeats[7].PreElection_Seats + $scope.recentgrid.liveSeats[8].PreElection_Seats + $scope.recentgrid.liveSeats[9].PreElection_Seats + $scope.recentgrid.liveSeats[10].PreElection_Seats + $scope.recentgrid.liveSeats[11].PreElection_Seats;
     	    	
          	    var liveSeats = {"rows":[
          	    {"left":$scope.recentgrid.liveSeats[0].Party_Name,"right":$scope.recentgrid.liveSeats[0].PreElection_Seats,"color":$scope.recentgrid.liveSeats[0].Color},
          	    {"left":$scope.recentgrid.liveSeats[1].Party_Name,"right":$scope.recentgrid.liveSeats[1].PreElection_Seats,"color":$scope.recentgrid.liveSeats[1].Color},
          	    {"left":$scope.recentgrid.liveSeats[2].Party_Name,"right":$scope.recentgrid.liveSeats[2].PreElection_Seats,"color":$scope.recentgrid.liveSeats[2].Color},
          	    {"left":$scope.recentgrid.liveSeats[3].Party_Name,"right":$scope.recentgrid.liveSeats[3].PreElection_Seats,"color":$scope.recentgrid.liveSeats[3].Color},
          	    {"left":$scope.recentgrid.liveSeats[4].Party_Name,"right":$scope.recentgrid.liveSeats[4].PreElection_Seats,"color":$scope.recentgrid.liveSeats[4].Color},
          	    {"left":"Others","right":otherScoreTopFive,"color":"#999999"}
				],"header":"Party Overview"};    
          	    return localStorageService.set('recentgrid',liveSeats);
        };

        $scope.$on("$destroy", function() {
            localStorageService.set('recentgrid', $scope.recentgrid);
        });
}]);

app.controller('rosesCGController', ['$scope', 'socket',
    function($scope, socket){
        socket.on("score", function (msg) {
            $scope.roses = msg;
        });
        
        $scope.$watch('roses', function() {
            if ($scope.roses) {
                socket.emit("score", $scope.roses);
            } else {
                getScoreData();
            }
        }, true);

        function getScoreData() {
            socket.emit("score:get");
        }
    }
]);

app.controller('seatsCGController', ['$scope', 'socket',
    function($scope, socket) {
        socket.on("seats", function (msg) {
            $scope.seats = msg;
        });

        $scope.$watch('seats', function() {
            if ($scope.seats) {
                socket.emit("seats", $scope.seats);
            } else {
                getSeatsData();
            }
        }, true);

        function getSeatsData() {
            socket.emit("seats:get");
        }

    }
]);

app.controller('constituencyCGController', ['$scope', 'socket',
    function($scope, socket) {
        socket.on("constituency", function (msg) {
            $scope.constituency = msg;
        });

        $scope.$watch('constituency', function() {
            if ($scope.constituency) {
                socket.emit("constituency", $scope.constituency);
            } else {
                getConstituencyData();
            }
        }, true);

        function getConstituencyData() {
            socket.emit("constituency:get");
        }

    }
]);
