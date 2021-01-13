/*
 * This services which provides the logic to handle REST services GET, POST, PUT, and DELETE for Users.
 *
 *
 * @author:     Micah Brown << brownsm@us.ibm.com >>
 * @version:    1.0
 * @modified:   August 19, 2015
 *
 */

/* Model providing interactions with Cloudant database */
var Model = require('../models/Model');
/* Helper providing authentication services through ldaps */
var Helper = require('../helper/user-manager');

// var dev = require('../../config/development');
var config = require('config');
var rest_url = config.get('domain.url')

var _ = require('underscore');
var unirest = require('unirest');
var async = require('async');
/* Winston logging package used for logging errors */
var logger = require('../helper/Logger');
/* Java Web Token package used for decoding the JWT */
var jwt = require('jwt-simple');
/* Moment js for time manipulation */
var moment = require('moment');
require('moment-range');
var q = require('q');

//Generic server error.
var SERVER_ERROR = {
  'status_code': 500,
  'message': "Server error!",
  'details': ""
};

var userServices = module.exports;

/*
 * This function finds one user (details). It only returns the skill rating for the most recent entry. Note that the
 * returned documents are formatted differently depending on which parameters are present (see specifications).
 *
 * @params:
 *      params: the query parameters. For full list see the latest project specifications document.
 *      callback:this sends the message to the controller with status code and content.
 *
 * */
userServices.findAllUser = function (params, callback) {
  //collect query parameters.
  var lim = params.limit;
  var offset = parseInt(params.offset);
  var skill = params.skill;
  var manager = params.manager;
  var front_book = params.bookmark;

  var onVacation = params.onVacation;
  var role = params.role;
  var searchValue = params.searchValue;
  // var isManager = params.isManager;

  //set defaults for query parameters.
  if (offset === undefined || isNaN(offset) || !offset) {
    offset = 0;
  }

  //if isManager is not set, default it to false.
  // if (!isManager) {
  //     isManager = false;
  // }

  // Case 1: Retrieve users who have vacations. We use a view for this so that we can implement a limit and count
  // of total documents.
  if (onVacation === "true") {
    var view = 'vacations';

    Model.queryView(Model.Databases.USERS, view, {
      selector: {"reports_to": (!_.isEmpty(manager) && manager !== "all") ? {"_id": {"$eq": manager}} : undefined},
      limit: (lim == undefined || isNaN(lim) || lim == '') ? undefined : parseInt(lim),
      skip: offset
    }).then(function (docs) {

      //First format the response to match what we need.
      var users = [];

      for (var i = 0; i < docs.rows.length; i++) {
        var user = docs.rows[i].doc;
        var vacations = [];
        if ((user.reports_to !== undefined && user.reports_to._id === manager) || manager === 'all') {
          _.each(docs.rows[i].doc.vacations, function (vaca) {
            var d = new Date();
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
            d.setMilliseconds(0);
            var now = d.getTime();
            var nextWeek = new Date().getTime() + 684863000;
            if ((vaca.start_date <= nextWeek) && (vaca.end_date >= now)) {
              vacations.push(vaca);
            }
          });

          if (vacations.length > 0) {
            user.vacations = vacations;
            users.push(user);
          }
        }
      }

      //For each user, sort his/her vacations by start date.
      _.each(users, function (user) {
        user.vacations = _.sortBy(user.vacations, function (vacation) {
          return vacation.start_date;
        });
      });

      //now, we go through all the users and sort by the start date of their first vacation.
      users = _.sortBy(users, function (user) {
        return user.vacations[0].start_date;
      });

      callback({
        'status_code': 200,
        'message': {
          'kind': 'resource#userResponse',
          'pageInfo': {
            'totalResults': users.length,
            'resultsPerPage': users.length
          },
          'items': users
        }
      });
    }, function (err) {
      logger.log('error', err);
      SERVER_ERROR.details = err;
      callback(SERVER_ERROR);
    });
  }
  //if service is initiated by searching all users with a string variable
  else if (searchValue) {
    var queryString = 'email:' + searchValue + '* OR ' + 'fname:' + searchValue + '* OR ' + 'lname:' + searchValue + '*';

    Model.searchDocuments(Model.Databases.USERS, queryString, "searchUsers").then(function (documents) {
      callback({
        'status_code': 200,
        'message': {
          'kind': 'resource#userListResponse',
          'pageInfo': {
            'totalResults': documents.rows.length
          },
          'items': documents.rows
        }
      });
    }, function (err) {
      callback(err);
    });
  }
  else {
    var query;

    //Case 2: Retrieve a list of users with a particular skill. The response is modified after the query is executed
    //to only return the most recent proficiency level
    if (skill) {
      query = {
        selector: {
          'skills': {
            $elemMatch: {
              'id': skill
            }
          },
          "reports_to": (!_.isEmpty(manager) && manager !== "all") ? {"_id": {"$eq": manager}} : undefined,
          "status": "Active"
        },
        fields: [
          '_id',
          'fname',
          'lname',
          'email',
          'role',
          'job_title',
          'cc',
          'uid',
          'skills'
        ],
        bookmark: front_book,
        limit: (lim == undefined || isNaN(lim) || lim == '') ? undefined : parseInt(lim)
      }
    }
    // Default case: Either retrieve all users (sorted such that managers appear first), or retrieve a specific
    // role (User, Viewer, or Admin).
    else {
      if (role) {
        query = {
          selector: {
            'role': role,
            "reports_to": (!_.isEmpty(manager) && manager !== "all") ? {"_id": {"$eq": manager}} : undefined
          },
          sort: [
            {
              'fname': 'asc'
            }
          ],
          bookmark: front_book,
          limit: (lim == undefined || isNaN(lim) || lim == '') ? undefined : parseInt(lim)
        };
      } else {
        query = {
          selector: {
            $or: [
              {role: 'User'},
              {role: 'Admin'}
            ],
            $or: [
              {isManager: 'True'},
              {isManager: 'False'}
            ],
            "reports_to": (!_.isEmpty(manager) && manager !== "all") ? {"_id": {"$eq": manager}} : undefined,
            "status": "Active"
          },
          sort: [
            {
              'fname': 'asc'
            }
          ],
          bookmark: front_book,
          limit: (lim == undefined || isNaN(lim) || lim == '') ? undefined : parseInt(lim)
        };
      }
    }
    Model.queryDocuments(Model.Databases.USERS, query).then(function (docs) {
      var bookmark = docs.bookmark;

      docs = docs.docs;
      async.waterfall([
        function (waterfallCallback) {
          //If we are retrieving all users with a particular skill, only return the most recent skill entry (by timestamp)
          if (skill) {
            _.each(docs, function (doc) {
              //First we remove all other skills besides the one we are interested in.
              doc.skills = _.find(doc.skills, function (entry) {
                return entry.id === skill;
              });
              //We perform a sort so that the most recent entry is the first element of the array
              doc.skills.proficiency = _.sortBy(doc.skills.proficiency, function (entry) {
                return -entry.date;
              });
            });
          }

          waterfallCallback(null, docs);
        }
      ], function (err, result) {
        callback({
          'status_code': 200,
          'message': {
            'kind': 'resource#userListResponse',
            'pageInfo': {
              'totalResults': result.length,
              'bookmark': bookmark
            },
            'items': result
          }
        });
      });
    }, function (err) {
      SERVER_ERROR.details = err;
      callback(SERVER_ERROR);
    });
  }
};

