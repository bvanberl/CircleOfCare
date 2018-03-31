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
  providerProperty: 'payload'
});

// COLLECTIONS =================================================
var Provider     = require('./app/models/provider');

// DB SETUP ======================================================
var db = require('./config/db');
mongoose.connect(db.url); // connect to our mongoDB data
var port = process.env.PORT || 8081; // set port

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

// Provider ROUTES
// get all the providers (accessed at GET http://localhost:9080/api/providers)
router.route('/providers')
.get(function(req, res) {
    Provider.find(function(err, providers) {
        if (err)
            res.send(err);
        res.json(providers);
    });
});

router.route('/register')
  .post(function(req, res) {
      var provider = new Provider();
      provider._id = new mongoose.Types.ObjectId();
      provider.name = req.body.name;
      provider.email = req.body.email;
      provider.profession = req.body.profession;
      provider.setPassword(req.body.password);
      console.log(provider);
      provider.save(function(err) {
        console.log(err);
        var token;
        token = provider.generateJwt();
        res.status(200);
        res.json({
          "token" : token
        });
      });
  });

router.route('/login')
  .post(function(req, res) {
    passport.authenticate('local', function(err, provider, info){
      console.log(provider.email);
      var token;
      // If Passport throws/catches an error
      if (err) {
        res.status(404).json(err);
        return;
      }
      // If a provider is found
      if(provider){
        token = provider.generateJwt();
        res.status(200);
        res.json({
          "token" : token
        });
      } else {
        // If provider is not found
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
         console.log(req.payload);
         Provider
           .findById(req.payload._id)
           .exec(function(err, provider) {
             res.status(200).json(provider);
           });
       }
});

// textMessage ROUTES
router.route('/text-messages')
  // create an textMessage (accessed at POST http://localhost:8080/api/textMessages)
  .post(function(req, res) {
      var textMessage = new TextMessage();
      textMessage._id = new mongoose.Types.ObjectId();
      textMessage.message = req.body.message;
      textMessage.datetime = req.body.datetime;
      textMessage.postedBy = req.body.postedBy;
      textMessage.save(function(err) {
          if (err)
              res.send(err);
          res.json({ message: 'TextMessage created!' });
      });
  })
  // get all the textMessages (accessed at GET http://localhost:8080/api/textMessages)
  .get(function(req, res) {
      TextMessage.find(function(err, textMessages) {
          if (err)
              res.send(err);
          res.json(textMessages);
      });
  });
router.route('/text-messages/:text-message_id') // Get a textMessage by his/her ID
  .get(function(req, res) {
      TextMessage.findById(req.params.textMessage_id, function(err, textMessage) {
          if (err)
              res.send(err);
          res.json(textMessage);
      });
  })
  .put(function(req, res) {
      TextMessage.findById(req.params.textMessage_id, function(err, textMessage) {
          if (err)
              res.send(err);
          textMessage.message = req.body.message;
          textMessage.datetime = req.body.datetime;
          textMessage.postedBy = req.body.postedBy;
          textMessage.save(function(err) {
              if (err)
                  res.send(err);
              res.json({ message: 'TextMessage updated!' });
          });
      });
  })
  .delete(function(req, res) {
      TextMessage.remove({
          _id: req.params.textMessage_id
      }, function(err, textMessage) {
          if (err)
              res.send(err);
          res.json({ message: 'TextMessage successfully deleted' });
      });
  });


  // ImageMessage ROUTES
  router.route('/image-messages')
    // create an imageMessage (accessed at POST http://localhost:8080/api/image-messages)
    .post(function(req, res) {
        var imageMessage = new ImageMessage();      // create a new instance of the imageMessage model
        imageMessage._id = new mongoose.Types.ObjectId();
        imageMessage.filename = req.body.filename;
        imageMessage.datetime = req.body.datetime;
        imageMessage.postedBy = req.body.postedBy;
        imageMessage.save(function(err) {
            if (err)
                res.send(err);
            res.json({ message: 'ImageMessage created!' });
        });
    })
    // get all the imageMessages (accessed at GET http://localhost:8080/api/image-messages)
    .get(function(req, res) {
        ImageMessage.find(function(err, imageMessages) {
            if (err)
                res.send(err);
            res.json(imageMessages);
        });
    });
  router.route('/image-messages/:image-message_id') // Get a textMessage by his/her ID
    .get(function(req, res) {
        ImageMessage.findById(req.params.imageMessage_id, function(err, imageMessage) {
            if (err)
                res.send(err);
            res.json(imageMessage);
        });
    })
    .put(function(req, res) {
        ImageMessage.findById(req.params.imageMessage_id, function(err, imageMessage) {
            if (err)
                res.send(err);
            imageMessage.filename = req.body.filename;
            imageMessage.datetime = req.body.datetime;
            imageMessage.postedBy = req.body.postedBy;
            imageMessage.save(function(err) {
                if (err)
                    res.send(err);
                res.json({ message: 'ImageMessage updated!' });
            });
        });
    })
    .delete(function(req, res) {
        ImageMessage.remove({
            _id: req.params.imageMessage_id
        }, function(err, imageMessage) {
            if (err)
                res.send(err);
            res.json({ message: 'ImageMessage successfully deleted' });
        });
    });


// Patient ROUTES
router.route('/patients')
// create a patient (accessed at POST http://localhost:8080/api/patients)
.post(function(req, res) {
    var patient = new Patient();      // create a new instance of the patient model
    patient.name = req.body.name;
    patient.save(function(err) {
        if (err)
            res.send(err);
        res.json({ message: 'Patient created!' });
    });
})
// get all the patients (accessed at GET http://localhost:8080/api/patients)
.get(function(req, res) {
    Patient.find(function(err, patients) {
        if (err)
            res.send(err);
        res.json(patients);
    });
});
router.route('/patients/:patient_id') // Get a textMessage by his/her ID
.get(function(req, res) {
    Patient.findById(req.params.patient_id, function(err, patient) {
        if (err)
            res.send(err);
        res.json(patient);
    });
})
.put(function(req, res) {
    Patient.findById(req.params.patient_id, function(err, patient) {
        if (err)
            res.send(err);
        patient.name = req.body.name;
        patient.save(function(err) {
            if (err)
                res.send(err);
            res.json({ message: 'Patient updated!' });
        });
    });
})
.delete(function(req, res) {
    Patient.remove({
        _id: req.params.patient_id
    }, function(err, patient) {
        if (err)
            res.send(err);
        res.json({ message: 'Patient successfully deleted' });
    });
});

// Conversation ROUTES
router.route('/conversations')
  // create a conversation (accessed at POST http://localhost:8080/api/conversations)
  .post(function(req, res) {
      var conversation = new Conversation();      // create a new instance of the conversation model
      /*conversation.patient = Patient.findOne({_id: req.body.patientId})
        .exec(function(err, patient) {
          if(err)
            res.send(err);
          return patient._id;
        });*/
      conversation._id = new mongoose.Types.ObjectId();
      conversation.patient = req.body.patientId;
      conversation.providers.push(req.body.providerId);
      conversation.save(function(err) {
          if (err)
              res.send(err);
          res.json({ message: 'Conversation created!' });
      });
  })
  // get all the conversations (accessed at GET http://localhost:8080/api/conversations)
  .get(function(req, res) {
      Conversation.find(function(err, conversations) {
          if (err)
              res.send(err);
          res.json(conversations);
      });
  });
router.route('/conversations/:conversation_id') // Get a textMessage by his/her ID
  .get(function(req, res) {
      Conversation.findById(req.params.conversation_id, function(err, conversation) {
          if (err)
              res.send(err);
          res.json(conversation);
      });
  })
  .put(function(req, res) {
      Conversation.findById(req.params.conversation_id, function(err, conversation) {
          if (err)
              res.send(err);
          conversation.patient = req.body.patiendId;
          conversation.providers = req.body.providers;
          conversation.messages = req.body.messages;
          conversation.save(function(err) {
              if (err)
                  res.send(err);
              res.json({ message: 'Conversation updated!' });
          });
      });
  })
  .delete(function(req, res) {
      Conversation.remove({
          _id: req.params.conversation_id
      }, function(err, conversation) {
          if (err)
              res.send(err);
          res.json({ message: 'Conversation successfully deleted' });
      });
  });




// REGISTER THE ROUTES =========================================================
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

// shoutout to the provider
console.log('Circle of Care is live on port ' + port);

// expose app
exports = module.exports = app;
