const express = require('express');
const mongo = require("mongodb");
const mongoose = require("mongoose");
const app = express();
const cors = require('cors');
const moment = require("moment");
require('dotenv').config();


const bodyParser = require("body-parser");

/* Create unique ID */
const IDcreator = require(__dirname + "/createID.js");

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

/* Database connections */
mongoose.connect(process.env.MONGO_URI,{useUnifiedTopology:true, useNewUrlParser:true});
const connection = mongoose.connection;
connection.on("error",console.log.bind(console,"connection error:"));

connection.once("open",()=>{
console.log("MongoDB database connection established successfully");
});

/* Schema */
const exerciseData = new mongoose.Schema({
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: {
    type: Date,
    default: Date.now()  
  }
 
});

const userSchema = new mongoose.Schema({
  username : {type: String, required: true},
  _id: {type: String, required: true},
  log:[exerciseData]
});

/* Model */
const User = mongoose.model("User", userSchema);


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Show all users with exercise infos
app.get("/api/exercise/users",(req,res)=>{
  User.find({},(err,results)=>{
    res.json(results);
  });
});

app.post("/api/exercise/new-user", (req,res)=>{
const userName = req.body.username;
const userID =  IDcreator.ID(userName);

User.findOne({username:userName},(err,result)=>{
  if(err){
    console.log(err);
  }else{
    if(!result){
      // create a new user
      const user = new User({
        username: userName,
        _id:userID
      });
      user.save();
      res.json({username:userName, _id:userID});
    }else{
      // show a message "Username already taken"
      res.json("Username already taken");
    }
  }
});

});

app.post("/api/exercise/add",(req,res)=>{
  // add exercise info
let date = req.body.date ? moment(req.body.date) : moment();

  const userID = req.body.userId;
  const userDescription = req.body.description;
  const userDuration = parseInt(req.body.duration);
  const userDate = req.body.date;

  User.findOne({_id:userID},(err,result)=>{
    if(err) throw err;
    //check the user is found or not 
    if(!result){
      res.json("The user you were looking for was not found, check your user ID");
    }else{
      result.log.push({
        description : userDescription,
        duration : userDuration,
        date : userDate || Date.now()
      });
      result.save();
      res.json(result);

      };
    }
  );
});

app.get("/api/exercise/log",(req,res)=>{
  // post request for full exercise log
  const userId = req.query.userId;
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit; 

  User.findOne({_id:userId},(err,foundUser)=>{
    if(err) throw err;
    // Exercise Count
    const count = foundUser.log.length;
    //Check user is exist or not
    if(!foundUser){
      res.json("The user you were looking for was not found, check your user ID");
    }else{
      // if time interval is blank
      if(!from && !to){
        //if limit is blank or not
        if(!limit){
          res.json({
            "_id":userId,
            "username":foundUser.username,
            "count":count,
            "log": foundUser.log.map(e => e = {
              description: e.description,
              duration: e.duration,
              date: e.date
            })
          });
        }else{
          res.json({
            "_id":userId,
            "username":foundUser.username,
            "count":count,
            "log": foundUser.log.map(e => e = {
              description: e.description,
              duration: e.duration,
              date: e.date
            }).slice(limit)
          });
        }
      // time interval is not blank  
      }else{

        //if limit is blank or not
        if(!limit){
          res.json({
            "_id":userId,
            "username":foundUser.username,
            "from":from,
          "to":to,
            "count":count,
            "log": foundUser.log.map(e => e = {
              description: e.description,
              duration: e.duration,
              date: e.date
            })
          });
        }else{
          res.json({
            "_id":userId,
            "username":foundUser.username,
            "from":from,
          "to":to,
            "count":count,
            "log": foundUser.log.map(e => e = {
              description: e.description,
              duration: e.duration,
              date: e.date
            }).slice(limit)
          });
        }
      }
    }
  });
  
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

/*
{_id:ID, username: USERNAME, from:DATE, to:DATE, count:NUMBERofExercise, log:[EXERCISE LOG]}

Not: Try to split exercise and user schema

*/