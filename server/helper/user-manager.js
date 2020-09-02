/*
 Author : Harish Yayi
 Description : This file contains all the functionalities related to
 retrieving user details from bluepages and authentication
 and checking whether the user is part of blue group or not.
 Created On : Fri June 11, 2015
 Last Edited : Thu July 20,2015
 Last Edited By : Harish Yayi
 */

/*
 * Import required NodeJS modules.
 */

'use strict';
const config = require('config');
const LDAP = require('ldapjs');
const q = require('q');
const _ = require('underscore');
const UserManager = module.exports;
const ldapSettings = config.get('ldapSettings');

UserManager.DEFAULT_USER = {
  employee_type: '',
  role: '',
  status: '',
  cc: '',
  lname: '',
  fname: '',
  notesid: '',
  uid: '',
  dob: '',
  num_projects: 0,
  skills: [],
  vacations: [],
  isManager: 'False',
  job_title: '',
};

const LDAP_SETTINGS = Object.freeze({
  scheme: ldapSettings.scheme,
  host: ldapSettings.host,
  port: ldapSettings.port,
  base: 'ou=bluepages,o=ibm.com',
  user_attrs: [
    // e.g. C-H8DH897
    { name: 'uid' },
    // e.g. CN=Carlos Garcia/OU=Raleigh/OU=Contr/O=IBM
    //      (Carlos Garcia/Raleigh/Contr/IBM)
    { name: 'notesid' },
    { name: 'employeetype' },
    // e.g. UNITED STATES
    // {name: 'co'},
    { name: 'c', preferred_name: 'cc' },
    // if format is true, it converts the value to the title case
    { name: 'givenname', preferred_name: 'fname', format: true },
    { name: 'sn', preferred_name: 'lname', format: true },
    // e.g. cgarcia1@us.ibm.com
    { name: 'mail', preferred_name: 'email' },
    // e.g. Carlos Garcia
    { name: 'cn', preferred_name: 'cname', format: true },
  ],
});

const getAttributeByName = (entry, name) => {
  let value = void 0;
  for (const index in entry.attributes) {
    if ({}.hasOwnProperty.call(entry.attributes, index)) {
      const attr = entry.attributes[index];
      if (attr.type && attr.type.toLowerCase() === name) {
        value = attr.vals[0];
        break;
      }
    }
  }
  return value;
};

/*
 Author : Harish Yayi
 Description : This function will go search for a user in bluepages.ibm.com via a LDAP protocol.
 If a password if passed over to this function,
 then the user will also be validated against his/her password.
 @param		uid			{String}	The user's id (usu. IBM e-mail address).
 @param		password	{String}	The user's password.
 @returns	promise		{Object}	A deferred promise.
 Created On : Fri June 11, 2015
 Last Edited : Thu July 19,2015
 Last Edited By : Harish Yayi
 */
UserManager.findUserDetailsAndAuthenticate = (uid, password) => {
  const deferred = q.defer();
  const errDoc = {};

  const options = {
    filter: '(mail='.concat(uid, ')'),
    scope: 'sub',
  };
  let url = LDAP_SETTINGS.scheme.concat('://');
  url += LDAP_SETTINGS.host.concat(':');
  url += LDAP_SETTINGS.port;
  const ldapClient = LDAP.createClient({ url });
  const user = {};

  function capitalizeEachWord(str) {
    return str.replace(/\w\S*/g, (txt) => {
      const replacedStr = txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      return replacedStr;
    });
  }

  ldapClient.search(LDAP_SETTINGS.base, options, (err, res) => {
    if (err) {
      errDoc.code = 500;
      errDoc.message = err.name.concat(err.message);
      deferred.reject(errDoc); // if any error in connection
    } else {
      res.on('searchEntry', (entry) => {
        _.each(LDAP_SETTINGS.user_attrs, (attr) => {
          let val = getAttributeByName(entry, attr.name);
          if (attr.format) {
            val = capitalizeEachWord(val.toLowerCase());
          }
          if (attr.name === 'notesid') {
            let notesid = '';
            const parts = val.split('/'); // formatting the notes id
            for (let i = 0; i < parts.length; i++) {
              const index = parts[i].indexOf('=');
              notesid = notesid + parts[i].substr(index + 1, parts[i].length - 1);
              if (i !== parts.length - 1) {
                notesid = notesid.concat('/');
              }
            }
            user[attr.name] = notesid;
          } else if (attr.preferred_name) { // if preferred name is given
            user[attr.preferred_name] = val;
          } else {
            user[attr.name] = val;
          }
        });
        if (password && !_.isEmpty(password)) {
          // Checks password with client's ´bind´ function.
          // authenticating
          ldapClient.bind(entry.dn, password, (binderr) => {
            if (binderr) {
              errDoc.code = 401;
              errDoc.message = 'Invalid Credentials';
              deferred.reject(errDoc); // if not authenticated
            } else {
              deferred.resolve(user); // if authenticated send the user details
            }
          });
        } else {
          // if no authentication is required
          deferred.resolve(user);
        }
      });

      res.on('error', (errorerr) => {
        errDoc.code = 500;
        errDoc.message = errorerr;
        deferred.reject(errDoc); // if any error event occurs
      });

      res.on('end', () => {
        ldapClient.unbind((unbinderr) => {
          if (unbinderr) {
            errDoc.code = 500;
            errDoc.message = unbinderr;
            deferred.reject(errDoc);
          }
        });

        // check if no user is found on Bluepages
        if (_.isEmpty(user)) {
          errDoc.code = 401;
          errDoc.message = 'Invalid Credentials';
          deferred.reject(errDoc); // if not authenticated
        }
      });
    }
    return deferred.promise;
  });
  return deferred.promise;
};
