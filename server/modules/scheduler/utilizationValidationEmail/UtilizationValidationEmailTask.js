'use strict';

const config = require('config');
const moment = require('moment');
const q = require('q');
const _ = require('underscore');

const errorHelper = require('../../../helper/ErrorHelper');
const Model = require('../../../models/Model');

const LoginTokenService = require('../../loginToken/LoginTokenService');
const loginTokenService = new LoginTokenService();

/**
 * Task to send out the utilization validation email.
 *
 * @param {Object} parameters
 *    The required parameters of this task.
 *    documentId: The id of the scheduled task document.
 *    subject: The subject of the utilization validation emails.
 *    tokenDuration: How long a login token will remain active.
 *    utilizationService: The service responsible, for making calls to the Utilization database.
 *    verifyDuration: How long a utilization is valid, after verification.
 *
 *    The optional parameters of this task.
 *    blackList: An array of user ids, of users who will never receive a utilization reminder email.
 *    whiteList: If present, this is the array of user ids, of the users eligible to receive
 *               a reminder email. Such users still need to have expired utilizations.
 */
class UtilizationValidationEmailTask {
  constructor(parameters) {
    this._parameters = parameters;
  }

  /**
   * Finds the timestamp, at which point a user's utilization is no longer verified.
   *
   * @returns {Number}
   *    The timestamp, at which point a uer's utilization is no longer verified.
   */
  _findExpirationTimestamp() {
    const now = moment();
    now.subtract(this._parameters.verifyDuration.years, 'years');
    now.subtract(this._parameters.verifyDuration.months, 'months');
    now.subtract(this._parameters.verifyDuration.weeks, 'weeks');
    now.subtract(this._parameters.verifyDuration.days, 'days');
    now.subtract(this._parameters.verifyDuration.hours, 'hours');
    now.subtract(this._parameters.verifyDuration.minutes, 'minutes');
    now.subtract(this._parameters.verifyDuration.seconds, 'seconds');
    return now.toDate().getTime();
  }

  /**
   * Finda all of the utilizations that are not verified.
   *
   * @param {Number} expirationTimestamp
   *    The timestamp at which point a utilization is considered invalid.
   *
   * @returns {q.defer}
   *    The promise to return all of the unverified utilizations.
   */
  _findAllUnverifiedUtilizations(expirationTimestamp) {
    const deferred = q.defer();

    this._parameters.utilizationService.findUnverifiedUtilizations(expirationTimestamp)
      .then((documents) => {
        deferred.resolve(documents);
      })
      .catch((error) => {
        const errorObject = errorHelper.createAndLogError(
          'UtilizationValidationEmailTask::findAllUnverifiedUtilizations', error);
        deferred.reject(errorObject);
      });

    return deferred.promise;
  }

  /**
   * Finds the user's whose utilizations are unverified
   *
   * @param {Utilization[]} utilizationDocuments
   *    The array of Utilization documents that are out of date.
   * @returns {q.defer}
   *    The promise to return the list of users, whose utilizations are unverified.
   */
  _findUnverifiedUsers(utilizationDocuments) {
    const deferred = q.defer();

    const userArray = _.map(utilizationDocuments.rows, (utilization) =>
      utilization.value.user_id
    );

    Model.retrieveDocumentsById(Model.Databases.USERS, userArray, false)
      .then((userDocuments) =>
          deferred.resolve(userDocuments)
      )
      .catch((error) => {
        const errorObject =
          errorHelper.createAndLogError('UtilizationValidationEmailTask::findUnverifiedUsers',
           error);
        deferred.reject(errorObject);
      });

    return deferred.promise;
  }


  /**
   * If the white list is present, this method removes users that
   * are not on the white list.
   *
   * @param {User} userDocuments
   *    The array of user documents.
   *
   * @returns {Promise}
   *    The promise to return the list of users after applying the white list filter.
   */
  _applyWhiteListFilter(userDocuments) {
    const deferred = q.defer();

    if (this._parameters.whiteList
      && this._parameters.whiteList.length > 0) {
      const userIds = _.map(userDocuments, (doc) =>
        doc._id
      );

      // Finding the index of all ids needed to be removed.
      const remainingDocuments = [];
      _.each(this._parameters.whiteList, (whiteId) => {
        const index = _.indexOf(userIds, whiteId);
        if (index > -1) {
          remainingDocuments.push(userDocuments[index]);
        }
      });

      deferred.resolve(remainingDocuments);
    } else {
      deferred.resolve(userDocuments);
    }

    return deferred.promise;
  }

