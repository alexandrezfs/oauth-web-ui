var express = require('express');
var app = express();
var config = require('./config');
var bodyParser = require('body-parser');
var oauth = require('./oauth');

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('index');
});

app.listen(config.values.web_server_port);