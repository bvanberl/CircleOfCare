angular.module('appRoutes', ['ngRoute']).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider

        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'HomeController'
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl',
            controllerAs: 'vm'
        })
        .when('/register', {
            templateUrl: 'views/register.html',
            controller: 'RegisterCtrl',
            controllerAs: 'vm'
        })
        .when('/profile', {
            templateUrl: 'views/profile.html',
            controller: 'ProfileCtrl',
            controllerAs: 'vm'
        })
        .when('/dashboard', {
            templateUrl: 'views/dashboard.html',
            controller: 'DashboardController'
        });

    $locationProvider.html5Mode(true);

}]);
