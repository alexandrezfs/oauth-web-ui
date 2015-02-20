var express = require('express');
var app = express();
var config = require('./config');
var bodyParser = require('body-parser');
var session = require('express-session');
var model = require('./model');
var oauth = require('./oauth');

app.use(bodyParser.json());
app.use(session({secret: 'ssshhhhh'}));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('index');
});

app.post('/authenticate', function(req, res) {

    var admin_login = req.body.admin_login;
    var admin_password = req.body.admin_password;

    if(admin_login == config.values.admin_login
        && admin_password == config.values.admin_password) {

        req.session.isConnected = true;

        res.redirect('/list');
    }
    else {
        res.redirect('/');
    }
});

app.get('/list', function(req, res) {

    if(req.session.isConnected) {

        //Displaying all clients

        model.ModelContainer.ClientModel.find({}, function(err, clients) {

            res.render('list', clients);

        });

    }
    else {

        res.redirect('/');
    }

});

app.listen(config.values.web_server_port);