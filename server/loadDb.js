const path = require('path')
var Datastore = require('nedb');
var db = {
	freeTime: new Datastore({
		filename: path.join(path.dirname(require.main.filename), 'db/freeTime.db'),
		autoload: true,
		timeStamp: true
	}),
	testPeriods: new Datastore({
		filename: path.join(path.dirname(require.main.filename), 'db/testperiods.db'), 
		autoload: true ,
		timeStamp: true
	})
}

return db;