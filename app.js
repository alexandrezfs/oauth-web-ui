var express = require('express');
var app = express();
var config = require('./config');

app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.render('index');
});

app.listen(config.values.server_port);