/*
 * This function finds one user (details). It only returns the skill rating for the most recent entry.
 *
 * @params:
 *      id: the user id you are requesting.
 *      callback:this sends the message to the controller with status code and content.
 *
 * */
userServices.findOneUser = function (id, callback) {
  var userId = id.toLowerCase();
  Model.retrieveDocumentsById(Model.Databases.USERS, [userId], true).then(function (doc) {
    if (!doc) {
      logger.log('error', 'User not found! In findOneUser method');
      callback({
        'status_code': 404,
        'message': 'User not found!'
      });
    }
    var query = {
      selector: {
        user_id: userId
      }
    }
    //Now, retrieve the user's project/utilization information.
    Model.queryDocuments(Model.Databases.UTILIZATIONS, query).then(function (projects) {
      projects = projects.docs;
      doc.projects = (projects.length > 0) ? projects[0].projects : [];

      //if user has skills, only show the most recent rating for each skill.
      // ------------------ breaking line ------------
      //keep proficiency as an array, the first element is the latest one, easily for updating skills
      //also good for keeping consistency for getting proficiency from skill and user APIs
      //Edited by Xunrong Li

      if (doc.skills) {
        _.each(doc.skills, function (skill) {
          skill.proficiency = _.sortBy(skill.proficiency, function (entry) {
            return -entry.date;
          });
          skill.proficiency = skill.proficiency;
        });
      }
      callback({
        'status_code': 200,
        'message': {
          'kind': 'resource#userResponse',
          'pageInfo': {
            'totalResults': 1
          },
          'item': doc
        }
      });
    }, function (err) {
      SERVER_ERROR.details = err;
      callback(SERVER_ERROR);
    });
  }, function (err) {
    SERVER_ERROR.details = err;
    callback(SERVER_ERROR);
  });
};

/*
 * This function validates if user exist. Returns bool of true if exist, false, otherwise.
 *
 * @params:
 *      id: the user id you are requesting.
 *      callback:this sends the message to the controller with status code and content.
 */
userServices.validateUserExist = function (id, callback) {
  var userId = id.toLowerCase();
  Model.retrieveDocumentsById(Model.Databases.USERS, [userId], true).then(function (doc) {
    var isExist = false;
    if (doc) {
      isExist = true;
    }
    callback({
      'status_code': 200,
      'message': {
        'kind': 'resource#userResponse',
        'isExist': isExist
      }
    });
  }, function (err) {
    SERVER_ERROR.details = err;
    callback(SERVER_ERROR);
  });
};


/* This function deletes a user from the USER database. It also decrements 'people_count' in the skill database for
 * each skill that the user has, removes user from 'team' in projects database, and destroys that user's document in
 * the utilization database
 *
 * @params:
 *     id: the user id (ibm intranet email address) of user that will be destroyed
 *     callback: this sends the message to the controller with status code and content.
 * */
userServices.deleteUser = function (id, headers, callback) {
  var token = headers['x-access-token'];
  var decoded = jwt.decode(token, require('../../config/secret.js')());
  var updated_by = decoded.iss;

  //Delete the user document and the utilization document in parallel
  async.waterfall([
      function (parallelCallback) {
        Model.retrieveDocumentsById(Model.Databases.USERS, [id], true).then(function (user) {
          if (!user) {
            parallelCallback({
              'status_code': 404,
              'message': 'User not found!'
            }, null);
          }
          else {
            var rev = user._rev;
            Model.destroyDocument(Model.Databases.USERS, id, rev).then(function () {
              //decrement people_count in skills for each skill user had.
              async.each(user.skills, function (skill, eachCallback) {
                updateSkillCount(skill.id, -1, updated_by, function (err) {
                  if (err) {
                    eachCallback(err);
                  }
                  else {
                    eachCallback();
                  }
                });
              }, function (err) {
                if (err) {
                  parallelCallback(err);
                } else {
                  parallelCallback(null, user.role);
                }
              });
            }, function (err) {
              parallelCallback(err);
            });
          }
        }, function (err) {
          parallelCallback(err);
        });
      },
      function (role, parallelCallback) {
        var query = {
          selector: {
            user_id: id
          }
        }
        //Now, retrieve the projects that this user was on so that we can delete her from team in PROJECTS DB.
        Model.queryDocuments(Model.Databases.UTILIZATIONS, query).then(function (utilization) {
          utilization = utilization.docs;
          if (utilization.length > 0) {
            //remove people from team of in PROJECTS DB
            async.each(utilization[0].projects, function (project, eachCallback) {
              removeTeamMember(project.proj_id, id, updated_by, role, function (err) {
                if (err) {
                  eachCallback(err);
                } else {
                  eachCallback();
                }
              });
            }, function (err) {
              if (err) {
                parallelCallback(err);
              } else {
                //Now delete the project information for this user in the UTILIZATIONS DB.
                Model.destroyDocument(Model.Databases.UTILIZATIONS, utilization[0]._id, utilization[0]._rev).then(function () {
                  //If all good (no errors up to here):
                  parallelCallback(null, 'done');
                }, function (err) {
                  parallelCallback(err);
                });
              }
            });
          } else {
            //If there is no utilization document returned then there is nothing to delete.
            parallelCallback(null, 'done');
          }
        }, function (err) {
          parallelCallback(err);
        });
      }
    ],
    //parallelCallback
    function (err, result) {
      if (err) {
        logger.log('error', err);
        SERVER_ERROR.details = err;
        callback(SERVER_ERROR);
      } else {
        //If we reach here, we are all good with no error.
        callback({
          'status_code': 204,
          'message': null
        });
      }
    });
};


