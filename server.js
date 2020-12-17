const express = require('express');
const mongo = require("mongodb");
const mongoose = require("mongoose");
const app = express();
const cors = require('cors');
require('dotenv').config();

const bodyParser = require("body-parser");
const { Int32 } = require('mongodb');

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
const userSchema = new mongoose.Schema({
  username : String,
  _id: String
});

const exerciseDataSchema = new mongoose.Schema({
  userId: String,
  description: String,
  duration: Number,
  date: Date
});

/* Model */
const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", exerciseDataSchema);


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
      res.json(user);
    }else{
      // show a message "Username already taken"
      res.json("Username already taken");
    }
  }
});

});

app.post("/api/exercise/log",(req,res)=>{
  // post request for full exercise log
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
