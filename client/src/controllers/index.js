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
        skills = $("#skills").val().split(', ');
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
}])

.controller('detailsController', function($http) {
    $http.post('./details', {
        "major": major,
        "hometown": {
            "city": homeCity,
            "state": homeState
        },
        "skills": skills,
        "days": availableDays
    }).then(function(response) {
        console.log("finished query");
    })

    this.results = [{
            name: "Max",
            major: "Computer Science",
            matchingSkills: ["MEAN stack", "C++", "Java"],
            daysAvailable: ["Tuesday", "Thursday", "Friday"]
        },
        {
            name: "Ricky",
            major: "BMIS",
            matchingSkills: ["EasyVista", "Zach"],
            daysAvailable: ["Tuesday", "Thursday", "Friday"]
        },
        {
            name: "Nicole",
            major: "Civil",
            matchingSkills: ["Complaining", "somthing else", "lets make this list long", "push some things out"],
            daysAvailable: ["Tuesday", "Thursday", "I only work two days a week"]
        }
    ];
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