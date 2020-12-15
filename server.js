const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

/* Create unique ID */
const IDcreator = require(__dirname + "/createID.js");

app.use(cors());

app.use(express.static('public'));

/* Person object */
const newPerson = {
  username : String,
  _id: String
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/exercise/new-user", (req,res)=>{


  
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
