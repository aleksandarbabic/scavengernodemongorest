var BSON = require('bson').BSONPure

module.exports = function(db){
    var module = {};
    module.getAll = function(req, res) {
        db.collection(req.collection, function(err, collection) {
            collection.find().toArray(function(err, items) {
                res.send(items);
            });
        });
    };

    module.getRanking = function(req, res) {
        db.collection(req.collection, function(err, collection) {
            collection.find({
              score:{$ne : ""}
              // ,
              // 'tasks.dateTimeCollected':{$type : 9}
            }, {
              _id: 0, unique_id: 1, firstName: 1, lastName: 1, fullName: 1, nickName: 1, score: 1, rank: 1, lastTaskDateTime: 1
            }, {
              sort: {
                'score': -1, 'lastTaskDateTime': 1
              }
            }).toArray(function(err, items) {
                res.send(items);
            });
        });
    };

    module.postUser = function(req, res) {
        var user = req.body;
        console.log('Adding user: ' + JSON.stringify(user));

        db.collection(req.collection, function(err, collection) {

            try {
      
                if(!user || !user.unique_id) {
                    console.log('No unique_id');
                    return next('Ooops! Error with data insert.');
                } 
                if(user._id != '') {
                    var _id = user._id;
                    delete user._id;
                    console.log('user._id exist');
                    console.log('\n');
                    collection.update({'_id':new BSON.ObjectID(_id)}, user, {safe: true, multi: false}, function(e, result){
                        if (e) return next(e)
                        //res.send((result === 1) ? {msg:'success'} : {msg: 'error'})
                        console.log('update by id');
                        console.log('\n');

                        collection.findOne({'_id':new BSON.ObjectID(_id)}, function(err, item) {
                            if (err) return next(err)
                            console.log('update by id -> find by id response\n'+JSON.stringify(item));
                            res.send(item);
                        });
                    });
                } else {
                    collection.count({'unique_id': user.unique_id}, function (err, count) {
                        if(count > 0) {
                            console.log('count exist');
                            console.log('\n');

                            //MUST UPDATE ONLY IMPORTANT FIELDS
                            console.log('### user: '+JSON.stringify(user));
                            console.log('\n');
                            var userNew = {};
                            for(var attributename in user) {
                                userNew[attributename]=user[attributename];
                            }
                            console.log('### userNew: '+JSON.stringify(userNew));
                            console.log('\n');
                            collection.update({'unique_id': userNew.unique_id}, userNew, {safe: true, multi: false}, function(e, result){
                                if (e) return next(e)
                                //res.send((result === 1) ? {msg:'success'} : {msg: 'error'})
                                console.log('update by id');
                                console.log('\n');

                                collection.findOne({'_id': new BSON.ObjectID(result.insertedIds[0])}, function(err, item) {
                                    if (err) return next(err)
                                    console.log('update by id -> find by id response\n'+JSON.stringify(item));
                                    res.send(item);
                                });
                            });

                            /*collection.findOne({'unique_id': user.unique_id }, function (err, docs) {
                                console.log('count -> find one by unique id response\n'+JSON.stringify(docs));
                                console.log('\n');
                                res.send(docs);
                            });*/

                        } else {
                            console.log('no count');
                            console.log('\n');
                            var _id = user._id;
                            delete user._id;
                            collection.insert(user, {safe:true}, function(e, result){
                                if (e) { 
                                    console.log('error occured ' + e);
                                    return next(e)
                                }
                                // console.log('1: '+JSON.stringify(result[0]));
                                // console.log('\n');

                                // console.log('2: '+JSON.stringify(result[0]._id));
                                // console.log('\n');

                                // console.log('3: '+JSON.stringify(result.insertedIds));
                                // console.log('\n');

                                // console.log('4: '+JSON.stringify(result.insertedIds[0]));
                                // console.log('\n');

                                // console.log('5: '+JSON.stringify(result.ops));
                                // console.log('\n');

                                // console.log('6: '+JSON.stringify(result.ops[0]));
                                // console.log('\n');

                                // console.log('7: '+JSON.stringify(result.ops[0]._id));
                                // console.log('\n');

                                // console.log('insert id: '+JSON.stringify(result.insertedIds));
                                // console.log('\n');

                                // console.log('8: '+JSON.stringify(result));
                                // console.log('\n');
                                collection.findOne({'_id': new BSON.ObjectID(result.insertedIds[0])}, function(err, item) {
                                    if (err) return next(err)
                                    console.log('insert -> find by id response data\n'+JSON.stringify(item));
                                    console.log('\n');
                                    res.send(item);
                                });
                            });              
                        }
                    });
                }
            } catch(e) {
                console.log('ERROR: '+e);
            }

        });
    };
    return module;
}
