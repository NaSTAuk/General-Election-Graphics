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
            name: 'Announcements',
            url: '/announcements',
            type: 'link',
            icon: 'pink home'
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
            .when("/announcements", {
                templateUrl: '/admin/templates/constituency-announcements.html',
                controller: 'announceCGController'
            })
            .when("/roses", {
                templateUrl: '/admin/templates/roses.tmpl.html',
                controller: 'rosesCGController'
            })
            .when("/2017results", {
                templateUrl: '/admin/templates/2017liveresults.tmpl.html',
                controller: 'seatsCGController'
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

app.controller('announceCGController', ['$scope', 'socket', '$http',
    function($scope, socket, $http){
    	$http.get('/data/data_dump.json')
       		.then(function(res){
          	$scope.constituencies = res.data.map(function(c) {return {Const_Name: c.Const_Name,Color: c.Color, Winner15: c.Winner15, Constituency_ID: c.Constituency_ID}})
          	console.log($scope.constituencies)
        });
        
        socket.on("announce", function (msg) {
            $scope.announce = msg;
            
            var fetchData = function () {
       				var config = {headers:  {
					  'Accept': 'application/json',
					  'Content-Type': 'application/json',
					}
    		};

				$http.get('/data/2017_party_color_codes.json', config).then(function (response) {
						$scope.announce.data = response.data;
				});    
			};
				         		     		
         	fetchData();	
   	    
           	for(var i = 0; i < $scope.announce.data.length; i++){
           	 	if ($scope.announce.newparty == $scope.announce.data[i].party_name) {
           	    		$scope.announce.color = $scope.announce.data[i].party_color;
           	    }
			}
			
			if ($scope.announce.held == true) {
				$scope.announce.conclusion = $scope.announce.oldparty + " HELD";
				$scope.announce.color = $scope.announce.oldcolor;
			}
			else {
				$scope.announce.conclusion = $scope.announce.newparty + " GAIN FROM " + $scope.announce.oldparty;
			}
            
        });

        $scope.$watch('announce', function() {
            if ($scope.announce) {
                socket.emit("announce", $scope.announce);
            } else {
                getAnnounceData();
            }
        }, true);
        
        socket.on("announce", function (msg) {
            $scope.announce = msg;
        });
        
        $scope.changeConstituency = function(conID) {
        	var constituency = $scope.constituencies.filter(function( obj ) {
  				return obj.Constituency_ID == conID;
			});
			console.log(conID);
			console.log(constituency);

        	$scope.announce.constituency = constituency[0].Const_Name;
        	$scope.announce.oldparty = constituency[0].Winner15;
        	$scope.announce.oldcolor = constituency[0].Color;
        }
	
        function getAnnounceData() {
            socket.emit("announce:get");
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
        
        $scope.ExitPoll = function() {    
        		var newLiveSeats = {"header":"2017 Exit Poll", "rows": []};
				for(var i = 0; i < $scope.recentgrid.liveSeats.length; i++){
					var buildArray = {};
					for(var j = 0; j < $scope.recentgrid.liveSeats.length; j++){
						change = Number($scope.recentgrid.liveSeats[i].Exit_Poll) - Number($scope.recentgrid.liveSeats[i].PreElection_Seats);
						buildArray["left"] = $scope.recentgrid.liveSeats[i].Party_Name;
						buildArray["right"] = $scope.recentgrid.liveSeats[i].Exit_Poll;
						buildArray["change"] = (change<=0?'':'+') + change;
						buildArray["color"] = $scope.recentgrid.liveSeats[i].Color;
					}
					newLiveSeats["rows"].push(buildArray);
				}
           	    return localStorageService.set('recentgrid',newLiveSeats);
        };
        $scope.LiveSeatsOverview = function() {         
        		var newLiveSeats = {"header":"Live Party Standings", "rows": []};
				for(var i = 0; i < $scope.recentgrid.liveSeats.length; i++){
					var buildArray = {};
					for(var j = 0; j < $scope.recentgrid.liveSeats.length; j++){
						buildArray["left"] = $scope.recentgrid.liveSeats[i].Party_Name;
						buildArray["right"] = $scope.recentgrid.liveSeats[i].Live_Seats;
						buildArray["change"] = $scope.recentgrid.liveSeats[i].Live_Change;
						buildArray["color"] = $scope.recentgrid.liveSeats[i].Color;
					}
					newLiveSeats["rows"].push(buildArray);
				}
				return localStorageService.set('recentgrid',newLiveSeats);
        };
        
        
        $scope.PartyOverview = function() {         		
        		var newLiveSeats = {"header":"Pre-Election Party Standings", "rows": []};
				for(var i = 0; i < $scope.recentgrid.liveSeats.length; i++){
					var buildArray = {};
					for(var j = 0; j < $scope.recentgrid.liveSeats.length; j++){
						buildArray["left"] = $scope.recentgrid.liveSeats[i].Party_Name;
						buildArray["right"] = $scope.recentgrid.liveSeats[i].PreElection_Seats;
						buildArray["change"] = $scope.recentgrid.liveSeats[i].PreElection_Percent;
						buildArray["color"] = $scope.recentgrid.liveSeats[i].Color;
					}
					newLiveSeats["rows"].push(buildArray);
				}
           	    return localStorageService.set('recentgrid',newLiveSeats);
        };
        
        $scope.PartyOverviewTopFive = function() {
     	    	var otherScoreTopFive = $scope.recentgrid.liveSeats[5].PreElection_Seats + $scope.recentgrid.liveSeats[6].PreElection_Seats + $scope.recentgrid.liveSeats[7].PreElection_Seats + $scope.recentgrid.liveSeats[8].PreElection_Seats + $scope.recentgrid.liveSeats[9].PreElection_Seats + $scope.recentgrid.liveSeats[10].PreElection_Seats + $scope.recentgrid.liveSeats[11].PreElection_Seats;
     	    	var otherPercentageTopFive = Number($scope.recentgrid.liveSeats[5].PreElection_Percent) + Number($scope.recentgrid.liveSeats[6].PreElection_Percent) + Number($scope.recentgrid.liveSeats[7].PreElection_Percent) + Number($scope.recentgrid.liveSeats[8].PreElection_Percent) + Number($scope.recentgrid.liveSeats[9].PreElection_Percent) + Number($scope.recentgrid.liveSeats[10].PreElection_Percent) + Number($scope.recentgrid.liveSeats[11].PreElection_Percent);
          	    var liveSeats = {"rows":[
          	    {"left":$scope.recentgrid.liveSeats[0].Party_Name,"right":$scope.recentgrid.liveSeats[0].PreElection_Seats,"change":$scope.recentgrid.liveSeats[0].PreElection_Percent,"color":$scope.recentgrid.liveSeats[0].Color},
          	    {"left":$scope.recentgrid.liveSeats[1].Party_Name,"right":$scope.recentgrid.liveSeats[1].PreElection_Seats,"change":$scope.recentgrid.liveSeats[1].PreElection_Percent,"color":$scope.recentgrid.liveSeats[1].Color},
          	    {"left":$scope.recentgrid.liveSeats[2].Party_Name,"right":$scope.recentgrid.liveSeats[2].PreElection_Seats,"change":$scope.recentgrid.liveSeats[2].PreElection_Percent,"color":$scope.recentgrid.liveSeats[2].Color},
          	    {"left":$scope.recentgrid.liveSeats[3].Party_Name,"right":$scope.recentgrid.liveSeats[3].PreElection_Seats,"change":$scope.recentgrid.liveSeats[3].PreElection_Percent,"color":$scope.recentgrid.liveSeats[3].Color},
          	    {"left":$scope.recentgrid.liveSeats[4].Party_Name,"right":$scope.recentgrid.liveSeats[4].PreElection_Seats,"change":$scope.recentgrid.liveSeats[4].PreElection_Percent,"color":$scope.recentgrid.liveSeats[4].Color},
          	    {"left":"Others","right":otherScoreTopFive,"change":otherPercentageTopFive,"color":"#999999"}
				],"header":"Pre-Election Party Standings"};    
          	    return localStorageService.set('recentgrid',liveSeats);
        };

        $scope.$on("$destroy", function() {
            localStorageService.set('recentgrid', $scope.recentgrid);
        });
}]);

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
			
			var seats = [
				{party: "CON", score: $scope.seats.conScore, change: $scope.seats.conLiveChange},
				{party: "LAB", score: $scope.seats.labScore, change: $scope.seats.labLiveChange},
				{party: "SNP", score: $scope.seats.snpScore, change: $scope.seats.snpLiveChange},
				{party: "LIB", score: $scope.seats.libScore, change: $scope.seats.libLiveChange},
				{party: "DUP", score: $scope.seats.dupScore, change: $scope.seats.dupLiveChange},
				{party: "PC", score: $scope.seats.pcScore, change: $scope.seats.pcLiveChange},
				{party: "GRN", score: $scope.seats.grnScore, change: $scope.seats.grnLiveChange},
				{party: "OTH", score: $scope.seats.othScore, change: $scope.seats.othLiveChange}
			];
			
			// sort by seats			
			seats.sort(function(a,b){return b.score - a.score});
			
			$scope.seats.partyOneScore = seats[0].score;
			$scope.seats.partyOneName = seats[0].party;
			$scope.seats.partyOneChange = seats[0].change;
			$scope.seats.partyTwoScore = seats[1].score;
			$scope.seats.partyTwoName = seats[1].party;
			$scope.seats.partyTwoChange = seats[1].change;
			$scope.seats.partyThreeScore = seats[2].score;
			$scope.seats.partyThreeName = seats[2].party;
			$scope.seats.partyThreeChange = seats[2].change;
			$scope.seats.partyFourScore = seats[3].score;
			$scope.seats.partyFourName = seats[3].party;
			$scope.seats.partyFourChange = seats[3].change;
			$scope.seats.partyFiveScore = seats[4].score;
			$scope.seats.partyFiveName = seats[4].party;
			$scope.seats.partyFiveChange = seats[4].change;
			$scope.seats.partySixScore = seats[5].score;
			$scope.seats.partySixName = seats[5].party;
			$scope.seats.partySixChange = seats[5].change;
			$scope.seats.partySevenScore = seats[6].score;
			$scope.seats.partySevenName = seats[6].party;
			$scope.seats.partySevenChange = seats[6].change;
			$scope.seats.partyEightScore = seats[7].score;
			$scope.seats.partyEightName = seats[7].party;
			$scope.seats.partyEightChange = seats[7].change;			
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
						$scope.seats.liveseats = response.data;
					 });    
				};         		     		
         		fetchData();	
				var newLiveSeats = {"rows": []};        	    
           	    for(var i = 0; i < $scope.seats.liveseats.length; i++){
           	    	var buildArray = {};   
					for(var j = 0; j < $scope.seats.liveseats.length; j++){
						buildArray["Party_Code"] = $scope.seats.liveseats[i].Party_Code;
						buildArray["Live_Seats"] = $scope.seats.liveseats[i].PreElection_Seats;
						buildArray["Live_Change"] = $scope.seats.liveseats[i].Live_Change;
						buildArray["Color"] = $scope.seats.liveseats[i].Color;
					}
					newLiveSeats["rows"].push(buildArray);
				}
          
				$scope.seats.conScore = $scope.seats.liveseats[0].Live_Seats;
                $scope.seats.labScore = $scope.seats.liveseats[1].Live_Seats;
				$scope.seats.snpScore = $scope.seats.liveseats[2].Live_Seats;
				$scope.seats.libScore = $scope.seats.liveseats[3].Live_Seats;
				$scope.seats.dupScore = $scope.seats.liveseats[4].Live_Seats;
				$scope.seats.pcScore = $scope.seats.liveseats[8].Live_Seats;
				$scope.seats.grnScore = $scope.seats.liveseats[11].Live_Seats;
				$scope.seats.othScore = Number($scope.seats.liveseats[5].Live_Seats) + Number($scope.seats.liveseats[6].Live_Seats) + Number($scope.seats.liveseats[7].Live_Seats) + Number($scope.seats.liveseats[9].Live_Seats) + Number($scope.seats.liveseats[10].Live_Seats);
				$scope.seats.conLiveChange = $scope.seats.liveseats[0].Live_Change;
                $scope.seats.labLiveChange = $scope.seats.liveseats[1].Live_Change;
				$scope.seats.snpLiveChange = $scope.seats.liveseats[2].Live_Change;
				$scope.seats.libLiveChange = $scope.seats.liveseats[3].Live_Change;
				$scope.seats.dupLiveChange = $scope.seats.liveseats[4].Live_Change;
				$scope.seats.pcLiveChange = $scope.seats.liveseats[8].Live_Change;
				$scope.seats.grnLiveChange = $scope.seats.liveseats[11].Live_Change;
				$scope.seats.othLiveChange = Number($scope.seats.liveseats[5].Live_Change) + Number($scope.seats.liveseats[6].Live_Change) + Number($scope.seats.liveseats[7].Live_Change) + Number($scope.seats.liveseats[9].Live_Change) + Number($scope.seats.liveseats[10].Live_Change);

				
				return localStorageService.set('seats',newLiveSeats);
        };
		
		$scope.showallseats = function() {         		
         		$scope.seats.showone = true;
				$scope.seats.showtwo = true;
				$scope.seats.showthree = true;
				$scope.seats.showfour = true;
				$scope.seats.showfive = true;
				$scope.seats.showsix = true;
				$scope.seats.showseven = true;
				$scope.seats.showeight = true;
        };		
		$scope.showtopseats = function() {         		
         		$scope.seats.showone = true;
				$scope.seats.showtwo = true;
				$scope.seats.showthree = true;
				$scope.seats.showfour = true;
				$scope.seats.showfive = false;
				$scope.seats.showsix = false;
				$scope.seats.showseven = false;
				$scope.seats.showeight = false;
        };
    }
]);

