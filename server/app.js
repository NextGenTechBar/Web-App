let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let mongo = require('./mongoUtil');

app.use(express.static(__dirname + "/../client"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/states', (request, response) => {
    let menus = mongo.menus();
    menus.find({ "name": "states" }).toArray((err, docs) => {
        response.status(200).json(docs[0].states);
    })
});

app.get('/days', (request, response) => {
    let menus = mongo.menus();
    menus.find({ "name": "days" }).toArray((err, docs) => {
        response.status(200).json(docs[0].days);
    })
});

app.get('/names', (request, response) => {
    let firstName = request.query.firstName;
    let lastName = request.query.lastName;
    let people = mongo.people();
    people.findOne({
            "name.first": { $regex: '^' + firstName, $options: 'i' },
            "name.last": { $regex: '^' + lastName, $options: 'i' }
        }, { "_id": false },
        (err, result) => {
            if (err) {
                throw err;
            } else {
                response.json(result)
            }
        }
    );
});

app.post('/details', (request, response) => {
    let major = request.body.major;
    let hometown = {
        "city": undefined,
        "state": undefined
    };
    if (request.body.hometown) {
        hometown = {
            "city": request.body.hometown.city,
            "state": request.body.hometown.state
        };
    }
    let skills = request.body.skills;
    let days = request.body.days;
    console.log("searching for");
    console.log("major: " + major);
    console.log("hometown: " + hometown.city + ", " + hometown.state);
    console.log("skills: " + skills);
    console.log("days: " + days);
    let people = mongo.people();
    let aggregationPipeline = [];
    let matchStep = {};
    let projectStep = {};
    projectStep.skills = 1;
    projectStep.days = 1;
    projectStep.name = 1;
    projectStep._id = 0;
    projectStep.major = 1;
    if (major != "") {
        matchStep.major = { $regex: major, $options: 'i' };
    }
    if (hometown.state) {
        matchStep.hometown = {};
        matchStep.hometown.state = hometown.state;
    }
    if (hometown.city) {
        if (!matchStep.hometown) matchStep.hometown = {};
        matchStep.hometown.city = hometown.city;
    }

    if (skills[0] != ' ' || skills.length > 1) {
        matchStep.skills = { $in: skills };
    }
    if (days.length != 0) {
        matchStep.days = { $in: days };
    }

    console.log("Querying for: ");
    console.log(matchStep);
    console.log("projecting: ");
    console.log(projectStep);
    people.find(matchStep).project(projectStep).toArray((err, docs) => {
        if (err) {
            throw err;
        } else {
            console.log(docs);
        }
    });

    response.send();
});

app.listen(8080, function() {
    console.log("Listening on port 8080");
    mongo.connect();
});