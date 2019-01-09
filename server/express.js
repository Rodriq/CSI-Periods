const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 8000;
const path = require('path')

app.use(cors({origin: true}))
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var Datastore = require('nedb');
var db = {};
db.freeTime = new Datastore({
	filename: path.join(path.dirname(require.main.filename), 'db/freeTime.db'),
	autoload: true,
	timeStamp: true
})
db.testPeriods = new Datastore({
	filename: path.join(path.dirname(require.main.filename), 'db/testperiods.db'), 
	autoload: true ,
	timeStamp: true
});

// console.log(db.testPeriods.filename)

let requiredTime = [{ time: '7:00 - 8:00', vote: 0 },
{ time: '8:00 - 9:00', vote: 0 },
{ time: '9:00 - 10:00', vote: 0 },
{ time: '10:00 - 11:00', vote: 0 },
{ time: '11:00 - 12:00', vote: 0 },
{ time: '12:00 - 13:00', vote: 0 },
{ time: '13:00 - 14:00', vote: 0 },
{ time: '14:00 - 15:00', vote: 0 },
{ time: '15:00 - 16:00', vote: 0 },
{ time: '16:00 - 17:00', vote: 0 },
{ time: '17:00 - 18:00', vote: 0 }]

// ______________________________________________________
// Get and sort votes with corresponding time without _id
// ------------------------------------------------------
function computeTime() {

	db.freeTime.find({},{time:1, vote:1,_id:0}, (err, particular) => {
		particular.sort((a,b) => a.time.localeCompare(b.time, undefined, {numeric:true}));
		return getSum(particular)
	})
}


function getSum(periods) {
	let FVotes = []
	let FTime = []
	let PVotes = []
	let PTime = [] 
	let PPVotes = []

	// console.log(FVotes)
	periods.forEach(function(element){
		FTime.push(element.time)
		FVotes.push(element.vote)
	}) 
	// console.log(FVotes)
	for (var i = 0; i < FTime.length - 3; i++) {
		PTime.push(FTime.slice(i, i+4))
		PVotes.push(FVotes.slice(i, i+4))
	}
	
	// for (var i = 0; i < PVotes.length; i++) {       |_______________________
	// 	console.log(PVotes[i].reduce(function (a,b){   | Works thesame as below
	// 		return(a+b)								   |-----------------------
	// }))}
	// console.log(PVotes)

	PPVotes = PVotes.map(x => x.reduce((res, curr) => res += curr, 0));
	var gg = {PPVotes:PTime}
	let finalFreeTime = new Object()
	for (var i = 0; i < PPVotes.length; i++) {
		finalFreeTime[PTime[i]] = PPVotes[i]
	}
	return finalFreeTime;
}

db.freeTime.insert(requiredTime, (err, man) => {
	console.log(man)
})
// export db;
function getAllPeriods() {
	// console.log(db.testPeriods)
	// db.testPeriods.insert(period, (err, period) => {
	// 	if (err) reject(err)
	// 		console.log(period)
	// })
	// console.log('-----------------')
	
	// db.testPeriods.find({}, (err, period) => {
	// 	if (err) reject(err)
	// 		console.log(period)
	// })
	db.testPeriods.find({}, (err, period) => {
		// if (err) reject(err)
		console.log(period)
		// period = period
		return period
	})
}

function verify(email) {
	// var available = db.testPeriods.find({}, (err, periods) => {
	// 	periods.filter(function (period) {
	// 		console.log(period.email)
	// 		period.email = email
	// 	})
	// 	console.log(available)
	// })
	var jar = db.testPeriods.find({email: email}, function (err, found) {
		return found
	})
	
	return jar
}


/**
 * Adds a period. to its particular Periods object
 *
 * @param      {<type>}  periods  The periods
 */

 function addPeriod(periods) {
 	let times = [];
 	periods.forEach((period, key) => {
 		times.push({time: period.time});
 	});
 	// db.freeTime.find({$or: times}, function (err, data) {
 	// 	if (err) throw err;
 	// 	console.log(data);
 	// });
 	db.freeTime.update({$or: times}, {$inc: {vote: 1}}, {multi: true, returnUpdatedDocs: true}, function (err, count, data) {
 		if (err) throw err;
 		console.log(count, data);
 	});
 }

// -------------------
// Home route
// ---------------------

app.get('/', (req, res) => res.send('<h1>Welcome </h1>'))

// ------------------------------------------
// Route to save new Period to database
// ------------------------------------------
app.post(`/save`, function (req, res) {
	console.log('Accessing endpoint: ');
	db.testPeriods.find({email: req.body.periods.email}, function (err, found) {
		if (found.length >= 1) {
			res.send({found:found})
		} else {
			db.testPeriods.insert(req.body.periods, (err, period) => {
				if (err) reject(err)
					addPeriod(period.time)
				res.send({period:period, filename: db.testPeriods.filename})
			});
		}

	})
})

app.get('/result', function (req, res) {
	db.freeTime.find({},{time:1, vote:1,_id:0}, (err, particular) => {
		particular.sort((a,b) => a.time.localeCompare(b.time, undefined, {numeric:true}));
		let answer = getSum(particular)
		// console.log(answer)
		res.send(answer)
	})
})

app.listen(port, '0.0.0.0', ()	=> {
	console.log(`Server started at port ${port}!`);
})