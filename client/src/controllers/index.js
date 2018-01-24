let firstName;
let lastName;
let major;
let skills;
let homeCity;
let homeState;
let availableDays;

angular.module('skillsControl', [])

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

.controller('interfaceController', ['$state', '$http', function($state, $http) {
    this.searchByName = function() {
        firstName = $("#first-name").val();
        lastName = $("#last-name").val();
        console.log("Searching by name: " + firstName + " " + lastName);
        if (firstName || lastName) {
            $("#main-menu").slideUp("medium", () => {
                console.log("Hiding main menu");
                $state.go('nameSearch').then(() => {
                    $("#name-search").hide()
                        .slideDown("slow", () => {
                            console.log("Name search displayed");
                        });
                })

            });
        }
    };

    this.searchByDetail = function() {
        console.log("Searching by detail...");
        major = $("#major").val();
        homeCity = $("#home-city").val();
        homeState = $("#home-state").val();
        availableDays = $("#available-days").val();
        skills = $("#skills").val().split(',').map(val => val.trim());
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

    this.add = function() {
        firstName = $("#first-name").val();
        lastName = $("#last-name").val();
        console.log("Adding to " + firstName + " " + lastName);
        skills = $("#skills").val().split(',').map(val => val.trim());
        console.log(skills);
        availableDays = $("#available-days").val();
        let postRequest = {
            "name": {
                "first": firstName,
                "last": lastName
            }
        };
        if (skills) postRequest.skills = skills;
        if (availableDays) postRequest.days = availableDays;

        $http.post('/user-add', postRequest).then(() => window.location.reload());
    }

    this.remove = function() {
        firstName = $("#first-name").val();
        lastName = $("#last-name").val();
        console.log("Removing from " + firstName + " " + lastName);
        skills = $("#skills").val().split(',').map(val => val.trim());
        availableDays = $("#available-days").val();
        let postRequest = {
            "name": {
                "first": firstName,
                "last": lastName
            }
        };
        let infoRequest = {
            "name": {
                "first": firstName,
                "last": lastName
            },
            "skills": skills,
            "days": availableDays,
            "major": major,
            "hometown": hometown
        };

        $http.post('/user-remove', postRequest).then(() => {
            $http.post('/user-overwrite', infoRequest).then(() => window.location.reload());
        });
    }

    this.overwrite = function() {
        firstName = $("#first-name").val();
        lastName = $("#last-name").val();
        skills = $("#skills").val().split(',').map(val => val.trim());
        availableDays = $("#available-days").val();
        major = $("#major").val();
        let hometown = {
            "city": $("#home-city").val(),
            "state": $("#home-state").val()
        }
        let postRequest = {
            "name": {
                "first": firstName,
                "last": lastName
            },
            "skills": skills,
            "days": availableDays,
            "major": major,
            "hometown": hometown
        }
        console.log("Overwriting");
        console.log(postRequest);

        $http.post('/user-overwrite', postRequest).then(() => window.location.reload());
    }
}])

.controller('detailsController', function($scope, $http) {
    $http.post('./details', {
        "major": major,
        "hometown": {
            "city": homeCity,
            "state": homeState
        },
        "skills": skills,
        "days": availableDays
    }).then(function(response) {
        console.log("finished query: ");
        console.log(response.data);
        $scope.results = response.data;
    })

})

.controller('nameController', function($scope, $http) {
    $http.get('./names', {
        "params": {
            "firstName": firstName,
            "lastName": lastName
        }
    }).then(
        function(response) {
            if (response.data) {
                let resultName = response.data.name.first + " " + response.data.name.last;
                $scope.results = {
                    name: resultName,
                    major: response.data.major,
                    skills: response.data.skills,
                    hometown: response.data.hometown,
                    daysAvailable: response.data.days
                }
            } else {
                $scope.results = {
                    name: "Nobody found!",
                    major: null,
                    skills: null,
                    hometown: null,
                    daysAvailable: null
                }
                $(".panel-body").hide();
            }
        });
})

.controller('backController', ['$state', function($state) {
    this.backName = function() {
        console.log("Returning to main menu");
        $("#name-search").slideUp("medium", () => {
            console.log("Name search hidden");
            $state.go("menu").then(() => {
                $("#main-menu").hide()
                    .slideDown("slow");
            })
        })
    }
    this.backDetail = function() {
        console.log("Returning to main menu");
        $("#detail-search").slideUp("medium", () => {
            console.log("Detail search hidden");
            $state.go("menu").then(() => {
                $("#main-menu").hide()
                    .slideDown("slow");
            })
        })
    }
}])