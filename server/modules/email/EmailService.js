'use strict';

const ejs = require('ejs');
const fs = require('fs');
const q = require('q');
const request = require('request');

const config = require('config');
const errorHelper = require('../../helper/ErrorHelper');

/**
 * Sends out emails to the user's of Operational Insight.
 */
class EmailService {
  /**
   * Reads an email template from the filesystem.
   *
   * @param {String} path
   *    The path to the email template, relative from /assets/emailTemplates.
   * @returns {q.defer}
   *    The promise to return the template.
   */
  readTemplate(path) {
    const deferred = q.defer();

    fs.readFile(`server/assets/emailTemplates/${path}`, 'utf-8', (error, data) => {
      if (error) {
        const errorObject = errorHelper.createAndLogError('EmailService::readTemplate', error);
        deferred.reject(errorObject);
      } else {
        let dataPtr = data;
        dataPtr = dataPtr.split('\n').join('');
        dataPtr = dataPtr.split('\r').join('');
        dataPtr = dataPtr.split('\t').join('');
        deferred.resolve(dataPtr);
      }
    });

    return deferred.promise;
  }

  /**
   * Sends an email to the specified recipient. This method takes the template
   * html and applies the body arguments to it, in order to flesh out the template.
   * Then the email is sent via teh BlueMail service.
   *
   * @param {String} recipient
   *    The email of the person receiving the email.
   * @param {String} template
   *    The HTML template for the body of the email.
   * @param {String} subject
   *    The subject of the email.
   * @param {Object} bodyKeys
   *    The contents of the body of the email. These are the values for the keys in
   *    the template.
   */
  sendEmail(recipient, template, subject, bodyKeys) {
    const deferred = q.defer();

    const blueMailUsername = config.get('blueMail.username');
    const blueMailPassword = config.get('blueMail.password');
    let authenticationString = [
      blueMailUsername,
      blueMailPassword,
    ].join(':');


    authenticationString = `Basic ${new Buffer(authenticationString).toString('base64')}`;
    let popuplatedTemplate = '';
    try {
      popuplatedTemplate = ejs.render(template, bodyKeys);
    } catch (error) {
      const errorObject = errorHelper.createAndLogError('EmailService::sendEmail', error);
      deferred.reject(errorObject);
    }

    const data = {
      contact: 'Operational Insight <operational_insight@us.ibm.com>',
      message: popuplatedTemplate,
      recipients: [{
        recipient,
      }],
      subject,
    };

    const body = JSON.stringify(data);
    const blueMailUrl = config.get('blueMail.emailUrl');
    request.post({
      body,
      headers: {
        Authorization: authenticationString,
        'Content-Type': 'application/json',
      },
      url: blueMailUrl,
    },
    (error, response) => {
      if (response.statusCode === 201) {
        deferred.resolve();
      } else {
        const errorObject = errorHelper.createAndLogError('EmailService::sendEmail',
          `Failed to send email. Status: ${response.status} Body: ${response.body}`);
        deferred.reject(errorObject);
      }
    });

    return deferred.promise;
  }
}

module.exports = EmailService;