app.controller('constituencyCGController', ['$scope', '$log', '$http', 'localStorageService', 'socket',
    function($scope, $log, $http, localStorageService, socket){
    
    	socket.on("constituency", function (msg) {
            if (msg !== 'hide') {
                $scope.constituency = msg;
            }
        });
        
         $scope.remove = function(index){
            $scope.constituency.rows.splice(index, 1);
        };
        
        var stored = localStorageService.get('constituency');

        if(stored === null) {
            $scope.constituency = {};
        } else {
            $scope.constituency = stored;
        }

        $scope.show = function() {
            $scope.calculate();
            socket.emit('constituency', $scope.constituency);
            $log.info("constituency.show()");
            $log.info($scope.constituency);
        };

        $scope.hide = function() {
            socket.emit('constituency', 'hide');
            $log.info("constituency.hide()");
        };
        
        $scope.hidegraphic = function() {
            socket.emit('constituency', 'hide');
        };
		
		var fetchData = function () {
       				var config = {headers:  {
					  'Accept': 'application/json',
					  'Content-Type': 'application/json',
					}
    			};

		$http.get('/data/data_dump.json', config).then(function (response) {
						conData = response.data;
					 });    
				
		$http.get('/data/2017_candidates.json', config).then(function (response) {
						candData = response.data;
					 });    
				
		$http.get('/data/2015-mps-eu-voting.json', config).then(function (response) {
						euData = response.data;
					 });    
				};					
				
        fetchData();
        
        $scope.calculate = function() {
         	
         	function numberWithCommas(x) {
    				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				}	
				
			candidates = $scope.constituency.rows;
         	candidates.sort(function(a,b){return b.Votes - a.Votes});
         	
			$scope.constituency.conMajority = candidates[0].Votes - candidates[1].Votes;
			$scope.constituency.conMajorityDisplay = numberWithCommas($scope.constituency.conMajority);
			$scope.constituency.conTurnout = 0;
			
			for (var i = 0; i < candidates.length; i ++) {
					$scope.constituency.conTurnout = Number($scope.constituency.conTurnout) + Number(candidates[i].Votes);
			}	
			$scope.constituency.conTurnoutDisplay = numberWithCommas($scope.constituency.conTurnout);
			
			$scope.constituency.changeTurnout = Number($scope.constituency.conTurnout) - Number($scope.constituency.oldTurnout);
			$scope.constituency.changeTurnoutDisplay = ($scope.constituency.changeTurnout<=0?'':'+') + numberWithCommas($scope.constituency.changeTurnout);
			var turnoutPC = ((Number($scope.constituency.changeTurnout) / Number($scope.constituency.oldTurnout)) * 100).toFixed(1);
			$scope.constituency.changeTurnoutPC = (turnoutPC<=0?'':'+') + turnoutPC;
			$scope.constituency.changeTurnoutPCDisplay = "(" + $scope.constituency.changeTurnoutPC + "%)";
			$scope.constituency.changeMajority = Number($scope.constituency.conMajority) - Number($scope.constituency.oldMajority);
			$scope.constituency.changeMajorityDisplay = ($scope.constituency.changeMajority<=0?'':'+') + numberWithCommas($scope.constituency.changeMajority);
			var majorityPC = ((Number($scope.constituency.changeMajority) / Number($scope.constituency.oldMajority)) * 100).toFixed(1);
			$scope.constituency.changeMajorityPC = (majorityPC<=0?'':'+') + majorityPC;
			$scope.constituency.changeMajorityPCDisplay = "(" + $scope.constituency.changeMajorityPC + "%)";
			$scope.constituency.winnerGrin = candidates[0].Image;
			$scope.constituency.winnerColor = candidates[0].Color;
			
			if ($scope.constituency.euleave > $scope.constituency.euremain) {
				$scope.constituency.EUResult = "Leave";
				$scope.constituency.EUResultDisplay = Number($scope.constituency.euleave).toFixed(1) + "% Leave";
			}
			else {
				$scope.constituency.EUResult = "Remain";
				$scope.constituency.EUResultDisplay = Number($scope.constituency.euremain).toFixed(1) + "% Remain";
			}
			
			if ($scope.constituency.euMPVote == $scope.constituency.EUResult) {
				$scope.constituency.EUResultSubtitle = $scope.constituency.EUResultDisplay + " | " + $scope.constituency.euMPName + " voted " + $scope.constituency.euMPVote;
			}
			else {
				$scope.constituency.EUResultSubtitle = $scope.constituency.EUResultDisplay + " | However " + $scope.constituency.euMPName + " voted " + $scope.constituency.euMPVote;
			}
			
			var oldParty = $scope.constituency.conParty.toUpperCase();
			
			if (candidates[0].partyCode == oldParty){
				$scope.constituency.conDescription = "- " + candidates[0].partyCode + " hold";
				}
			else {
				$scope.constituency.conDescription = "- " + candidates[0].partyCode + " gain from " + oldParty; 	
			}
			
			if (candidates[0].Votes == "" ||candidates[0].Votes == null) {
				$scope.constituency.conDescription = " - " + $scope.constituency.euMPName;
				$scope.constituency.conTurnoutDisplay = $scope.constituency.oldTurnout;
				$scope.constituency.changeTurnoutPCDisplay = "(" + $scope.constituency.oldTurnoutPC + "%)";
				$scope.constituency.conMajorityDisplay = $scope.constituency.oldMajority;
				$scope.constituency.changeMajorityPCDisplay = "(" + $scope.constituency.oldMajorityPC + "%)";
				$scope.constituency.winnerGrin = $scope.constituency.oldWinnerImg;
				$scope.constituency.winnerColor = $scope.constituency.conColor;
				$scope.constituency.subtitle = $scope.constituency.EUResultSubtitle;
			}
	
		};
         
        $scope.grabdata = function() {
        		
        		function numberWithCommas(x) {
    				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				}		
				
				var conID = Number($scope.constituency.conID);
				var conDataID = conID - 1;
				var conCode = conData[conDataID].Const_ID;
				var conName = conData[conDataID].Const_Name;
				var conColor = conData[conDataID].Color;
				var conParty = conData[conDataID].Winner;
				var conResult = conData[conDataID].Result;
				var conTurnout = conData[conDataID].VALID15;
				var conTurnoutPC = conData[conDataID].Turnout15;
				var conMajority = conData[conDataID].MAJ;
				var conMajorityPC = conData[conDataID].Majority15;
				var euleave = conData[conDataID].EUHANLEAVE;
				var euremain = conData[conDataID].EUHANREM;
				var oldWinner = conData[conDataID].MP_Name;
				
					for(var i = 0; i < euData.length; i++){
						if(euData[i].gss_code == conCode){
							var euMPVote = euData[i].EU_Position;
							var euMPName = euData[i].Name;
						}
					}
					
				var candidates = [];  
					for(var j = 0; j < candData.length; j++){
						var buildArray = {}; 
						var totalVotes = 0; 
						if(candData[j].gss_code == conCode){
							buildArray["Name"] = candData[j].name;
							buildArray["conCode"] = candData[j].gss_code;
							buildArray["partyCode"] = candData[j].party_id;
							buildArray["partyName"] = candData[j].party_name;
							buildArray["Color"] = candData[j].color;
							buildArray["Votes"] = candData[j].votes;
							buildArray["Image"] = candData[j].image_url;
						    candidates.push(buildArray);
						}
				}
						
				var noCandidates = candidates.length;
				var oldWinnerImg = "";
				for (var i = 0; i < candidates.length; i ++) {
					if (oldWinner == candidates[i].Name) {
						oldWinnerImg = candidates[i].Image;
						}
				}
								
           	    var liveSeats = {
           	    "rows": candidates,
           	    "conID": conID,      	     
           	    "conName":conName,
           	    "conParty":conParty,
           	    "conColor": conColor,
           	    "conNoCandidates": noCandidates,
           	    "euleave":(euleave*100).toFixed(2),
           	    "euremain":(euremain*100).toFixed(2),
           	    "euMPName": euMPName,
           	    "euMPVote": euMPVote,
           	    "oldMajority": conMajority,
           	    "oldMajorityPC": conMajorityPC,
           	    "oldTurnout": conTurnout,
           	    "oldTurnoutPC": conTurnoutPC,
           	    "oldWinner" : oldWinner,
           	    "oldWinnerImg" : oldWinnerImg
           	    };
				
           	    return localStorageService.set('constituency',liveSeats);

				$scope.constituency.conTurnout = 100;
	
           	        
            $log.info("constituency.show()");
        };
     }
]);