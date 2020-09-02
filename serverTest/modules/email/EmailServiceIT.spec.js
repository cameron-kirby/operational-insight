'use strict';

const assert = require('assert');
const fs = require('fs');

const EmailService = require('../../../server/modules/email/EmailService');

const emailService = new EmailService();

describe('EmailService', function testEmailService() {
  this.timeout(10000);

  describe('readTemplate', () => {
    const testDocumentPath = 'tests/testTemplate.html';
    const testTemplate =
      '<!doctype html>'
    + '<html lang="en">'
      + '<head>'
        + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
        + '<meta http-equiv="Content-Style-Type" content="text/css" />'
        + '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
      + '</head>'
      + '<body>'
        + 'Hi'
      + '</body>'
    + '</html>';

    beforeEach((done) => {
      const exists = fs.existsSync('server/assets/emailTemplates/tests');
      if (!exists) {
        fs.mkdirSync('server/assets/emailTemplates/tests');
      }
      fs.writeFileSync(`server/assets/emailTemplates/${testDocumentPath}`, testTemplate, 'utf-8');
      done();
    });

    it('should return the template if it exists.', (done) => {
      emailService.readTemplate(testDocumentPath)
        .then((document) => {
          try {
            assert.equal(document, testTemplate);
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((error) => {
          done(error);
        });
    });

    it('should remove any hidden whitespace characters (newline, tab, etc)', (done) => {
      emailService.readTemplate('utilizationVerificationReminder.html')
        .then((document) => {
          try {
            assert.equal(document.indexOf('\n'), -1);
            assert.equal(document.indexOf('\t'), -1);
            assert.equal(document.indexOf('\r'), -1);
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((error) => {
          done(error);
        });
    });

    it('should throw an error if the template does not exist.', (done) => {
      emailService.readTemplate('NOT_GOING_TO_FIND_ME')
        .then((document) => {
          done(document);
        })
        .catch(() => {
          done();
        });
    });
  });

  describe('sendEmail', () => {
    const testFirstName = 'John E.';
    const testEmailAccount = 'jcarroll@us.ibm.com';
    const testDocumentPath = 'tests/testTemplate.html';
    const testTemplate =
     '<!doctype html>'
   + '<html lang="en">'
     + '<head>'
       + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
       + '<meta http-equiv="Content-Style-Type" content="text/css" />'
       + '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
     + '</head>'
     + '<body>'
       + 'Hi'
     + '</body>'
   + '</html>';


    beforeEach((done) => {
      fs.writeFileSync(`server/assets/emailTemplates/${testDocumentPath}`, testTemplate, 'utf-8');
      done();
    });


    it('should send the email.', (done) => {
      emailService.readTemplate(testDocumentPath)
        .then((template) => {
          emailService.sendEmail(testEmailAccount,
           template,
           `${new Date()} Test: should send the email.`,
           {})
            .then(() => {
              // Check your email!
              done();
            })
            .catch((error) => {
              done(error);
            });
        })
        .catch((error) => {
          done(error);
        });
    });

    it('should send the email after filling in the template.', (done) => {
      emailService.readTemplate('utilizationVerificationReminder.html')
        .then((template) => {
          emailService.sendEmail(testEmailAccount,
           template,
            `${new Date()} Test: should send the email after filling in the template.`,
            {
              domain: 'http://localhost:3000/rest',
              loginToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.ImpjYXJyb2xsQHVzLmlibS5jb20i'
                + '.mIWu2ZP7UbFmz0NeNpo-fdiUGxkOjs4EKMscv7nMFoQ',
              firstName: testFirstName,
              user_id: testEmailAccount,
            })
          .then(() => {
            // Check your email!
            done();
          })
          .catch((error) => {
            done(error);
          });
        })
        .catch((error) => {
          done(error);
        });
    });
  });
});