/*This function posts a user to the USER database. It retrieves some information from the IBM Bluepages via LDAP.
 * This function also increments 'people_count' in the skills database.
 * @params:
 *      body: The body of the user you are adding.
 *      callback: this sends the message to the controller with status code and content.
 */
userServices.addUser = function (body, headers, callback) {
  var token = headers['x-access-token'];
  var decoded = jwt.decode(token, require('../../config/secret.js')());
  var created_by = decoded.iss;
  var infoFromBluepages = {};
  var userDoc = {};

  function translateEmpType(empType) {
    if (empType.indexOf('X') == 0) {
      return "IBM Employee, Supplemental";
    }
    else if (empType.indexOf('P') == 0) {
      return "IBM Employee, Regular";
    }
    else if (empType.indexOf('C') == 0) {
      return "non-IBM Employee, Contractor";
    }
    else if (empType.indexOf('A') == 0) {
      return "IBM Employee, Alternate Work Arrangement";
    }
  }

  Model.retrieveDocumentsById(Model.Databases.USERS, [body._id], true).then(function (doc) {
    //If a user already exists with that username, return a 400 error back to the client.
    if (doc) {
      logger.log('error', 'Error inserting user to database: user already exists!');
      callback({
        'status_code': 400,
        'message': 'A user exists with that id already.'
      });
    } else {
      async.series([
        function (bluePagesCallback) {
          unirest.get('https://faces.tap.ibm.com/api/find/?q=' + body._id).end(function (response) {
            if (response.code == 200) {
              if (response.body[0].email.indexOf(body._id) == 0) {
                infoFromBluepages = response.body[0];
              }
            }
            bluePagesCallback();
          });
        }, function (insertUserDetailsCallback) {
          //Retrieve user info from LDAP client
          Helper.findUserDetailsAndAuthenticate(body._id).then(function (user) { //onSuccess (LDAP finds user)
              user._id = body._id.toLowerCase();
              user.job_title = body.job_title;
              user.status = (body.status) ? body.status : 'Active';
              user.role = body.role; //todo: get this from bluegroup?
              user.isManager = (body.isManager) ? body.isManager : 'False';
              user.vacations = (body.vacations) ? body.vacations : [];
              user.reports_to = (body.reports_to) ? body.reports_to : '';
              user.skills = (body.skills) ? body.skills : [];
              user.job_title = (!_.isEmpty(infoFromBluepages["bio"])) ? infoFromBluepages["bio"] : undefined;
              user.phone_number = (!_.isEmpty(infoFromBluepages["office-phone"])) ? infoFromBluepages["office-phone"] : undefined,
                user.num_projects = 0;
              user.dob = body.dob;
              user.email = body._id;
              user.created_by = created_by;
              user.created_date = Date.now();
              //change the name of field to 'employee_type' from employeetype
              user.employee_type = translateEmpType(user.employeetype);
              delete user['employeetype'];
              userDoc = user;
              insertUserDetailsCallback();
            },
            function () { //onReject (failure to find user from LDAP)
              logger.log('error', 'Error with LDAP retrieve user: user is not found in Bluepages');
              callback({
                'status_code': 404,
                'message': 'User could not be found in Bluepages'
              });
            });
        }], function (err) {
        if (err) {
          SERVER_ERROR.details = err;
          callback(SERVER_ERROR);
        }
        Model.insertDocument(Model.Databases.USERS, userDoc).then(function () {
          var location = rest_url + '/v1/users/' + userDoc._id;
          callback({
            'status_code': 201,
            'location': location
          });
        }, function (err) {
          SERVER_ERROR.details = err;
          callback(SERVER_ERROR);
        });
      });
    }
  }, function (err) {
    SERVER_ERROR.details = err;
    callback(SERVER_ERROR);
  });
};

/*
 * This function updates the user entry. Also, it will update people_count in skills database (if user is adding or
 * removing skills).
 *
 * @params:
 *      id: the user id you are updating
 *      body: the updated fields. Note that not all fields need to be present. Only the fields present will be
 *          overwritten.
 *      callback:this sends the message to the controller with status code and content.
 *
 * */
