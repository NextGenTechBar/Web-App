import angular from 'angular';
import 'angular-ui-router';
import './controllers/index.js';
angular.module('skills', ["ui.router", "skillsControl"])

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