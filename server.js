const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const bodyParser = require("body-parser");

/* Create unique ID */
const IDcreator = require(__dirname + "/createID.js");

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

/* Person Array */

const users = [];

/* Person object */
const newPerson = {
  username : String,
  _id: String
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get("/api/exercise/users",(req,res)=>{
  res.json(users); 
});

app.post("/api/exercise/new-user", (req,res)=>{
const userName = req.body.username;
const newUser = Object.create(newPerson);
newUser.username = userName;
newUser._id = IDcreator.ID(userName);
users.push(newUser);
res.json(newUser);
});

app.post("/api/exercise/log",(req,res)=>{
  // post request for full exercise log
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