userServices.updateUser = function (id, body, headers, callback) {
  var token = headers['x-access-token'];
  var decoded = jwt.decode(token, require('../../config/secret.js')());
  var updated_by = decoded.iss;

  Model.retrieveDocumentsById(Model.Databases.USERS, [id], true).then(function (doc) {
    if (doc == undefined) {
      logger.log('error', 'error updating user: user not found in database!');
      callback({
        'status_code': 404,
        'message': 'User not found!'
      });
    }

    doc.updated_by = updated_by;
    doc.updated_date = Date.now();
    async.series([function (skillsProjectsCallback) {
      //update people_count in skills
      if (body.skills) {
        var bSuccess = true;
        async.series([function (callbackA) {
          //This is the case user is removing a skill and decrement people_count in skills
          async.each(doc.skills, function (skill, eachCallback) {
            if ((body.skills.map(function (e) {
                return e.id;
              }).indexOf(skill.id) < 0) || (body.skills.length == 0)) {
              async.series([function (callbackUpdate) {
                updateSkillCount(skill.id, -1, updated_by, function (err) {
                  if (err) {
                    eachCallback(err);
                  } else {
                    callbackUpdate();
                  }
                });
              }, function (callbackDelete) {
                //only add manager to array if user is not Viewer. Viewers does not belong to any team.
                //if no person under the same manager has this skill, remove manager from the array
                if (doc.role !== 'Viewer' && doc.role !== '' && doc.role !== undefined) {
                  deleteSkillManager(skill.id, doc.reports_to._id, updated_by, doc.role, function (err) {
                    if (err) {
                      logger.log('error', err);
                      eachCallback(err);
                    } else {
                      callbackDelete();
                    }
                  });
                } else {
                  callbackDelete();
                }
              }], function (err) {
                eachCallback(err);
              });
            } else {
              eachCallback();
            }
          }, function (err) {
            if (err) {
              logger.log('error', err);
              SERVER_ERROR.details = err;
              callback(SERVER_ERROR);
              bSuccess &= false;
            }
            callbackA();
          });
        }, function (callbackB) {
          //this is the case where user is adding a skill and increment people_count in skills
          //adding a skill will check the doc if your manager is listed in the array. If not, add your manager
          if (bSuccess) {
            var tempBodySkills = [];
            var errCount = 0;
            for (var i = 0; i < body.skills.length; i++) {
              tempBodySkills.push(body.skills[i]);
            }
            async.each(tempBodySkills, function (skill, eachCallback) {
              if (skill.proficiency[0].rating < 1) {
                callback({
                  'status_code': 400,
                  'message': 'Rating should be atleast 1star'
                });
                bSuccess &= false;
              }
              else if ((doc.skills.map(function (e) {
                  return e.id;
                }).indexOf(skill.id) < 0) || (doc.skills.length == 0)) {

                async.series([function (callbackUpdate) {
                  updateSkillCount(skill.id, 1, updated_by, function (err) {
                    if (err) {
                      logger.log('error', err);
                      eachCallback(err);
                    } else {
                      callbackUpdate();
                    }
                  });
                }, function (callbackAdd) {
                  //only add manager to array if user is not Viewer. Viewers does not belong to any team.
                  if (doc.role !== 'Viewer') {
                    addSkillManager(skill.id, doc.reports_to._id, updated_by, doc.role, function (err) {
                      if (err) {
                        logger.log('error', err);
                        eachCallback(err);
                      } else {
                        callbackAdd();
                      }
                    });
                  } else {
                    callbackAdd();
                  }
                }], function (err) {
                  eachCallback(err);
                });
              } else {
                eachCallback();
              }
            }, function (err) {
              if (err) {
                logger.log('error', err);
                SERVER_ERROR.details = err;
                callback(SERVER_ERROR);
                bSuccess &= false;
              }
              callbackB();
            });
          }
        }, function (callbackC) {
          if (bSuccess) {
            //Update the document. Also update the skill proficiency for the user
            doc.skills = body.skills;
            //Insert the updated document to the Database.
            Model.insertDocument(Model.Databases.USERS, doc, [id], doc._rev).then(function () {
              callback({
                'status_code': 204,
                'location': (rest_url + '/v1/users/' + id)
              });
            }, function (err) {
              SERVER_ERROR.details = err;
              callback(SERVER_ERROR);
            });
            callbackC();

          }

        }], function (err) {
          if (err) {
            SERVER_ERROR.details = err;
            callback(SERVER_ERROR);
          }
        });
      }
      //update project team and user.num_projects
      else if (body.projects) {
        var query = {
          selector: {
            user_id: id
          }
        }

        //Determine if user is adding/removing a project and then update num_projects accordingly.
        Model.queryDocuments(Model.Databases.UTILIZATIONS, query).then(function (utilDoc) {
          utilDoc = utilDoc.docs;
          var projects = (utilDoc.length > 0) ? utilDoc[0].projects : [];
          var bSuccess = true;
          var manager = doc.reports_to._id;

          if (!manager) {
            console.log("Manager does not exist for " + doc._id);
          }

          async.series([function (callback1) {
            //check if user is removing a project (decrement num_projects in user).
            async.each(projects, function (project, eachCallback) {
              if ((body.projects.map(function (e) {
                  return e.proj_id;
                }).indexOf(project.proj_id) < 0) || (body.projects.length == 0)) {
                removeTeamMember(project.proj_id, id, updated_by, doc.role, function (err) {
                  if (err) {
                    eachCallback(err);
                  } else {
                    eachCallback();
                  }
                });
              } else {
                eachCallback();
              }
            }, function (err) {
              if (err) {
                logger.log('error', err);
                SERVER_ERROR.details = err;
                callback(SERVER_ERROR);
                bSuccess &= false;
              }
              callback1();
            });
          }, function (callback2) {
            if (bSuccess) {
              //check if user is adding a project (increment num_projects in user, add user to team in projects)
              async.each(body.projects, function (newProject, eachCallback) {
                if ((projects.map(function (e) {
                    return e.proj_id;
                  }).indexOf(newProject.proj_id) < 0) || (projects.length == 0)) {
                  addTeamMember(newProject.proj_id, doc, updated_by, newProject.job_role, function (err) {
                    if (err) {
                      eachCallback(err);
                    } else {
                      eachCallback();
                    }
                  });
                } else {
                  eachCallback();
                }
              }, function (err) {
                if (err) {
                  logger.log('error', err);
                  SERVER_ERROR.details = err;
                  callback(SERVER_ERROR);
                  bSuccess &= false;
                }
                else {
                  // we update both the utilization and user document in parallel. The utilization document is
                  // updated with the new project array, and the user document is updated with the new value for
                  // 'num_projects'.
                  async.series(
                    [
                      //update user utilization that already exists.
                      function (updateUtilcallback) {
                        if (utilDoc.length > 0) {
                          utilDoc[0].projects = body.projects;

                          Model.insertDocument(Model.Databases.UTILIZATIONS, utilDoc[0], utilDoc[0]._id, utilDoc[0]._rev).then(function () {
                            updateUtilcallback();
                          }, function (err) {
                            updateUtilcallback(err);
                          });
                          //adding new utilization
                        } else {
                          var util = {
                            user_id: id,
                            fname: doc.fname,
                            lname: doc.lname,
                            job_title: doc.job_title,
                            reports_to: manager,
                            projects: body.projects
                          };
                          Model.insertDocument(Model.Databases.UTILIZATIONS, util).then(function () {
                            updateUtilcallback();
                          }, function (err) {
                            updateUtilcallback(err);
                          });
                        }
                      },
                      //update the user document to reflect the new number of projects
                      function (updateuserCallback) {
                        var findProjectsQuery = {selector: {user_id: id}, fields: ["projects"]};
                        Model.queryDocuments(Model.Databases.UTILIZATIONS, findProjectsQuery).then(function (documents) {
                          if (documents.docs.length > 0) {
                            // get the number of projects and update it in the users database
                            doc.num_projects = documents.docs[0].projects.length;
                          }
                          Model.insertDocument(Model.Databases.USERS, doc, doc._id, doc._rev).then(function () {
                            updateuserCallback();
                          }, function (err) {
                            updateuserCallback(err);
                          });
                        }, function (err) {
                          updateuserCallback(err);
                        });
                      }
                    ],
                    //parallelCallback
                    function (err) {
                      if (err) {
                        logger.log('error', err);
                        SERVER_ERROR.details = err;
                        callback(SERVER_ERROR);
                      } else {
                        callback({
                          'status_code': 204,
                          'location': (rest_url + '/v1/users/' + doc._id)
                        });
                        callback2();
                      }
                      skillsProjectsCallback();
                    });
                }
              });
            }
          }], function (err) {
            if (err) {
              SERVER_ERROR.details = err;
              callback(SERVER_ERROR);
            }
          })
        }, function (err) {
          if (err) {
            SERVER_ERROR.details = err;
            callback(SERVER_ERROR);
          }
        });
      }
      else {
        skillsProjectsCallback();
      }
    }, function (statusCallback) {
      // if change in user status
      if (body.status && body.status != doc.status && doc.skills.length > 0) {
        // update the skill count
        async.each(doc.skills, function (skill, eachCallback) {
          updateSkillCount(skill.id, (body.status == 'Active') ? 1 : -1, updated_by, function (err) {
            if (err) {
              eachCallback(err);
            }
            else {
              eachCallback();
            }
          });
        }, function (err) {
          if (err) {
            statusCallback(err);
          } else {
            statusCallback();
          }
        });
      } else {
        statusCallback();
      }

    }, function (othersCallback) {
      if (body.vacations || body.phone_number || body.job_title || body.role || body.reports_to || body.status) {
        var isEditTeam = false;
        var isStatusEdit = false;

        if (body.reports_to && body.reports_to._id) {
          if (body.reports_to._id !== doc.reports_to._id) {
            isEditTeam = true;
          }
        } else if (body.reports_to !== doc.reports_to) {
          isEditTeam = true;
        }

        if (body.status != doc.status) {
          isStatusEdit = true;
        }

        //Now overwrite the fields that are being updated in user
        for (var field in body) {
          if (field !== 'projects' && field !== 'skills') {
            doc[field] = body[field];
          }
        }
        // if user's manager or status is changed, process below
        if (isEditTeam || isStatusEdit) {
          updateUserManagerAndStatus(id, body.reports_to, isEditTeam, body.status, isStatusEdit).then(function (projArr) {
            if (isEditTeam == true && projArr) {
              q.all([
                getAllProjectsInArrayView(projArr),
                getAllSkillsInArrayView(id, body.reports_to)
              ]).then(function (data) {
                othersCallback();
              }).catch(function (err) {
                logger.log('error', 'Error q.all in updateUser othersCallback function in Users service ---' + err);
                othersCallback(err);
              });
            } else {
              othersCallback();
            }
          });
        } else {
          othersCallback();
        }
      } else {
        othersCallback();
      }
    }], function (err) {
      if (err) {
        SERVER_ERROR.details = err;
        callback(SERVER_ERROR);
      }

      //Insert the updated document to the Database.
      Model.insertDocument(Model.Databases.USERS, doc, [id], doc._rev).then(function () {
        callback({
          'status_code': 204,
          'location': (rest_url + '/v1/users/' + id)
        });

      }, function (err) {
        SERVER_ERROR.details = err;
        callback(SERVER_ERROR);
      });

    })
  }, function (err) {
    SERVER_ERROR.details = err;
    callback(SERVER_ERROR);
  });
};

