const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  console.log('req.cookies------------>>>', req.cookies);

  var newSession = {};
  var cookie = req.headers.cookie;
  if (cookie === undefined) {
    // models.Sessions.create().then(hash => {
    //   console.log('HASH', JSON.stringify(hash));
    //   newSession.hash = hash;
    //   req.session = newSession;
    //   res.cookies.shortlyid = hash;
    //   return next();
    // });
    // may have to change line 9 (currently return a Promise)
    newSession.hash = models.Sessions.create();
    req.session = newSession;
    res.cookies.shortlyid = models.Sessions.create();

  }
  return next();
  console.log('res.cookies--->>>', res.cookies);

  // check to see if there are cookies on the request
  // if no cookies, initialize a new session
  // req.session === typeof object; key (hash)
  //  create a new hash

  // if initialized new session, sets cookie on the response
};

//  /**
//    * Gets one record in the table matching specified conditions, and attaches user
//    * information if the userId is present on the session object.
//    * @param {Object} options - An object where the keys are the column names and the values
//    * are the values to be matched.
//    * @returns {Promise<Object>} A promise that is fulfilled with the session object
//    * or rejected with the error that occured. Note that even if multiple session records
//    * match the options, the promise will only be fulfilled with one.
//    */
//   get(options) {
//     return super.get.call(this, options)
//       .then(session => {
//         if (!session || !session.userId) {
//           return session;
//         }
//         return Users.get({ id: session.userId }).then(user => {
//           session.user = user;
//           return session;
//         });
//       });
//   }


/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

