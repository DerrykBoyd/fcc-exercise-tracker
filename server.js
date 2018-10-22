const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const Users = require('./models/users.js')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI)

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("connected to db " + db.name);
  db.createCollection('fccExerciseTracker');
});

const collection = db.collection('fccExerciseTracker');
console.log(collection.getName)

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//add a new user from the form
app.post('/api/exercise/new-user', function(req, res) {
  console.log(req.body);
  //if user doesn't exist in db, add user
  let newUser = new Users();
  newUser.username = req.body.username;
  collection.insertOne(newUser, (err, r) => {
    if (err) console.log(err.message);
    else console.log('Inserted: ' + r.insertedCount);
  });
  res.redirect('/');
});

//add an exercise to a users profile from the form
app.post('/api/exercise/add', (req, res) => {
  let shortDate = req.body.date;
  if (shortDate == '') {
    let date = new Date().toISOString();
    shortDate = date.slice(0, 10);
  }
  collection.findOneAndUpdate(
    {"username": req.body.userId},
    { $push : { "exercises" : {
      "description" : req.body.description,
      "duration" : req.body.duration,
      "date" : shortDate
      }}},
    (err, r) => {
      if (err) console.log(err.message);
      else console.log(r.value);
    }
  )
  res.redirect('/');
});

//TODO Add get functionality for list of users
app.get('/api/exercise/users', (req, res) => {
  let results = [];
  collection.find({}).stream()
    .on('data', (doc) => results.push(doc))
    .on('end', () => res.send(results));
});


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})