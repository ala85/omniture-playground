var express = require('express'),
    request = require('request'),
    cors = require('cors'),
    wsse = require('./public/js/wsse.js');


// Variables
var DEFAULT_API_URL = "https://api.omniture.com/admin/1.4/rest/";

var app = express();
app.use(cors());
app.use('/', express.static(__dirname + '/public'));

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.post('/api/companies', function(req, res) {

    var method = req.query.method,
        apiURL = req.body.apiURL || DEFAULT_API_URL,
        company = req.body.company,
        login = req.body.login,
        password = req.body.password,
        username = login + ":" + company

    var options = {
        url: apiURL,
        qs: {
            method: method
        },
        json: {
            company: company,
            login : login,
            password : password
        },
        headers: {
            "X-WSSE": getToken(username, password)
        },
        method: "POST"
    };


    request(options, function (error, response, body) {
        res.send(body);
    });
});


app.post('/api/reports', function(req, res) {

    var method = req.query.method,
        apiURL = req.body.apiURL,
        searchQuery = req.body.sp,
        username = req.body.username,
        secret = req.body.secret;

    var options = {
        url: apiURL,
        qs: {
            method: method
        },
        json: {
            sp: searchQuery
        },
        headers: {
            "X-WSSE": getToken(username, secret)

        },
        method: "POST"
    };


    request(options, function (error, response, body) {
        res.send({result : body})
    });
});


app.post('/api/variables', function(req, res) {

    var method = req.query.method,
        apiURL = req.body.apiURL,
        rsid = req.body.reportSuiteID,
        username = req.body.username,
        secret = req.body.secret;

    var options = {
        url: apiURL,
        qs: {
            method: method
        },
        json: {
            reportSuiteID: rsid
        },
        headers: {
            "X-WSSE": getToken(username, secret)

        },
        method: "POST"
    };


    request(options, function (error, response, body) {
        var interestingVariables = [];
        body.filter(function(report) {
            if(report.id.indexOf("evar") !== -1 ||
                report.id.indexOf("prop")!== -1 ||
                report.id.indexOf("event")!== -1) {
                interestingVariables.push(report);
            }
        })

        res.send({result : interestingVariables})
    });
});


function getToken(username, secret) {
    return wsse.wsseHeader(username, secret);
}

var server = app.listen(3002, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})


