const express = require('express');
const mongo = require("mongodb");
const mongoose = require("mongoose");
const app = express();
const cors = require('cors');
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
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  username : {type: String, required: true},
  _id: {type: String, required: true},
  exercise:[exerciseData]
});

/* Model */
const User = mongoose.model("User", userSchema);


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get("/api/exercise/users",(req,res)=>{
  res.json(users); 
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
  const userID = req.body.userId;
  const userDescription = req.body.description;
  const userDuration = req.body.duration;
  const userDate = req.body.date;

  User.findOne({_id:userID},(err,result)=>{
    if(err) throw err;
    //check the user is found or not 
    if(!result){
      res.json("The user you were looking for was not found, check your user ID");
    }else{
      //Add the exercise information
      result.exercise.push({
        description : userDescription,
        duration : userDuration,
        exerciseDate : userDate
      });
      result.save();
      res.json(result);

    }
  });
});

app.get("/api/exercise/log",(req,res)=>{
  // post request for full exercise log
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