/*
 * This function removes a user from a team in the projects database.
 *
 * @params:
 *      proj_id: the project id that you wish to remove the user from.
 *      user_id: the user you wish to remove from the project team.
 *      updated_id: who is performing this update.
 *      callback: this sends the message that the function has completed.
 */
var removeTeamMember = function (proj_id, user_id, updater_id, role, callback) {
  Model.retrieveDocumentsById(Model.Databases.PROJECTS, [proj_id], true).then(function (doc) {
    if (!doc) {
      callback({
        'status_code': 404,
        'message': 'Project not found!'
      });
    }

    async.waterfall([
      //First we remove this user from the team array.
      function (waterfallCallback) {
        var team = [];
        async.each(doc.team, function (user, eachCallback) {
          if (user.id !== user_id) {
            team.push(user);
          }
          eachCallback();
        });
        doc.team = team;
        doc.updated_by = updater_id;
        doc.updated_date = Date.now();
        waterfallCallback(null, doc);
      },
      //this function updates the reports_to array in the project to only store current managers that owns the project
      function (doc, waterfallCallback) {
        //only update managers array in projects DB if user is not Viewer. Viewers does not belong to any team
        //users and admins can also not have managers. Only go through here is manager is present
        if (role !== 'Viewer') {
          var managers = [];
          var uniqueManagers = [];

          var findUtilizationsQuery = {
            selector: {
              'projects': {$elemMatch: {'proj_id': proj_id}},
              'user_id': {"$ne": updater_id}
            }
          };

          Model.queryDocuments(Model.Databases.UTILIZATIONS, findUtilizationsQuery).then(function (utilDocs) {
            //store all managers in managers array
            _.each(utilDocs.docs, function (utilDoc) {
              if (utilDoc.reports_to && utilDoc.reports_to !== "" && utilDoc.reports_to !== undefined) {
                managers.push(utilDoc.reports_to);
              }
            });

            //remove all duplicated data in managers array
            uniqueManagers = managers.filter(function (elem, pos) {
              return managers.indexOf(elem) == pos;
            });

            doc.managers = uniqueManagers;

            waterfallCallback(null, doc);
          }, function (err) {
            callback(err);
          });
        }
      },
      //once the new team is stored, we insert (update) this project in the database.
      function (doc, waterfallCallback) {
        Model.insertDocument(Model.Databases.PROJECTS, doc, proj_id, doc._rev).then(function () {
          return null;
        }, function (err) {
          waterfallCallback(err);
        });
        waterfallCallback(null, 'done');
      }
    ], function (err, result) {
      if (err) {
        callback(err);
      } else {
        callback();
      }
    });
  }, function (err) {
    callback(err);
  });
};

