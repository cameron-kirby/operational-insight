'use strict';

const jwtSimple = require('jwt-simple');
const moment = require('moment');
const q = require('q');

const secret = require('../../../config/secret');
const errorHelper = require('../../helper/ErrorHelper');
const Model = require('../../models/Model');

/**
 * Creates and manages login tokens, used when creating utilization verification reminder emails.
 */
class LoginTokenService {
  /**
   * Finds the timestamp when a login token expires.
   *
   * @param {Duration} duration
   *    The duration the timestamp is valid.
   * @returns {Number}
   *    The timestamp when the login token is no longer valid.
   */
  _findExpirationTimestamp(duration) {
    const now = moment();
    now.add(duration.years, 'years');
    now.add(duration.months, 'months');
    now.add(duration.weeks, 'weeks');
    now.add(duration.days, 'days');
    now.add(duration.hours, 'hours');
    now.add(duration.minutes, 'minutes');
    now.add(duration.seconds, 'seconds');
    return now.toDate().getTime();
  }

  /**
   * Encodes a JWT for the given user.
   *
   * @param {String} userId
   *    The id of the user whom the token is for.
   * @param {Number} duration
   *    The duration the token is valid.
   * @returns {String}
   *    The Java Web Token.
   */
  encodeToken(userId, duration) {
    const data = {
      userId,
      expires: this._findExpirationTimestamp(duration),
    };
    return jwtSimple.encode(data, secret());
  }

  /**
   * Decodes a JWT, and returns its contents.
   *
   * @param {String} token
   *    The Java Web Token.
   * @returns {String}
   *    The contents of the token.
   */
  decodeToken(token) {
    return jwtSimple.decode(token, secret());
  }

  /**
   * Creates a login token document for the given user.
   *
   * @param {String} userId
   *    The user whom the token is for.
   * @param {Duration} duration
   *    How long the login token is valid.
   * @returns {String}
   *    The token.
   */
  _createTokenDocument(userId, duration) {
    const expires = moment().add(1, 'day');
    const token = this.encodeToken(userId, duration);
    const tokenDocument = {
      expries: expires,
      token,
      user_id: userId,
    };

    return tokenDocument;
  }

  /**
   * Creates or updates a login token for the specified user.
   * If a token exists for a user, it is updated. Otherwise, a
   * token is created for the user.
   *
   * @param {String} userId
   *    The id of the user whom the token is for.
   * @param {Duration} duration
   *    The duration the token is valid.
   * @returns {q.defer}
   *    The promise to return the token.
   */
  createOrUpdateForUser(userId, duration) {
    const deferred = q.defer();

    this.findByUserId(userId)
      .then((document) => {
        const tokenDocument = this._createTokenDocument(userId, duration);

        let tokenDocumentId = undefined;
        let tokenDocumentRev = undefined;
        if (document !== null) {
          // Create a brand new token document.
          tokenDocumentId = document._id;
          tokenDocumentRev = document._rev;
        }

        // Updating the token document.
        Model.insertDocument(Model.Databases.LOGIN_TOKEN,
          tokenDocument,
          tokenDocumentId,
          tokenDocumentRev)
          .then((resultDocument) => {
            deferred.resolve(resultDocument);
          })
          .catch((error) => {
            const errorObject =
              errorHelper.createAndLogError('LoginTokenService::createOrUpdateForUser', error);
            deferred.reject(errorObject);
          });
      })
      .catch((error) => {
        const errorObject =
          errorHelper.createAndLogError('LoginTokenService::createOrUpdateForUser', error);
        deferred.reject(errorObject);
      });

    return deferred.promise;
  }

  /**
   * Finds the login token for the given user.
   *
   * @param {String} userId
   *    The id of the user.
   * @returns {q.defer}
   *    The promise to return the user's token.
   */
  findByUserId(userId) {
    const deferred = q.defer();

    const query = {
      selector: {
        user_id: userId,
      },
    };

    Model.queryDocuments(Model.Databases.LOGIN_TOKEN, query)
      .then((documents) => {
        if (documents.docs.length > 0) {
          deferred.resolve(documents.docs[0]);
        } else {
          deferred.resolve(null);
        }
      })
      .catch((error) => {
        const errorObject = errorHelper.createAndLogError('LoginTokenService::findByUserId', error);
        deferred.reject(errorObject);
      });

    return deferred.promise;
  }

  /**
   * Verifies that a login token is valid. A token is valid if:
   * -The login token is for the specified user.
   * -The login token is the latest token stored in the login_token database.
   * -The login token has not expired.
   *
   * @param {String} userId
   *    The id of the user whose token is being verified.
   * @param {String} loginToken
   *    The login token being verified.
   * @returns {q.defer}
   *    The promise to return the user Id if the token is valid.
   */
  verifyToken(userId, loginToken) {
    const deferred = q.defer();

    const decodedToken = this.decodeToken(loginToken);
    if (decodedToken.userId !== userId) {
      const errorObject = errorHelper.createAndLogError('LoginTokenService::verifyToken',
       'LoginToken invalid since the token is not for this user.');
      deferred.reject(errorObject);
    } else {
      this.findByUserId(userId)
        .then((doc) => {
          if (doc.token !== loginToken) {
            const errorObject = errorHelper.createAndLogError('LoginTokenService::verifyToken',
             'LoginToken invalid since it is not the latest token.');
            deferred.reject(errorObject);
          }

          const now = new Date();
          if (now.getTime() > doc.expires) {
            const errorObject = errorHelper.createAndLogError('LoginTokenService::verifyToken',
             'LoginToken invalid since the token has expired.');
            deferred.reject(errorObject);
          }

          deferred.resolve(userId);
        })
        .catch((error) => {
          const errorObject = errorHelper.createAndLogError('LoginTokenService::verifyToken',
           error);
          deferred.reject(errorObject);
        });
    }

    return deferred.promise;
  }
}

module.exports = LoginTokenService;
