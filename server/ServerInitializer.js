'use strict';

const config = require('config');
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const authenticate = require('./middleware/authenticate');


/**
 * Initializes the Express Application.
 */
class ServerInitializer {
  constructor(router) {
    this._router = router;
  }

  /**
   * Initializes the Express Application.
   * @returns {Express.Application}
   *    The Express application after initialization.
   */
  initialize() {
    const app = express();

    // Enable reverse proxy support in Express. This causes the
    // the "X-Forwarded-Proto" header field to be trusted so its
    // value can be used to determine the protocol. See
    // http://expressjs.com/api#app-settings for more details.
    app.enable('trust proxy');

    // Add a handler to inspect the req.secure flag (see
    // http://expressjs.com/api#req.secure). This allows us
    // to know whether the request was via http or https.
    app.use((req, res, next) => {
      if (req.secure) {
        // request was via https, so do no special handling
        next();
      } else {
        if (config.get('domain.localhost')) {
          // if accessed from localhost, do nothing
          next();
        } else {
          // request was via http, so redirect to https
          res.redirect(`https://${req.headers.host + req.url}`);
        }
      }
    });

    // get all data/stuff of the body (POST) parameters
    // parse application/json
    app.use(bodyParser.json());

    // parse application/vnd.api+json as json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: true }));

    // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
    app.use(methodOverride('X-HTTP-Method-Override'));

    // set the static files location /public/img will be /img for users
    app.use(express.static(`${__dirname}/../public`));

    // enabling CORS
    app.all('/', (req, res, next) => {
      // CORS headers
      res.header('Access-Control-Allow-Origin', '*'); // restrict it to the required domain
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      // Set custom headers for CORS
      res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
      if (req.method === 'OPTIONS') {
        res.status(200).end();
      } else {
        next();
      }
    });

    // Auth Middleware - This will check if the token is valid
    // Only the requests that start with /api/v1/* will be checked for the token.
    // Any URL's that do not follow the below pattern should be avoided unless you
    // are sure that authentication is not needed
    app.all('/rest/v1/*', authenticate);

    // routes ==================================================

    app.use('/', this._router.router);

    return app;
  }
}

module.exports = ServerInitializer;
