var express = require('express'),
	mongo = require('./db/mongo'),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    routes = null;

var app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(logger('dev'))

// app.configure(function () {
//     app.use(express.logger('dev'));      'default', 'short', 'tiny', 'dev'
//     app.use(express.bodyParser());
// });
// var db = database.db;
// var db;
mongo.init(function (error, database) {
    if (error)
        throw error;
    if(database != null) {
    	console.log("### has db");
    	// db = database;
    	routes = require('./routes/routes')(database)
    } else {
    	console.log("### NO db");
    }
	app.param('collectionName', function(req, res, next, collectionName){
	  req.collection = collectionName;
	  return next()
	})

	app.get('/', function(req, res, next) {
	  res.send('please select a collection, e.g., /collections/messages')
	})

	app.get('/collections/:collectionName', routes.getAll);
	app.post('/collections/:collectionName', routes.postUser);
	app.get('/ranking/:collectionName', routes.getRanking);

	app.listen(3000);
	console.log('Listening on port 3000...');
});