/*
 * This function adds a user to a team in the projects database. Adds manager to the list of managers owning the updated project
 *
 * @params:
 *      proj_id: the project id that you wish to add the user to.
 *      user: the user you wish to add to the project team.
 *      updated_id: who is performing this update.
 *      job_role: the job role this user has for this project.
 *      callback: this sends the message that the function has completed.
 */
var addTeamMember = function (proj_id, user, updater_id, job_role, callback) {
  Model.retrieveDocumentsById(Model.Databases.PROJECTS, [proj_id], true).then(function (doc) {
    if (doc == undefined) {
      callback({
        'status_code': 404,
        'message': 'Project not found!'
      });
    }
    var team_member = {
      "id": user._id,
      "uid": user.uid,
      "notesid": user.notesid,
      "cc": user.cc,
      "fname": user.fname,
      "lname": user.lname,
      "email": user._id,
      "job_role": job_role
    };
    doc.updated_by = updater_id;
    doc.updated_date = Date.now();
    doc.team.push(team_member);

    var manager = user.reports_to._id;

    //only add manager to array if user is not Viewer. Viewers does not belong to any team.
    //users and admins can also not have managers. Only go through here is manager is present
    if (user.role !== 'Viewer' && manager !== '' && manager !== undefined) {
      if (doc.managers) {
        var isExist = false;

        // get all managers that own this specific skill and add manager param if not in the list
        _.each(doc.managers, function (managerElem) {
          if (managerElem === manager) {
            isExist = true;
          }
        });

        if (!isExist) {
          doc.managers.push(manager);
        }
      }
      // only passes here when adding new manager to skill
      else {
        var managers = [];

        managers.push(manager);
        doc.managers = managers;
      }
    }

    Model.insertDocument(Model.Databases.PROJECTS, doc, proj_id, doc._rev).then(function () {
      callback();
    }, function (err) {
      callback(err);
    });
  }, function (err) {
    callback(err);
  });
};

/*
 * This function updates the 'people_count' field in the skills database by the amount of the increment param.
 *
 * @params:
 *      skill_id: the skill id   that you wish to update
 *      increment: the amount that the people_count should be incremented by. This supports negative values as well.
 *      updater_id: who is performing this update.
 *      callback: this sends the message that the function has completed.
 */
var updateSkillCount = function (skill_id, increment, updater_id, callback) {
  Model.retrieveDocumentsById(Model.Databases.SKILLS, [skill_id], true).then(function (doc) {
    if (!doc) {
      callback({
        'status_code': 404,
        'message': 'Skill not found!'
      });
    }
    doc.updated_date = Date.now();
    doc.updated_by = updater_id;

    params = {key: skill_id};

    Model.queryView(Model.Databases.USERS, "skill_id", params).then(function (documents) {
      if (documents.rows.length > 0) {
        // get the number of users with queried skills and update it in the skills database
        doc.people_count = documents.rows.length + increment;
      }
      //only passes here when adding user to new skill
      else {
        doc.people_count = 1;
      }

      Model.insertDocument(Model.Databases.SKILLS, doc, skill_id, doc._rev).then(function () {
        callback();
      }, function (err) {
        callback(err);
      });
    }, function (err) {
      callback(err);
    });
  }, function (err) {
    callback(err);
  });
};

/*
 * This function adds a manager in the skills DB for the skill added.
 *
 * @params:
 *      skill_id: the skill id that you wish to add to the skill DB.
 *      manager: the manager you wish to add to the skill.
 *      updater_id: who is performing this update.
 *      callback: this sends the message that the function has completed.
 */
