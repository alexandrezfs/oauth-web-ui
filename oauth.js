var oauth = require('auth-server'),
    connect = require('connect'),
    util = require('util'),
    uuid = require('node-uuid'),
    model = require('./model'),
    config = require('./config');

var authCodes = {},
    accessTokens = {},
    clientService = {},
    tokenService = {},
    authorizationService = {},
    membershipService = {},
    supportedScopes = {},
    expiresIn = {},
    authServer = null,
    server = null;


var buildAuthServices = function () {

    model.ModelContainer.ClientModel.find({}, function (err, mongoClients) {

        //Building a consistent client structure
        var clients = {};

        mongoClients.forEach(function (client) {
            clients[client.id] = client;
        });

        authCodes = {},
            accessTokens = {},
            clientService = {
                getById: function (id, callback) {
                    return callback(clients[id]);
                },
                isValidRedirectUri: function (client, uri) {
                    return true;
                }
            },
            tokenService = {
                generateToken: function () {
                    return uuid.v4();
                },
                generateDeviceCode: function () {
                    return uuid.v4();
                }
            },
            authorizationService = {
                saveAuthorizationCode: function (codeData, callback) {
                    authCodes[codeData.code] = codeData;
                    return callback();
                },
                saveAccessToken: function (tokenData, callback) {
                    accessTokens[tokenData.access_token] = tokenData;
                    return callback();
                },
                getAuthorizationCode: function (code, callback) {
                    return callback(authCodes[code]);
                },
                getAccessToken: function (token, callback) {
                    return callback(accessTokens[token]);
                }
            },
            membershipService = {
                areUserCredentialsValid: function (userName, password, scope, callback) {
                    return callback(true);
                }
            },
            supportedScopes = ['profile', 'status', 'avatar'],
            expiresIn = 3600,
            authServer = new oauth(clientService, tokenService, authorizationService, membershipService, expiresIn, supportedScopes);

            if(!server) {
                startAuthServer();
            }

    });

};

exports.buildAuthServices = buildAuthServices;


var startAuthServer = function () {


    var authorize = function (req, res) {
            authServer.authorizeRequest(req, 'userid', function (response) {
                res.write(util.inspect(response));
                res.end();
            });
        },
        grantToken = function (req, res) {
            authServer.grantAccessToken(req, 'userid', function (token) {
                res.write(util.inspect(token));
                res.end();
            });
        },
        apiEndpoint = function (req, res) {
            authServer.validateAccessToken(req, function (validationResponse) {

                console.log(validationResponse);

                if (validationResponse.clientId && validationResponse.isValid) {

                    //Increment client call
                    model.ModelContainer.ClientModel.findOne({id: validationResponse.clientId}, function(err, client) {

                        console.log(client);

                        client.call_count = client.call_count + 1;
                        client.save();

                        res.write(JSON.stringify(validationResponse));
                        res.end();
                    });
                }
                else {
                    res.write(JSON.stringify(validationResponse));
                    res.end();
                }
            });
        };

    server = connect()
        .use(connect.query())
        .use(connect.bodyParser())
        .use('/oauth/authorize', authorize)
        .use('/oauth/token', grantToken)
        .use('/api/test', apiEndpoint).listen(config.values.auth_server_port);
};