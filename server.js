// MODULES =================================================
var express        = require('express');
var app            = express();
var mongoose       = require('mongoose');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var path           = require('path');
var cookieParser   = require('cookie-parser');
var passport       = require('passport');
var jwt            = require('express-jwt');
var multer         = require('multer');
var request        = require('request');
var fs             = require('fs');
var auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});

// COLLECTIONS =================================================
var User     = require('./app/models/user');

// DB SETUP ======================================================
var db = require('./config/db');
mongoose.connect(db.url); // connect to our mongoDB data
var port = process.env.PORT || 9080; // set port

require('./config/passport');

// Set up request body parsers
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for
app.use(function(req, res, next) { //allow cross origin requests
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "http://localhost");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

// Set up multer for file uploads
var storage = multer.diskStorage({ // multer's disk storage settings
    destination: function (req, file, cb) {
        cb(null, './public/img/pictures')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
var upload = multer({ // multer settings
    storage: storage
}).single('file');

// ROUTES ==============================================================================================
var router = express.Router();

// User ROUTES
router.route('/register')
  .post(function(req, res) {
      var user = new User();
      user.name = req.body.name;
      user.email = req.body.email;
      user.setPassword(req.body.password);
      user.save(function(err) {
        var token;
        token = user.generateJwt();
        res.status(200);
        res.json({
          "token" : token
        });
      });
  });

router.route('/login')
  .post(function(req, res) {
    passport.authenticate('local', function(err, user, info){
      console.log(user.email);
      var token;
      // If Passport throws/catches an error
      if (err) {
        res.status(404).json(err);
        return;
      }
      // If a user is found
      if(user){
        token = user.generateJwt();
        res.status(200);
        res.json({
          "token" : token
        });
      } else {
        // If user is not found
        res.status(401).json(info);
      }
    })(req, res);
  });

  router.route('/profile')
    .get(auth, function(req, res) {
       if (!req.payload._id) {
         res.status(401).json({
           "message" : "UnauthorizedError: private profile"
         });
       } else {
         User
           .findById(req.payload._id)
           .exec(function(err, user) {
             res.status(200).json(user);
           });
       }
});


// REGISTER ROUTES =========================================================
// all routes will be prefixed with /api
app.use(passport.initialize());
app.use('/api', router);

router.get('*', function(req, res) {
    res.sendfile('./public/index.html', { root: __dirname }); // load our public/index.html file
});

app.use(function(req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

function run($rootScope, $location, authentication) {
    $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
      if ($location.path() === '/profile' && !authentication.isLoggedIn()) {
        $location.path('/');
      }
    });
  }

// start app
app.listen(port);

// shoutout to the user
console.log('Circle of Care is live on port ' + port);

// expose app
exports = module.exports = app;
