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
                controller: 'lowerThirdsCGController'
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
            $scope.grid.rows.push({left:'', right:''});
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

app.controller('rosesCGController', ['$scope', 'socket',
    function($scope, socket){
        socket.on("score", function (msg) {
            $scope.roses = msg;
        });

        socket.on('conScore', function(msg){
          $scope.ConScore = msg
        });
        socket.on('labScore', function(msg){
          $scope.LabScore = msg
        });
        socket.on('libScore', function(msg){
          $scope.LibScore = msg
        });
        socket.on('snpScore', function(msg){
          $scope.SNPScore = msg
        });
        socket.on('othScore', function(msg){
          $scope.OTHScore = msg
        });
        socket.on('grnScore', function(msg){
          $scope.GRNScore = msg
        });
        socket.on('pcScore', function(msg){
          $scope.PCScore = msg
        });
        socket.on('dupScore', function(msg){
          $scope.DUPScore = msg
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