var addSkillManager = function (skill_id, manager, updater_id, role, callback) {
  if (!manager) {
    logger.log('error', 'Error in addSkillManager method in Users service');
    callback();
  }
  else {
    Model.retrieveDocumentsById(Model.Databases.SKILLS, [skill_id], true).then(function (doc) {
      if (!doc) {
        callback({
          'status_code': 404,
          'message': 'Skill not found!'
        });
      }
      doc.updated_date = Date.now();
      doc.updated_by = updater_id;

      //only add manager to array if user is not Viewer. Viewers does not belong to any team.
      if (doc.managers) {
        if (manager !== '' && manager !== undefined) {
          var isExist = false;

          // get all managers that own this specific skill and add manager param if not in the list
          _.each(doc.managers, function (managerElem) {
            if (managerElem === manager) {
              isExist = true;
            }
          });

          if (!isExist) {
            doc.managers.push(manager);
          }
        }
      }
      //only passes here when adding new manager to skill
      else {
        var managers = [];

        if (manager !== '' && manager !== undefined) {
          managers.push(manager);
        }

        doc.managers = managers;
      }

      Model.insertDocument(Model.Databases.SKILLS, doc, skill_id, doc._rev).then(function () {
        callback();
      }, function (err) {
        callback(err);
      });

    }, function (err) {
      callback(err);
    });
  }
};

/*
 * This function deletes a manager in the skills DB for the skill to be removed.
 *
 * @params:
 *      skill_id: the skill id that you wish to remove from the skill DB.
 *      manager: the manager you wish to remove from the skill.
 *      updater_id: who is performing this update.
 *      callback: this sends the message that the function has completed.
 */
var deleteSkillManager = function (skill_id, manager, updater_id, role, callback) {
  if (!manager) {
    logger.log('error', 'Error in deleteSkillManager method in Users service');
    callback();
  }
  else {
    Model.retrieveDocumentsById(Model.Databases.SKILLS, [skill_id], true).then(function (skillDocs) {
      if (!skillDocs) {
        callback({
          'status_code': 404,
          'message': 'Skill not found!'
        });
      }
      skillDocs.updated_date = Date.now();
      skillDocs.updated_by = updater_id;

      var findSkillsQuery = {
        selector: {
          'skills': {$elemMatch: {'id': skill_id}},
          '_id': {"$ne": updater_id},
          "reports_to": (!_.isEmpty(manager) && manager !== "all") ? {"_id": {"$eq": manager}} : undefined
        }
      };

      //only add manager to array if user is not Viewer. Viewers does not belong to any team.
      Model.queryDocuments(Model.Databases.USERS, findSkillsQuery).then(function (userDocs) {
        var managers = [];

        if (skillDocs.managers) {
          managers = skillDocs.managers;
        }

        if (!userDocs.docs.length) {
          var skillIDX = managers.indexOf(manager);

          if (skillIDX > -1) {
            managers.splice(skillIDX, 1);
          }
        }

        skillDocs.managers = managers;

        Model.insertDocument(Model.Databases.SKILLS, skillDocs, skill_id, skillDocs._rev).then(function () {
          callback();
        }, function (err) {
          callback(err);
        });
      }, function (err) {
        callback(err);
      });
    }, function (err) {
      callback(err);
    });
  }
};


var getAllProjectsInArrayView = function (projArr) {
  var deferred = q.defer();
  var params = {keys: projArr};

  function getProjects() {
    return Model.queryView(Model.Databases.PROJECTS, "projectId", params);
  }

  function getUtils() {
    return Model.queryView(Model.Databases.UTILIZATIONS, "projectId", params);
  }

  function mapProjArr(e) {
    return e.id;
  }

  q.all([
    getProjects(),
    getUtils()
  ]).then(function (data) {
    var projDocs = data[0].rows,
      utilDocs = data[1].rows,
      mgrArr = [];

    _.each(utilDocs, function (utilDoc, utilKey) {
      // only add user's manager if not empty or undefined
      _.each(utilDoc.doc.projects, function (proj, projKey) {
        if (projArr.indexOf(proj.proj_id) !== -1) {
          if (mgrArr.map(mapProjArr).indexOf(proj.proj_id) !== -1) {
            if (utilDoc.doc.reports_to !== '' && utilDoc.doc.reports_to !== undefined) {
              mgrArr[mgrArr.map(mapProjArr).indexOf(proj.proj_id)].managers.push(utilDoc.doc.reports_to);
            }
          } else {
            var projMgrs = {},
              managers = [];

            projMgrs.id = proj.proj_id;

            if (utilDoc.doc.reports_to !== '' && utilDoc.doc.reports_to !== undefined) {
              managers.push(utilDoc.doc.reports_to);
            }

            projMgrs.managers = managers;

            mgrArr.push(projMgrs);
          }
        }
      });
    });

    //remove all duplicated data in mgrArr array
    _.each(mgrArr, function (proj, key) {
      var projMgr = [];

      projMgr = proj.managers.filter(function (elem, pos) {
        return proj.managers.indexOf(elem) == pos;
      });

      proj.managers = projMgr;
    });

    // replace managers field in projDocs with the rebuilt managers and bulk insert
    var projectDocuments = [];

    _.each(projDocs, function (projDoc, proj_key) {
      var projectDocument = {};

      projectDocument = projDoc.doc;

      if (mgrArr.map(mapProjArr).indexOf(projectDocument._id) !== -1) {
        projectDocument.managers = mgrArr[mgrArr.map(mapProjArr).indexOf(projectDocument._id)].managers;
      } else {
        projectDocument.managers = [];
      }

      projectDocuments.push(projectDocument);
    });

    // after modifying manager array, bulk insert projects
    Model.bulk(Model.Databases.PROJECTS, {"docs": projectDocuments}).then(function (result) {
      deferred.resolve();
    }, function (err) {
      logger.log('error', 'Error bulk insert to projects in getAllProjectsInArrayView method in Users service ---' + err);
      deferred.reject(err);
    });

  }).catch(function (err) {
    logger.log('error', 'Error q.all in getAllProjectsInArrayView method in Users service ---' + err);
    deferred.reject(err);
  });

  return deferred.promise;
};

