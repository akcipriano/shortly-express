const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');
const db = require('./db');
// const port = 4568;

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));


// app.listen(port, () => {
//   console.log(`Shortly is listening on ${port}`);
// });

app.get('/',
  (req, res) => {
    res.render('index');
  });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.get('/login',
  (req, res) => {
    res.render('login');
  });

app.get('/signup',
  (req, res) => {
    res.render('signup');
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

app.post('/signup',
  (req, res, next) => {
    var newUsername = req.body.username;
    var newPassword = req.body.password;
    var queryStr = `SELECT username FROM users WHERE username = "${newUsername}"`;
    var queryResults = [];

    db.query(queryStr, queryResults, (err, results) => {
      if (err) {
        throw (err);
      }

      if (results.length === 0) {
        return models.Users.create({ username: newUsername, password: newPassword })
          .then(newUser => {
            //THIS COULD BE SOMETHING ELSE
            res.set('location', '/');
            res.render('index');
          })
          .catch(err => {
            //STATUS CODE COULD BE CHANGED
            res.status(400).send(err);
          });
      } else {
        res.set('location', '/signup');
        res.render('signup');

      }
    });
  });

app.post('/login',
  (req, res, next) => {
    var enteredUsername = req.body.username;
    var enteredPassword = req.body.password;
    var queryStr = `SELECT salt, password FROM users WHERE username = "${enteredUsername}"`;

    db.query(queryStr, (err, results) => {
      if (err) {
        throw (err);
      }
      if (results.length === 0) {
        res.set('location', '/login');
        res.render('login');
      } else {
        var salt = results[0].salt;
        var hashedPassword = results[0].password;
        if (utils.compareHash(enteredPassword, hashedPassword, salt)) {
          res.set('location', '/');
          res.render('index');
        } else {
          res.set('location', '/login');
          res.render('login');
        }
      }

    });
    // declare query strin
    // query db - select (salt, password) from users where username = enteredUsername
    // invoke compuare hash (enteredPassword, password from users, salt from users)
    // if (true) {
    //res.set('location', '/')
    // res.redner('/');
    // else
    // res.render('/login')
  }

);

/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
