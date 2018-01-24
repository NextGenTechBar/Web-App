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
        matchStep["hometown.state"] = hometown.state;
    }
    if (hometown.city) {
        matchStep["hometown.city"] = { $regex: hometown.city, $options: 'i' };
    }

    if (skills[0] != ' ' || skills.length > 1) {
        matchStep.skills = { $in: skills.map(skill => new RegExp(skill, 'i')) };
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
            response.send(docs);
        }
    });
});

app.post('/user-add', (request, response) => {
    filter = {
        "name.first": request.body.name.first,
        "name.last": request.body.name.last
    }
    update = { "$addToSet": {} }
    update["$addToSet"].skills = { $each: request.body.skills };
    update["$addToSet"].days = { $each: request.body.days };
    console.log(filter);
    console.log(update);
    mongo.people().findOneAndUpdate(filter, update, (err, result) => {
        if (err) throw err;
        else {
            if (!result.value) mongo.people().insert({
                "name": {
                    "first": filter["name.first"],
                    "last": filter["name.last"]
                }
            });
            console.log(result);
            response.send()
        }
    });
});

app.post('/user-remove', (request, response) => {
    filter = {
        "name.first": request.body.name.first,
        "name.last": request.body.name.last
    }
    update = { "$pull": {} }
    update["$pull"].skills = { $in: request.body.skills };
    update["$pull"].days = { $in: request.body.days };
    console.log(filter);
    console.log(update);
    console.log(request.body.days.length);
    if (request.body.skills[0] == "" && request.body.days.length == 0) {
        console.log(request.body.skills);
        mongo.people().deleteOne(filter, (err, result) => {
            if (err) throw err;
        });
        response.send();
    }
    mongo.people().findOneAndUpdate(filter, update, (err, result) => {
        if (err) throw err;
        else {
            console.log(result);
            response.send()
        }
    });
});

app.post('/user-overwrite', (request, response) => {
    filter = {
        "name.first": request.body.name.first,
        "name.last": request.body.name.last
    }
    console.log("Overwriting: ")
    console.log(request.body);

    update = { "$set": {} }
    if (request.body.skills[0] != 0)
        update["$set"].skills = request.body.skills;
    if (request.body.days.length != 0)
        update["$set"].days = request.body.days;
    if (request.body.hometown.city)
        update["$set"]["hometown.city"] = request.body.hometown.city;
    if (request.body.hometown.state)
        update["$set"]["hometown.state"] = request.body.hometown.state;
    if (request.body.major)
        update["$set"].major = request.body.major;
    console.log(filter);
    console.log(update);
    console.log(Object.keys(update["$set"]).length);

    if (Object.keys(update["$set"]).length != 0) {
        mongo.people().findOneAndUpdate(filter, update, { "upsert": true }, (err, result) => {
            if (err) throw err;
            else {
                console.log(result);
                response.send()
            }
        });
    } else {
        response.send();
    }
})

app.listen(8080, function() {
    console.log("Listening on port 8080");
    mongo.connect();
});