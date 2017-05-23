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
        localStorageServiceProvider.setPrefix('nasta');

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
        
        $scope.showallseats = function() {         		
         		$scope.roses.showcon = true;
				$scope.roses.showlab = true;
				$scope.roses.showlib = true;
				$scope.roses.showsnp = true;
				$scope.roses.showgrn = true;
				$scope.roses.showpc = true;
				$scope.roses.showdup = true;
				$scope.roses.showoth = true;
        };
        
        $scope.showtopseats = function() {         		
         		$scope.roses.showcon = true;
				$scope.roses.showlab = true;
				$scope.roses.showlib = true;
				$scope.roses.showsnp = true;
				$scope.roses.showgrn = false;
				$scope.roses.showpc = false;
				$scope.roses.showdup = false;
				$scope.roses.showoth = true;
        };
    }
]);

app.controller('seatsCGController', ['$scope', 'socket', '$http', 'localStorageService',
    function($scope, socket, $http, localStorageService) {
    
        socket.on("seats", function (msg) {
            $scope.seats = msg;
            	$scope.seats.conChange = $scope.seats.conScore - 330;
				$scope.seats.labChange = $scope.seats.labScore - 229;
				$scope.seats.snpChange = $scope.seats.snpScore - 54;
				$scope.seats.libChange = $scope.seats.libScore - 9;
				$scope.seats.dupChange = $scope.seats.dupScore - 8;
				$scope.seats.pcChange = $scope.seats.pcScore - 3;
				$scope.seats.grnChange = $scope.seats.grnScore - 1;
				$scope.seats.othChange = 15;
				$scope.seats.announced = Number($scope.seats.conScore) +  Number($scope.seats.labScore) +  Number($scope.seats.snpScore) +  Number($scope.seats.libScore) +  Number($scope.seats.dupScore) +  Number($scope.seats.pcScore) +  Number($scope.seats.grnScore) +  Number($scope.seats.othScore);
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
        
        $scope.updateseats = function() {
         		
         		var fetchData = function () {
       				var config = {headers:  {
					  'Accept': 'application/json',
					  'Content-Type': 'application/json',
					}
    			};

				$http.get('/data/live-seats.json', config).then(function (response) {
						$scope.seats.datadump = response.data;
					 });    
				};         		     		
         		fetchData();	
           	    
				$scope.seats.conScore = $scope.seats.datadump[0].Live_Seats;
                $scope.seats.labScore = $scope.seats.datadump[1].Live_Seats;
				$scope.seats.snpScore = $scope.seats.datadump[2].Live_Seats;
				$scope.seats.libScore = $scope.seats.datadump[3].Live_Seats;
				$scope.seats.dupScore = $scope.seats.datadump[4].Live_Seats;
				$scope.seats.pcScore = $scope.seats.datadump[8].Live_Seats;
				$scope.seats.grnScore = $scope.seats.datadump[11].Live_Seats;
				$scope.seats.othScore = 0;
        };
		
		$scope.showallseats = function() {         		
         		$scope.seats.showcon = true;
				$scope.seats.showlab = true;
				$scope.seats.showlib = true;
				$scope.seats.showsnp = true;
				$scope.seats.showgrn = true;
				$scope.seats.showpc = true;
				$scope.seats.showdup = true;
				$scope.seats.showoth = true;
        };

		
    }
]);

app.controller('constituencyCGController', ['$scope', '$log', '$http', 'localStorageService', 'socket',
    function($scope, $log, $http, localStorageService, socket){

        var stored = localStorageService.get('constituency');

        if(stored === null) {
            $scope.constituency = {};
        } else {
            $scope.constituency = stored;
        }

        $scope.show = function() {
            socket.emit('constituency', $scope.constituency);
            $log.info("constituency.show()");
            $log.info($scope.constituency);
        };

        $scope.hide = function() {
            socket.emit('constituency', 'hide');
            $log.info("constituency.hide()");
        };
         
        $scope.grabdata = function(conID) {
        		
        		function numberWithCommas(x) {
    				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				}
				
				
				var fetchColors = function () {
       				var config = {headers:  {
					  'Accept': 'application/json',
					  'Content-Type': 'application/json',
					}
    			};

				$http.get('/data/party_color_codes.json', config).then(function (response) {
						$scope.constituency.partycolors = response.data;
					 });    
				};
         
         		fetchColors();
         		
         		var fetchData = function () {
       				var config = {headers:  {
					  'Accept': 'application/json',
					  'Content-Type': 'application/json',
					}
    			};

				$http.get('/data/data_dump.json', config).then(function (response) {
						$scope.constituency.datadump = response.data;
					 });    
				};
         
         		fetchData();		

				$scope.constituency.conScore = $scope.constituency.datadump[0].Const_Name;
           	   	$scope.constituency.conRegn = $scope.constituency.datadump[0].REGID;
           	   	$scope.constituency.conParty = $scope.constituency.datadump[0].Winner15;
           	   	$scope.constituency.conColor = $scope.constituency.datadump[0].Color;
           	   	$scope.constituency.conTurnout = $scope.constituency.datadump[0].VALID15;  	   

           	    var liveSeats = {      	     
           	    "conName":conName,
           	    "conRegn":conRegn,
           	    "conParty":conParty,
           	    "conColor": conColor,
           	    "conTurnout":numberWithCommas(conTurnout),
           	    "conMajority":numberWithCommas(7500),
           	    "conMPName":"Gerald Howarth",
           	    "conDescription":"Con Hold",
           	    "conPartyOne":"CON",
           	    "conPartyOneVotes":numberWithCommas(32000),
           	    "conPartyOneColor":"#0575C9",
           	    "conPartyOneCandidate":"Johnny Cash",
           	    "conPartyTwo":"LAB",
           	    "conPartyTwoVotes":numberWithCommas(12000),
           	    "conPartyTwoColor":"#ED1E0E",
           	    "conPartyTwoCandidate":"Willie Nelson",
           	    "conPartyThree":"UKIP",
           	    "conPartyThreeVotes":numberWithCommas(12000),
           	    "conPartyThreeColor":"#712F87",
           	    "conPartyThreeCandidate":"Reba McEntire",
           	    "conPartyFour":"LIB",
           	    "conPartyFourVotes":numberWithCommas(8468),
           	    "conPartyFourColor":"#FEAE14",
           	    "conPartyFourCandidate":"Dolly Parton",
           	    "euleave":(0.64*100).toFixed(2),
           	    "euremain":(0.36*100).toFixed(2)
           	    };
           	    return localStorageService.set('constituency',liveSeats);
           	        
            $log.info("constituency.show()");
        };
     }
]);