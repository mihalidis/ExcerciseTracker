const express = require('express');
const app = express();
const mongo = require('mongodb');
const mongoose = require('mongoose');
const moment = require('moment');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

/* Database Connection */
mongoose.connect(process.env['Mongo_URI'], {useUnifiedTopology: true, useNewUrlParser: true});
const connection = mongoose.connection;
connection.on("error", console.log.bind(console, "connection error:"));

connection.once("open", () => {
	console.log("Mongodb database connection established successfully");
});

/* Schema */
const excersizeSchema = new mongoose.Schema({
	description: {type: String, required: true},
	duration: {type: Number, required: true},
	date: {type: String}
});

const userSchema = new mongoose.Schema({
	username: {type: String, required: true},
	log: [excersizeSchema]
});

/* Model */
const User = mongoose.model("User", userSchema);

/* Create new user */
app.post('/api/users', (req, res)=>{
	const userName = req.body.username;

	User.findOne({username: userName}, (err, result) => {
		if (err) throw err;
		if(!result) {
			const user = new User({
				username: userName
			});
			user.save();
			res.json(user);
		} else {
			// Message for user is already saved
			res.json("Username already taken");
		}
	});
});

/* create user log data */
app.post('/api/users/:_id/exercises', (req, res)=>{
	let date = req.body.date ? moment(req.body.date).format("ddd MMM DD YYYY") : moment().format("ddd MMM DD YYYY");
	//let date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toISOString().substring(0,10);;

	const user_id = req.params._id;
	const user_desc = req.body.description;
	const user_dura = parseInt(req.body.duration);

	User.findOne({_id: user_id}, (err,result)=>{
		if (err) throw err;
		if(!result) {
			res.json("The user you were looking for was not found, check your user ID");
		} else {
			result.log.push({
				description: user_desc,
				duration: user_dura,
				date: date,
			});
			result.save();
			res.json(
				{
					username: result.username,
					description: user_desc,
					duration: user_dura,
					date: date,
					_id: result._id
				}
			);
		}
	});

});

/* Retrive user log */
app.get('/api/users/:_id/logs', (req,res)=>{

	const user_id = req.params._id;

	const from_date = req.query.from;
	const to_date = req.query.to;
	const limit = req.query.limit;

	User.findOne({_id: user_id}, (err,result)=>{
		if(!result) {
			res.json("The user you were looking for was not found, check your user ID");
		} else {
			if(limit) {
				//result.log = result.log.slice(0, limit);
				result.log = result.log.splice(limit,result.log.length);
			}

			// from / to date
			if(from_date || to_date) {
				let start_date = from_date ? new Date(from_date) : new Date(0);
				let end_date = to_date ? new Date(to_date) : new Date();

				result.log = result.log.filter((item) => {
					let exerciseDate = new Date(item.date);

					return exerciseDate.getTime() >= start_date.getTime() && exerciseDate.getTime() <= end_date.getTime();
				});
			}

			res.json({
				username: result.username,
				count: result.log.length,
				log: result.log
			});
		};
	});
});

// List all users
app.get('/api/users', (req, res) => {
	User.find({}, (err,users)=>{
		if (err) throw err;
		res.json(users);
	});
});

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/views/index.html')
});

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log('Your app is listening on port ' + listener.address().port)
})
