var express = require('express');
var app = express();
var config = require('./config');
var bodyParser = require('body-parser');
var session = require('express-session');
var model = require('./model');
var oauth = require('./oauth');
var md5 = require('MD5');

oauth.buildAuthServices();

app.use(bodyParser.json());
app.use(session({secret: 'ssshhhhh'}));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('index');
});

app.post('/authenticate', function (req, res) {

    var admin_login = req.body.admin_login;
    var admin_password = req.body.admin_password;

    if (admin_login == config.values.admin_login
        && admin_password == config.values.admin_password) {

        req.session.isConnected = true;

        res.redirect('/list');
    }
    else {
        res.redirect('/');
    }
});

app.get('/list', function (req, res) {

    if (req.session.isConnected) {

        //Displaying all clients

        model.ModelContainer.ClientModel.find({}, function (err, clients) {

            res.render('list', {clients: clients});
        });
    }
    else {

        res.redirect('/');
    }

});

app.post('/client/add', function (req, res) {

    if (req.session.isConnected) {

        var client = req.body;
        client.id = md5(new Date().getTime());
        client.secret = md5(new Date().getTime() - 1);
        client.grantTypes = ['implicit', 'password', 'client_credentials', 'authorization_code'];

        var clientM = model.ModelContainer.ClientModel(client);
        clientM.save(function (err) {
            oauth.buildAuthServices();
            res.redirect('/list');
        });
    }
    else {
        res.redirect('/');
    }

});

app.get('/client/remove/:_id', function (req, res) {

    if (req.session.isConnected) {

        model.ModelContainer.ClientModel.remove({_id: req.params._id}, function (err) {
            res.redirect('/list');
        });
    }
    else {
        res.redirect('/');
    }
});

app.listen(config.values.web_server_port);