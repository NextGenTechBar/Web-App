import angular from 'angular';
import 'angular-ui-router';
angular.module('skills', ["ui.router"])

.config(($stateProvider, $urlRouterProvider) => {
    $urlRouterProvider.otherwise('/menu');

    $stateProvider
        .state('menu', {
            url: '/menu',
            templateUrl: 'templates/main-menu.html'
        })
        .state('nameSearch', {
            url: '/name-search',
            templateUrl: 'templates/name-search.html'
        })
        .state('detailSearch', {
            url: '/detail-search',
            templateUrl: 'templates/detail-search.html'
        })
})

.controller('statesController', function($http) {
    $http.get('/states').then((response) => {
        this.states = response.data;
    })
})


.controller('daysController', function($http) {
    $http.get('/days').then((response) => {
        this.days = response.data;
    })
})

.controller('interfaceController', ['$state', function($state) {
    this.searchByName = function() {
        console.log("Searching by name...");
        $("#main-menu").slideUp("medium", () => {
            console.log("Hiding main menu");
            $state.go('nameSearch').then(() => {
                $("#name-search").hide()
                    .slideDown("slow", () => {
                        console.log("Name search displayed");
                    });
            });
        })

    }

    this.searchByDetail = function() {
        $("#main-menu").slideUp("medium", () => {
            console.log("Hiding main menu");
            $state.go('detailSearch').then(() => {
                $("#detail-search").hide()
                    .slideDown("slow", () => {
                        console.log("Detail search displayed");
                    });
            });
        })
    }
}]);