const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const LocalStorage = require('node-localstorage').LocalStorage;
const config = require('../config.js');
const jwt = require('jsonwebtoken');
localStorage = new LocalStorage('./scratch');
const MongoClient = require('mongodb').MongoClient;

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
const User = require('./User');
var ObjectId = require('mongodb').ObjectID;

let db;
const mongourl = 'mongodb://127.0.0.1:27017/'
const col_name = 'news';
const bcrypt = require('bcryptjs');
const moment = require('moment');


// RETURNS ALL THE USERS IN THE DATABASE
router.get('/', function (req, res) {
    User.find({}, function (err, users) {
        if (err) return res.status(500).send("There was a problem finding the users.");
        res.status(200).send(users);
    });
});

// Find News by id
router.post('/find_by_id',(req,res) => {
    let id = req.body.id;
    db.collection(col_name)
      .find({_id:ObjectId(req.body.id)})
      .toArray((err,result) => {
          if(err) throw err;
          res.send(result)
          console.log(result)
      })
});



// GETS A SINGLE USER FROM THE DATABASE
    router.get('/profile', function (req, res) {
        var token = localStorage.getItem('authtoken')
        console.log("token>>>",token)
        if (!token) {
            res.redirect('/')
        }
        jwt.verify(token, config.secret, function(err, decoded) {
        if (err) {
            res.redirect('/')
        };
            User.findById(decoded.id, { password: 0 }, function (err, user) {
                if (err) {res.redirect('/')}
                if (!user) {res.redirect('/')}
                db.collection(col_name).find().toArray((err,result) => {
                    if(err) throw err;
                    res.render('admin.ejs',{data:result, user})
                })
            });
        });
    });

    router.get('/news', function (req, res) {
        
                db.collection(col_name).find({}, {"sort" : [['published_date', 'desc']]}).toArray((err,result) => {
                    res.send(result)
            //        res.render('profile.ejs',{data:result, user, moment:moment})
                })
            
       
    });

    // GETS A SINGLE USER FROM THE DATABASE
    router.get('/newsList', function (req, res) {
        var token = localStorage.getItem('authtoken')
        console.log("token>>>",token)
        if (!token) {
            res.redirect('/')
        }
        jwt.verify(token, config.secret, function(err, decoded) {
        if (err) {
            res.redirect('/')
        };
            User.findById(decoded.id, { password: 0 }, function (err, user) {
                if (err) {res.redirect('/')}
                if (!user) {res.redirect('/')}
                db.collection(col_name).find().toArray((err,result) => {
                    if(err) throw err;
                    res.render('profile.ejs',{data:result, user, moment:moment})
                })
            });
        });
    });


    router.get('/usersList', function (req, res) { 4
        var token = localStorage.getItem('authtoken')
        console.log("token>>>",token)
        if (!token) {
            res.redirect('/')
        }
        jwt.verify(token, config.secret, function(err, decoded) {
        if (err) {
            res.redirect('/')
        };
            User.findById(decoded.id, { password: 0 }, function (err, user) {
                if (err) {res.redirect('/')}
                if (!user) {res.redirect('/')}
                db.collection('eduusers').find().toArray((err,result) => {
                    if(err) throw err;
                    res.render('users.ejs',{data:result, user, moment:moment})
                })
            });
        });
    });

// Find Bug by title
router.post('/delete_by_id',(req,res) => {
    let title = req.body.id;
    db.collection(col_name)
      .findOneAndDelete({"_id":ObjectId(req.body.id)}, (err,result) => {
          if(err) throw err;
          res.send(result)
          console.log(result)
      })
});

// Post data from ui
router.post('/addData', (req,res) => {
    db.collection(col_name)
        // In Req.body we will recive the data
        // from form.
        .insert(req.body, (err,result) => {
            if(err) throw err;
            console.log('data.inserted');
        })
    res.redirect('/users/profile');
})

// Post data from ui
router.post('/addNews', (req,res) => {
    db.collection(col_name)
        // In Req.body we will recive the data
        // from form.
        .insert(req.body, (err,result) => {
            if(err) throw err;
            console.log('data.inserted');
        })
    res.redirect('/users/newsList');
})

// Post data from ui
router.post('/query', (req,res) => {
    console.log(req)
    db.collection('queries')
        // In Req.body we will recive the data
        // from form.
        .insert(req.body, (err,result) => {
            if(err) res.send({status: 500});
            res.send({status:200});
        })
    console.log(req.body)
})


// Update User
router.put('/update_news',(req,res)=>{
    db.collection(col_name)
        .findOneAndUpdate({"_id":ObjectId(req.body._id)},{
            $set:{
                title:req.body.title,
                description:req.body.description,
                url:req.body.url,
                url_to_image:req.body.url_to_image,
                published_date:req.body.published_date
            }
        },{
            upsert:false
        },(err,result) => {
            if(err) return res.send(err);
            res.send(result)
        })
})

router.post('/addUser', (req, res) => {
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    
    User.create({
      name : req.body.name,
      email : req.body.email,
      password : hashedPassword,
      role : req.body.role 
    },
    function (err, user) {
      if (err) return res.status(500).send("There was a problem registering the user.")
      // create a token
      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });
      const string = encodeURIComponent('Success Fully Register Please Login');
      res.redirect('/users/usersList');
    }); 
})

// Opening Add User page
router.get('/userAdd',(req,res) => {
    var token = localStorage.getItem('authtoken')
        console.log("token>>>",token)
        if (!token) {
            res.redirect('/')
        }
        jwt.verify(token, config.secret, function(err, decoded) {
        if (err) {
            res.redirect('/')
        };
            User.findById(decoded.id, { password: 0 }, function (err, user) {
                if (err) {res.redirect('/')}
                if (!user) {res.redirect('/')}
                db.collection(col_name).find().toArray((err,result) => {
                    if(err) throw err;
                    res.render('user.ejs',{data:result, user})
                })
            });
        });
})


router.get('/signup',  (req, res) => {
    res.render('signup.ejs')
 });

 router.get('/logout', (req,res) => {
     localStorage.removeItem('authtoken');
     res.redirect('/');
 })



 MongoClient.connect(mongourl,(err,client) => {
    if(err) throw err;
    db = client.db('admin')
})

module.exports = router;