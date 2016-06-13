var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

module.exports.init = function (callback) {

	MongoClient.connect("mongodb://uname:password@localhost:27017/DBName", function(err, database) {
		if(err) throw err;
	    console.log("Database opened");
	    console.log("Connected to 'DBName' database");
	    callback(err,database);
	});
}