var getAllSkillsInArrayView = function (userId, reports_to) {
  var deferred = q.defer();

  function getUsers(params) {
    return Model.queryView(Model.Databases.USERS, "skill_id", params);
  }

  function getSkills(params) {
    return Model.queryView(Model.Databases.SKILLS, "skill_id", params);
  }

  function mapSkillArr(e) {
    return e.id;
  }

  Model.retrieveDocumentsById(Model.Databases.USERS, [userId], true).then(function (userDoc) {
    if (!userDoc) {
      logger.log('error', 'User not found! In getAllSkillsInArrayView method');
      deferred.reject("User document not found");
    }

    var skillsArr = [];
    // push all user's skills in array
    _.each(userDoc.skills, function (skill, skillKey) {
      skillsArr.push(skill.id);
    });

    var params = {keys: skillsArr};

    q.all([
      getUsers(params),
      getSkills(params)
    ]).then(function (data) {
      var usersDocs = data[0].rows,
        skillsDocs = data[1].rows,
        skillMgrArr = [];

      _.each(usersDocs, function (user, userKey) {
        var team = '';

        // since this function gets called before the insert to USERS DB with the new manager,
        // check to see if managers are the same
        if (user.doc._id == userId) {
          if (reports_to && reports_to._id) {
            team = reports_to._id;
          } else {
            team = reports_to;
          }
        } else {
          if (user.doc.reports_to._id) {
            team = user.doc.reports_to._id;
          } else {
            team = user.doc.reports_to;
          }
        }

        // only add user's manager if not empty or undefined.
        if (skillMgrArr.map(mapSkillArr).indexOf(user.key) !== -1) {
          if (team !== '' && team !== undefined) {
            skillMgrArr[skillMgrArr.map(mapSkillArr).indexOf(user.key)].managers.push(team);
          }
        } else {
          var skillMgrs = {},
            managers = [];

          skillMgrs.id = user.key;

          if (team !== '' && team !== undefined) {
            managers.push(team);
          }

          skillMgrs.managers = managers;

          skillMgrArr.push(skillMgrs);
        }
      });

      //remove all duplicated data in mgrArr array
      _.each(skillMgrArr, function (skill, key) {
        var skillMgr = [];

        skillMgr = skill.managers.filter(function (elem, pos) {
          return skill.managers.indexOf(elem) == pos;
        });

        skill.managers = skillMgr;
      });

      // replace managers field in skillsDocs with the rebuilt managers and bulk insert
      var skillDocuments = [];
      _.each(skillsDocs, function (skillDoc, proj_key) {
        var skillDocument = {};

        skillDocument = skillDoc.doc;

        if (skillMgrArr.map(mapSkillArr).indexOf(skillDocument._id) !== -1) {
          skillDocument.managers = skillMgrArr[skillMgrArr.map(mapSkillArr).indexOf(skillDocument._id)].managers;
        } else {
          skillDocument.managers = [];
        }

        skillDocuments.push(skillDocument);
      });

      // after modifying manager array, bulk insert skills
      Model.bulk(Model.Databases.SKILLS, {"docs": skillDocuments}).then(function (result) {
        deferred.resolve();
      }, function (err) {
        logger.log('error', 'Error bulk insert to SKILLS in getAllSkillsInArrayView method in Users service ---' + err);
        deferred.reject(err);
      });

    }).catch(function (err) {
      logger.log('error', 'Error q.all in getAllSkillsInArrayView method in Users service ---' + err);
      deferred.reject(err);
    });
  }, function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

var updateUserManagerAndStatus = function (userId, reports_to, isEditTeam, status, isStatusEdit) {
  var deferred = q.defer();
  var query = {selector: {user_id: userId}};

  Model.queryDocuments(Model.Databases.UTILIZATIONS, query).then(function (documents) {
    if (documents.docs.length > 0) {
      if (isEditTeam) {
        if (reports_to !== '' && reports_to !== undefined) {
          documents.docs[0].reports_to = reports_to._id;
        } else {
          documents.docs[0].reports_to = '';
        }
      }
      if (isStatusEdit) {
        documents.docs[0].status = status;
        // If the status is being updated to "Inactive",
        // change the utilization end_date to inactivated date of all the current on going projects of an user.
        if (status == "Inactive") {
          var updatedProjectDocs = [];
          var projectDocs = documents.docs[0].projects;
          // iterate through projects
          _.each(projectDocs, function (projectDoc) {
            var utilDocs = projectDoc.utilization;
            var updatedUtilDocs = [];
            // iterate through utilization docs
            _.each(utilDocs, function (utilDoc) {
              var currDate = new Date().getTime();
              // If current utilization, change utilization end_date
              if ((currDate >= utilDoc.start_date) && (currDate <= utilDoc.end_date)) {
                utilDoc.end_date = currDate;
                updatedUtilDocs.push(utilDoc);
              }
              //If future utilization, ignore
              else if (currDate < utilDoc.start_date && currDate < utilDoc.end_date) {

              }
              //If previous utilization, do not change the utilization
              else {
                updatedUtilDocs.push(utilDoc);
              }

            });

            projectDoc.utilization = updatedUtilDocs;

            if (updatedUtilDocs.length > 0) {
              updatedProjectDocs.push(projectDoc);
            }

          });
          documents.docs[0].projects = updatedProjectDocs;
        }
      }

      Model.insertDocument(Model.Databases.UTILIZATIONS, documents.docs[0], documents.docs[0]._id, documents.docs[0]._rev).then(function () {

        if (isEditTeam) {
          var projArr = [];

          // compile all projects in an array to be used as parameters
          _.each(documents.docs[0].projects, function (proj, projKey) {
            projArr.push(proj.proj_id);
          });
          deferred.resolve(projArr);
        } else {
          deferred.resolve();
        }

      }, function (err) {
        logger.log('error', 'Error insertDocument in updateUserManagerAndStatus method in Users service ---' + err);
        deferred.reject(err);
      });
    }
    else {
      deferred.resolve();
    }

  }, function (err) {
    logger.log('error', 'Error queryDocuments in updateUserManagerAndStatus method in Users service ---' + err);
    deferred.reject(err);
  });
  return deferred.promise;
};
