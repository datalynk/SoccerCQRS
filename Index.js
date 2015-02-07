angular.module('soccerApp', ['angular.filter', 'ngRoute'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'pages/home.html',
                controller: 'HomeController'
            })
            .when('/debug', {
                templateUrl: 'pages/debug.html',
                controller: 'DebugController'
            })
            .when('/gamesperteam', {
                templateUrl: 'pages/gamesperteam.html',
                controller: 'GamesperteamController'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .controller('NavigationController', [
        '$scope', '$route',
        function ($scope, $route) {
            $scope.$route = $route;
            $scope.routes = [
                {
                    name: 'Home',
                    controllerName: 'HomeController',
                    route: '#/'
                },
                {
                    name: 'Games per team',
                    controllerName: 'GamesperteamController',
                    route: '#/gamesperteam'
                },
                {
                    name: 'Debug',
                    controllerName: 'DebugController',
                    route: '#/debug'
                }
            ];
        }
    ])
    .controller('GamesperteamController', [
        '$scope', 'eventService', 'yearService',
        function ($scope, eventService, yearService) {
            $scope.years = yearService.Years;
            $scope.year = $scope.years[0];

            function setGames(result) {
                $scope.games = result.data;
                $scope.team = result.data[0].HomeTeam;
            }
            $scope.changeYear = function () {
                eventService.GetGamesForYear($scope.year).then(setGames);
            }
            $scope.changeYear();

            $scope.log = function(obj) {
                console.log(obj);
            };
        }
    ])
    .controller('HomeController', [
        function () {
        }
    ])
    .controller('DebugController', [
        '$scope', 'yearService',
        function ($scope, yearService) {
            $scope.years = yearService.Years;
        }
    ])
    .directive('debugyear', [
        'eventService', '$filter',
        function (eventService, $filter) {
            return {
                transclude: true,
                scope: {
                    year: '='
                },
                templateUrl: 'templates/debugyear.html',
                link: function (scope, element) {
                    function setGames(result) {
                        scope.allGames = result.data;
                        scope.allGamesPerTeam = $filter('groupBy')(result.data, 'HomeTeam');
                    }
                    eventService.GetGamesForYear(scope.year).then(setGames);
                }
            }
        }
    ])
    .service('eventService', [
        '$http',
        function ($http) {
            function getGamesForYear(year) {
                return $http.get('node/output/' + year + '.json');
            }

            return {
                GetGamesForYear: getGamesForYear
            }
        }
    ])
    .service('yearService', [
        function () {
            var years = [];
            for (var i = 92; i < 115; i++) {
                years.push((1900 + i) + "-" + (1901 + i));
            }

            return {
                Years: years
            }
        }
    ]);