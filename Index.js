angular.module('soccerApp', ['angular.filter', 'ngRoute', 'ngOrderObjectBy'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'pages/home.html',
                controller: 'HomeController'
            })
            .when('/season', {
                templateUrl: 'pages/season.html',
                controller: 'SeasonController'
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
                    route: '/'
                },
                {
                    name: 'Season',
                    controllerName: 'SeasonController',
                    route: '/season'
                },
                {
                    name: 'Games per team',
                    controllerName: 'GamesperteamController',
                    route: '/gamesperteam'
                },
                {
                    name: 'Debug',
                    controllerName: 'DebugController',
                    route: '/debug'
                }
            ];
        }
    ])
    .controller('SeasonController', [
        '$scope', 'eventService', 'yearService',
        function ($scope, eventService, yearService) {
            $scope.years = yearService.Years;
            $scope.year = $scope.years[0];

            function setGames(result) {
                $scope.games = result.data;
                return result;
            }

            function setDates(result) {
                $scope.date = new Date($scope.games[0].Date);
                setMoment();
                $scope.minDate = moment($scope.games[$scope.games.length - 1].Date).format("YYYY-MM-DD");
                $scope.maxDate = moment($scope.games[0].Date).format("YYYY-MM-DD");
                return result;
            }

            var dateMoment = moment();
            function setMoment() {
                dateMoment = moment($scope.date);
            }
            $scope.$watch('date', setMoment);

            $scope.changeYear = function () {
                eventService.GetGamesForYear($scope.year)
                    .then(setGames)
                    .then(setDates)
                    .then(calculateTable);
            }
            $scope.changeYear();

            function Team(name) {
                return {
                    Points: 0,
                    Name: name,
                    Scored: 0,
                    Conceded: 0,
                    Wins: 0,
                    Draws: 0,
                    Losses: 0
                }
            }

            function calculateTable() {
                $scope.teams = {};
                angular.forEach($scope.games, function (game) {
                    if (dateMoment.isBefore(game.Date)) return;

                    var homeTeam = $scope.teams[game.HomeTeam] ?
                        $scope.teams[game.HomeTeam] :
                        new Team(game.HomeTeam);
                    var awayTeam = $scope.teams[game.AwayTeam] ?
                        $scope.teams[game.AwayTeam] :
                        new Team(game.AwayTeam);

                    homeTeam.Scored += game.HomeScore;
                    awayTeam.Scored += game.AwayScore;
                    homeTeam.Conceded += game.AwayScore;
                    awayTeam.Conceded += game.HomeScore;

                    if (game.AwayScore < game.HomeScore) {
                        homeTeam.Wins += 1;
                        awayTeam.Losses += 1;
                        homeTeam.Points += 3;
                    } else if (game.AwayScore > game.HomeScore) {
                        homeTeam.Losses += 1;
                        awayTeam.Wins += 1;
                        awayTeam.Points += 3;
                    } else {
                        homeTeam.Draws += 1;
                        awayTeam.Draws += 1;
                        homeTeam.Points += 1;
                        awayTeam.Points += 1;
                    }

                    $scope.teams[game.HomeTeam] = homeTeam;
                    $scope.teams[game.AwayTeam] = awayTeam;
                });
                $scope.calculateTable = function() {
                    calculateTable();
                };
            }
        }
    ])
    .controller('GamesperteamController', [
        '$scope', 'eventService', 'yearService',
        function ($scope, eventService, yearService) {
            $scope.years = yearService.Years;
            $scope.year = $scope.years[0];

            function setTeam(result) {
                $scope.team = result.data[0].HomeTeam;
                return result;
            }

            function setGames(result) {
                $scope.games = result.data;
                return result;
            }
            $scope.changeYear = function () {
                eventService.GetGamesForYear($scope.year).then(setGames).then(setTeam);
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
                        var teams = $filter('groupBy')(result.data, 'AwayTeam');
                        scope.allGamesPerTeam = {};

                        angular.forEach(teams, function(a, team, c) {
                            var gamesForTeam = $filter('filter')(scope.allGames, { $: team });
                            scope.allGamesPerTeam[team] = gamesForTeam;
                        });

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