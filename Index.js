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
            .when('/gamesperteam/:year?/:team?', {
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
        '$scope', 'eventService', '$routeParams',
        function ($scope, eventService, $routeParams) {
            $scope.params = $routeParams;
            $scope.years = [];
            for (var i = 92; i < 115; i++) {
                $scope.years.push((1900 + i) + "-" + (1901 + i));
            }
            if (!$scope.params.year) $scope.params.year = $scope.years[0];

            $scope.games = [];

            $scope.teams = [];
            function setTeams(result) {
                $scope.teams = result.data;
                if (!$scope.params.team) $scope.params.team = Object.keys($scope.teams)[0];
            }
            eventService.GetAllTeams($scope.params.year).then(setTeams);

            function setGames(result) {
                $scope.games = result.data;
            }
            $scope.changeYear = function () {
                eventService.GetGamesPerTeam($scope.params.year, $scope.params.team).then(setGames);
            }
            $scope.changeYear($scope.params.year);
        }
    ])
    .controller('HomeController', [
        function () {
        }
    ])
    .controller('DebugController', [
        function () {
        }
    ])
    .service('eventService', [
        '$http', '$filter',
        function ($http, $filter) {
            function getGamesPerTeam(year, team) {
                function filterByTeam(promise) {
                    promise.data = $filter('filter')(promise.data, { $: team });
                    return promise;
                }
                return $http.get('node/output/' + year + '.json').then(filterByTeam);
            }

            function getAllTeams(year) {
                function filterHomeTeams(promise) {
                    promise.data = $filter('groupBy')(promise.data, 'HomeTeam');
                    return promise;
                }
                return $http.get('node/output/' + year + '.json').then(filterHomeTeams);
            }

            return {
                GetGamesPerTeam: getGamesPerTeam,
                GetAllTeams: getAllTeams
            }
        }
    ]);