  /**
   * Removes the ignored uses from the list of users, who will receive the email.
   * This in-memory reduction is required since views can only filter upon a single field.
   *
   * @param {User} userDocuments
   *    The array of user documents.
   *
   * @returns {q.defer}
   *    The promise to return the list of users less the ignored users.
   */
  _removeIgnoredUsers(userDocuments) {
    const deferred = q.defer();

    if (this._parameters.blackList
      && this._parameters.blackList.length > 0) {
      const removedIndices = [];
      const userIds = _.map(userDocuments, (doc) =>
        doc._id
      );

      // Finding the index of all ids needed to be removed.
      _.each(this._parameters.blackList, (ignoreId) => {
        const index = _.indexOf(userIds, ignoreId);
        if (index > -1) {
          removedIndices.push(index);
        }
      });

      // Sorting the indices so we can remove in reverse order.
      removedIndices.sort((a, b) =>
        b - a
      );

      _.each(removedIndices, (index) =>
        userDocuments.splice(index, 1)
      );
    }

    deferred.resolve(userDocuments);

    return deferred.promise;
  }


  /**
   * Creates the template parameters for all of the users.
   *
   * @returns {q.defer}
   *    The promise to return the array of template parameters.
   */
  _createTemplateParameters(usersDocuments) {
    const deferred = q.defer();

    const loginTokenPromiseArray = [];
    _.each(usersDocuments, (userDoc) =>
      loginTokenPromiseArray.push(
        loginTokenService.createOrUpdateForUser(userDoc._id, this._parameters.tokenDuration))
    );

    q.all(loginTokenPromiseArray)
      .then((loginTokenDocs) => {
        const templateParametersArray = [];
        _.each(usersDocuments, (userDoc) => {
          for (let iLoginDoc = 0; iLoginDoc < loginTokenDocs.length; ++iLoginDoc) {
            if (loginTokenDocs[iLoginDoc].user_id === userDoc._id) {
              const templateParameters = {
                domain: config.domain.base_url,
                firstName: userDoc.fname,
                loginToken: loginTokenDocs[iLoginDoc].token,
                user_id: userDoc._id,
              };

              templateParametersArray.push(templateParameters);
              break;
            }
          }
        });

        deferred.resolve(templateParametersArray);
      })
      .catch((error) => {
        const errorObject =
          errorHelper.createAndLogError('UtilizationValidationEmailTask::createLoginTokens', error);
        deferred.reject(errorObject);
      });

    return deferred.promise;
  }

  /**
   * Sends the utilizationValidation reminder email to those users,
   * whose utilization's are out of date.
   *
   * @param {User} templateParameters
   *    The array of parameters to be sent to each user.
   * @returns {q.defer}
   *    The promises to send the emails.
   */
  _sendEmailToUsers(templateParameters) {
    const deferred = q.defer();

    this._parameters.emailService.readTemplate('utilizationVerificationReminder.html')
      .then((template) => {
        const emailPromiseArray = [];
        _.each(templateParameters, (templateParams) => {
          emailPromiseArray.push(this._parameters.emailService.sendEmail(templateParams.user_id,
            template, this._parameters.subject, templateParams));
        });

        q.all(emailPromiseArray)
          .then(() =>
            deferred.resolve()
          )
          .catch((error) => {
            const errorObject =
              errorHelper.createAndLogError('UtilizationValidationEmailTask::sendEmailToUsers',
                error);
            deferred.reject(errorObject);
          });
      })
      .catch((error) => {
        const errorObject =
          errorHelper.createAndLogError('UtilizationValidationEmailTask::sendEmailToUsers', error);
        deferred.reject(errorObject);
      });

    return deferred.promise;
  }


  /**
   * Concludes the promise chain for this task. This is necessary
   * to avoid 'this hell'.
   *
   * @param {q.defer} promise
   *    The promise to send out emails to those users who need to verify their utilizations.
   */
  _finished(promise) {
    promise.resolve(this._parameters.documentId);
  }

  /**
   * Concludes the promise chain for this task, in the case of an error. This is necessary
   * to avoid 'this hell'.
   *
   * @param {q.defer} promise
   *    The promise to send out emails to those users who need to verify their utilizations.
   */
  _error(promise, error) {
    promise.reject(error);
  }

  /**
   * Scans all of the utilizations to determine, which are out of date.
   * Then, emails are sent to those individuals who need to verify their utilizations.
   */
  start() {
    const deferred = q.defer();

    const expirationTimestamp = this._findExpirationTimestamp();
    const errorCall = this._error.bind(this, deferred);

    this._findAllUnverifiedUtilizations(expirationTimestamp)
      .then(this._findUnverifiedUsers.bind(this))
      .then(this._applyWhiteListFilter.bind(this))
      .then(this._removeIgnoredUsers.bind(this))
      .then(this._createTemplateParameters.bind(this))
      .then(this._sendEmailToUsers.bind(this))
      .then(this._finished.bind(this, deferred))
      .catch((error) => {
        const errorObject = errorHelper.createAndLogError('UtilizationValidationEmailTask::start',
         error);
        errorCall(errorObject);
      });

    return deferred.promise;
  }
}

module.exports = UtilizationValidationEmailTask;
