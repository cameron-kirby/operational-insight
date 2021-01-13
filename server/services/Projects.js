/*
 Author : Harish Yayi
 Description : This file contains all the functionalities related to
 Projects module like create,find,update and delete.
 Created On : June 11, 2015
 Last Edited : October 14, 2015
 Last Edited By : Harish Yayi
*/

'use strict';

const q = require('q');
const _ = require('underscore');
const Model = require('../models/Model');
const Helper = require('../helper/user-manager');
const jwt = require('jwt-simple');
const config = require('config');
const iptLink = config.get('ipt');
const moment = require('moment');
const logger = require('../helper/Logger');


const projectService = module.exports;


// Takes the email id and finds out the details of an employee from LDAP
function findDetails(teamMember, designation) {
  const deferredF = q.defer();
  Helper.findUserDetailsAndAuthenticate(teamMember).then((user) => {
    const temp = {};
    temp.id = teamMember.toLowerCase();
    temp.uid = user.uid;
    temp.notesid = user.notesid;
    temp.cc = user.cc;
    temp.fname = user.fname;
    temp.lname = user.lname;
    temp.email = user.email;
    temp.job_role = (designation === 'TL') ? 'Technical Lead' : 'Project Manager';
    deferredF.resolve(temp);
  }, () => {
    deferredF.reject('Could not retrieve details of technical lead or project manager');
  });
  return deferredF.promise;
}

/*
 Author : Harish Yayi
 Description : This method is for creating a new project.
 It gets details of the technical leads and project managers from ldap and
 builds the project document and saves it to the database.
 Created On : June 11, 2015
 Last Edited : August 14,2015
 Last Edited By : Harish Yayi
 */
projectService.addProject = (req) => {
  const deferred = q.defer();
  const resObj = {};
  // !!! const token = req.headers['x-access-token'];
	// get the user who invoked the api
  // !!! const decoded = jwt.decode(token, require('../../config/secret.js')());
  // series of validations to check if the required attributes are present in the request body
  if (_.isEmpty(req.body.name)) {
    resObj.status_code = 400;
    resObj.message = 'Project name is mandatory';
    deferred.resolve(resObj);
    return deferred.promise;
  }
  if (_.isEmpty(req.body.status)) {
    resObj.status_code = 400;
    resObj.message = 'Project status is mandatory';
    deferred.resolve(resObj);
    return deferred.promise;
  }
  if (_.isEmpty(req.body.process)) {
    resObj.status_code = 400;
    resObj.message = 'Project process is mandatory';
    deferred.resolve(resObj);
    return deferred.promise;
  }
  if (_.isEmpty(req.body.geo)) {
    resObj.status_code = 400;
    resObj.message = 'Project geo is mandatory';
    deferred.resolve(resObj);
    return deferred.promise;
  }
  if (_.isEmpty(req.body.deliverable)) {
    resObj.status_code = 400;
    resObj.message = 'Project deliverable is mandatory';
    deferred.resolve(resObj);
    return deferred.promise;
  }
  if (!_.isEmpty(req.body.deliverable)) {
    if (new Date(parseInt(req.body.deliverable.estimate, 10)).getTime() < 0) {
      resObj.status_code = 400;
      resObj.message = 'Estimate date is invalid';
      deferred.resolve(resObj);
      return deferred.promise;
    }
    if (new Date(parseInt(req.body.deliverable.agreed, 10)).getTime() < 0) {
      resObj.status_code = 400;
      resObj.message = 'Agreed date is invalid';
      deferred.resolve(resObj);
      return deferred.promise;
    }
  }
  if (!_.isEmpty(req.body.technical_leads) && (req.body.technical_leads.length > 0)) {
    const technicalLeads = req.body.technical_leads;
    for (let i = 0; i < technicalLeads.length; i++) {
      if (_.isEmpty(technicalLeads[i].id)) {
        resObj.status_code = 400;
        resObj.message = 'Technical leads id is mandatory';
        deferred.resolve(resObj);
        return deferred.promise;
      }
    }
  }
  // to make sure there are no duplicate entries
  // ! Overriding bluepage lookup
  // const technicalLeadsTemp = _.uniq(req.body.technical_leads, JSON.stringify);
  // const projectManagersTemp = _.uniq(req.body.project_managers, JSON.stringify);

  // ! Overriding bluepage lookup
  // const technicalLeads = [];
  // const projectManagers = [];

  // // create an array of promises and call the findDetails function
  // // to get the details of project managers and technical leads
  const promises = [];

  // if (!_.isEmpty(technicalLeadsTemp) && (technicalLeadsTemp.length > 0)) {
  //   for (let tlIndex = 0; tlIndex < technicalLeadsTemp.length; tlIndex++) {
  //     // TL indicates Technical Lead
  //     promises.push(findDetails(technicalLeadsTemp[tlIndex].id, 'TL'));
  //   }
  // }

  // if (!_.isEmpty(projectManagersTemp) && (projectManagersTemp.length > 0)) {
  //   for (let pmIndex = 0; pmIndex < projectManagersTemp.length; pmIndex++) {
  //     // PM indicates Project Manager
  //     promises.push(findDetails(projectManagersTemp[pmIndex].id, 'PM'));
  //   }
  // }

  q.all(promises).then((data) => {
    // get the resolved data and push details of project managers and technical leads
    // ! Overriding bluepage lookup
    // for (let j = 0; j < data.length; j++) {
    //   if (data[j].job_role === 'Project Manager') {
    //     projectManagers.push(data[j]);
    //   } else if (data[j].job_role === 'Technical Lead') {
    //     technicalLeads.push(data[j]);
    //   }
    // }
    // construct the project object to save in the database
    const project = {
      name: req.body.name,
      description: req.body.description,
      // optional field
      IPT_record: (req.body.IPT_record) ? iptLink.url + req.body.IPT_record : undefined,
      // optional field
      project_link: (req.body.project_link) ? req.body.project_link : undefined,
      status: req.body.status,
      process: req.body.process,
      geo: req.body.geo,
      technical_leads: req.body.technical_leads,
      project_managers: req.body.project_managers,
      deliverable: {
        estimate: parseInt(req.body.deliverable.estimate, 10),
        agreed: parseInt(req.body.deliverable.agreed, 10),
      },
      team: [],
      // !!! Override token created_by: decoded.iss, // project created by
      created_by: req.body.created_by, // project created by
      created_date: new Date().getTime(), // project created date
    };
    // insert the project document in the projects database.
    Model.insertDocument(Model.Databases.PROJECTS, project).then((doc) => {
      if (doc._id) {
        resObj.status_code = 201;
        resObj.message = doc._id;
        deferred.resolve(resObj);
      } else {
        resObj.status_code = 500;
        resObj.message = 'Could not save the project';
        deferred.resolve(resObj);
      }
    }, (err) => {
      resObj.status_code = 500;
      resObj.message = err;
      deferred.resolve(resObj);
    });
    return deferred.promise;
  }, (err) => {
    logger.log('error', 'Error in Project Service addProject method'.concat('---', err.message));
    resObj.status_code = 500;
    resObj.message = err;
    deferred.resolve(resObj);
  });
  return deferred.promise;
};


/*
 Author : Harish Yayi
 Description : This method is for updating a particular project
 based on the project ID provided in the request.
 Also updates the project entries in the utilizations database
 Created On : June 11, 2015
 Last Edited : August 14,2015
 Last Edited By : Harish Yayi
 */
projectService.updateProject = (req) => {
  const deferred = q.defer();
  const resObj = {};
  const token = req.headers['x-access-token'];
  // get the user who invoked the api
  const decoded = jwt.decode(token, require('../../config/secret.js')());
  const id = req.params.projectId; //  project ID
  // series of validations to check if the data is valid
  if (!_.isEmpty(req.body.deliverable)) {
    if (new Date(parseInt(req.body.deliverable.estimate, 10)).getTime() < 0) {
      resObj.status_code = 400;
      resObj.message = 'Estimate date is invalid';
      deferred.resolve(resObj);
      return deferred.promise;
    }
    if (new Date(parseInt(req.body.deliverable.agreed, 10)).getTime() < 0) {
      resObj.status_code = 400;
      resObj.message = 'Agreed date is in valid';
      deferred.resolve(resObj);
      return deferred.promise;
    }
  }
  if (!_.isEmpty(req.body.technical_leads) && (req.body.technical_leads.length > 0)) {
    const techLeads = req.body.technical_leads;
    for (let i = 0; i < techLeads.length; i++) {
      if (_.isEmpty(techLeads[i].id)) {
        resObj.status_code = 400;
        resObj.message = 'Technical lead id is mandatory';
        deferred.resolve(resObj);
        return deferred.promise;
      }
    }
  }
  if (!_.isEmpty(req.body.project_managers) && (req.body.project_managers.length > 0)) {
    const projManagers = req.body.project_managers;
    for (let i = 0; i < projManagers.length; i++) {
      if (_.isEmpty(projManagers[i].id)) {
        resObj.status_code = 400;
        resObj.message = 'Project Manager id is mandatory';
        deferred.resolve(resObj);
        return deferred.promise;
      }
    }
  }
  // retrieve the project document
  Model.retrieveDocumentsById(Model.Databases.PROJECTS, [id], true).then((projDoc) => {
    const projectDoc = projDoc;
    if (projectDoc === undefined) {
      resObj.status_code = 404;
      resObj.message = 'Project not found';
      deferred.resolve(resObj);
      return deferred.promise;
    }
    // build the project document to be updated
    const project = {};
    project.name = (req.body.name) ? req.body.name : projectDoc.name;
    project.description = req.body.description;
    project.status = (req.body.status) ? req.body.status : projectDoc.status;
    project.process = (req.body.process) ? req.body.process : projectDoc.process;
    project.geo = (req.body.geo) ? req.body.geo : projectDoc.geo;
    project.deliverable = (req.body.deliverable) ? req.body.deliverable : projectDoc.deliverable;
    // optional field
    project.IPT_record = (req.body.IPT_record) ? iptLink.url + req.body.IPT_record : undefined;
    // optional field
    project.project_link = (req.body.project_link) ? req.body.project_link : undefined;
    project.team = projectDoc.team;
    project.created_by = projectDoc.created_by;
    project.created_date = projectDoc.created_date;
    project.modified_by = decoded.iss;
    project.modified_date = new Date().getTime();
    project.managers = projectDoc.managers;
    // checking if the request body has technical leads and project managers,
    // if so get more details of them from LDAP,
    // else the technical leads and project managers remain the same

    // to make sure there are no duplicate entries
    const technicalLeadsTemp = _.uniq(req.body.technical_leads, JSON.stringify);
    const projectManagersTemp = _.uniq(req.body.project_managers, JSON.stringify);

    const technicalLeads = [];
    const projectManagers = [];

    // create an array of promises and call the findDetails function
    // to get the details of project managers and technical leads
    const promises = [];

    if (!_.isEmpty(technicalLeadsTemp) && (technicalLeadsTemp.length > 0)) {
      for (let tlIndex = 0; tlIndex < technicalLeadsTemp.length; tlIndex++) {
        // TL indicates Technical Lead
        promises.push(findDetails(technicalLeadsTemp[tlIndex].id, 'TL'));
      }
    }

    if (!_.isEmpty(projectManagersTemp) && (projectManagersTemp.length > 0)) {
      for (let pmIndex = 0; pmIndex < projectManagersTemp.length; pmIndex++) {
        // PM indicates Project Manager
        promises.push(findDetails(projectManagersTemp[pmIndex].id, 'PM'));
      }
    }

    q.all(promises).then((data) => {
      // get the resolved data and push details of project managers and technical leads
      for (let j = 0; j < data.length; j++) {
        if (data[j].job_role === 'Project Manager') {
          projectManagers.push(data[j]);
        } else if (data[j].job_role === 'Technical Lead') {
          technicalLeads.push(data[j]);
        }
        project.technical_leads = technicalLeads;
        project.project_managers = projectManagers;
      }
      // update the project
      const pRev = projectDoc._rev;
      const pId = projectDoc._id;
      Model.insertDocument(Model.Databases.PROJECTS, project, pId, pRev).then((doc) => {
        if (doc._id) {
          const query = { selector: { projects: { $elemMatch: { proj_id: id } } } };
          Model.queryDocuments(Model.Databases.UTILIZATIONS, query).then((documents) => {
            // if this particular project is is present in the utilizations database,
            // then update the project even in utilization database
            if (documents.docs.length > 0) {
              const userUtilDocs = [];
              _.each(documents.docs, (userUtil) => {
                const userUtilTemp = userUtil;
                const projects = userUtil.projects; // skills array
                for (let i = 0; i < projects.length; i++) {
                  const projElement = projects[i];
                  if (_.isMatch(projElement, { proj_id: id })) {
                    const updatedProject = {};
                    updatedProject.name = project.name;
                    updatedProject.process = project.process;
                    updatedProject.proj_id = id;
                    updatedProject.status = project.status;
                    updatedProject.utilization = projElement.utilization;
                    projects.splice(projects.indexOf(projElement), 1);
                    projects.push(updatedProject);
                    userUtilTemp.projects = projects;
                    break;
                  }
                }
                userUtilDocs.push(userUtilTemp);
              });
              // update the project in utilizations database as well.
              Model.bulk(Model.Databases.UTILIZATIONS, { docs: userUtilDocs }).then(() => {
                resObj.status_code = 204;
                resObj.message = projDoc._id;
                deferred.resolve(resObj);
                return deferred.promise;
              }, () => {
                // if error
                const db = Model.Databases.PROJECTS;
                Model.destroyDocument(db, doc._id, doc._rev).then((resDoc) => {
                  if (resDoc.ok) {
                    delete projectDoc._rev;
                    Model.insertDocument(Model.Databases.PROJECTS, projectDoc).then(() => {
                      resObj.status_code = 500;
                      resObj.message = 'Could not save the project';
                      deferred.resolve(resObj);
                      return deferred.promise;
                    });
                  }
                });
              });
            } else {
              // if this particular project id is not present in utilizations database,
              // just send the response
              resObj.status_code = 204;
              resObj.message = projDoc._id;
              deferred.resolve(resObj);
              return deferred.promise;
            }
            return deferred.promise;
          }, () => {
            Model.destroyDocument(Model.Databases.PROJECTS, doc._id, doc._rev).then((resDoc) => {
              if (resDoc.ok) {
                delete projectDoc._rev;
                const projectDB = Model.Databases.PROJECTS;
                Model.insertDocument(projectDB, projectDoc).then((reInsertedProj) => {
                  if (reInsertedProj._id) {
                    resObj.status_code = 500;
                    resObj.message = 'Could not save the project';
                    deferred.resolve(resObj);
                    return deferred.promise;
                  }
                  return deferred.promise;
                });
              }
            });
          });
        } else {
          resObj.status_code = 500;
          resObj.message = 'Could not save the project';
          deferred.resolve(resObj);
          return deferred.promise;
        }
        return deferred.promise;
      }, () => {
        resObj.status_code = 500;
        resObj.message = 'Could not save the project';
        deferred.resolve(resObj);
        return deferred.promise;
      });
    });
    return deferred.promise;
  }, () => {
    resObj.status_code = 500;
    resObj.message = 'Could not retrieve the project';
    deferred.resolve(resObj);
    return deferred.promise;
  });
  return deferred.promise;
};


/*
 Author : Harish Yayi
 Description : This method is deleting a particular project
 based on the project ID supplied in the request.
 It also deletes the project entries in the utilizations database.
 Created On : June 11, 2015
 Last Edited : August 14,2015
 Last Edited By : Harish Yayi
 */
projectService.deleteProject = (req) => {
  const deferred = q.defer();
  const resObj = {};
  const id = req.params.projectId; // project id
  Model.retrieveDocumentsById(Model.Databases.PROJECTS, [id], true).then((projectDoc) => {
    const projDoc = projectDoc;
    if (projDoc === undefined) {
      resObj.status_code = 404;
      resObj.message = 'Project not found';
      deferred.resolve(resObj);
    } else {
      const rev = projDoc._rev;
      Model.destroyDocument(Model.Databases.PROJECTS, id, rev).then((doc) => {
        // if project deleted from projects database,
        // also delete the project enteries in utilizations database
        if (doc.ok) {
          // to search for project entries in utilizations database
          const utilQuery = { selector: { projects: { $elemMatch: { proj_id: id } } } };
          Model.queryDocuments(Model.Databases.UTILIZATIONS, utilQuery).then((docs) => {
            // if there are users in this particular project,
            // delete the entries of the project in untilizations database.
            if (docs.docs.length > 0) {
              const userUtilDocs = [];
              // iterate through the user utilizations docs and remove the entries
              _.each(docs.docs, (docElement) => {
                const userUtil = docElement; // user utilization document
                const projects = userUtil.projects; // projects array
                for (let i = 0; i < projects.length; i++) {
                  const projectElement = projects[i];
                  if (_.isMatch(projectElement, { proj_id: id })) {
                    projects.splice(projects.indexOf(projectElement), 1);
                    userUtil.projects = projects;
                    break;
                  }
                }
                userUtilDocs.push(userUtil);
              });
              // bulk update the user util docs
              Model.bulk(Model.Databases.UTILIZATIONS, { docs: userUtilDocs }).then(() => {
                resObj.status_code = 204;
                deferred.resolve(resObj);
                return deferred.promise;
              }, () => {
                // if the bulk operation is failed,
                // re insert the project document in the projects databases
                delete projDoc._rev;
                Model.insertDocument(Model.Databases.PROJECTS, projDoc).then((resDoc) => {
                  if (resDoc._id) {
                    resObj.status_code = 500;
                    resObj.message = 'Could not delete the Project';
                    deferred.resolve(resObj);
                  }
                });
              });
            } else {
              // if there are no users in this particular project
              resObj.status_code = 204;
              deferred.resolve(resObj);
            }
          }, () => {
            // re insert the project document
            delete projDoc._rev;
            Model.insertDocument(Model.Databases.PROJECTS, projDoc).then((resDoc) => {
              if (resDoc._id) {
                resObj.status_code = 500;
                resObj.message = 'Could not delete the Project';
                deferred.resolve(resObj);
              }
            });
          });
        } else {
          resObj.status_code = 500;
          resObj.message = 'Could not delete the Project';
          deferred.resolve(resObj);
        }
        return deferred.promise;
      }, (err) => {
        resObj.status_code = 500;
        resObj.message = err;
        deferred.resolve(resObj);
        return deferred.promise;
      });
    }
  }, (err) => {
    resObj.status_code = 500;
    resObj.message = err;
    deferred.resolve(resObj);
    return deferred.promise;
  });
  return deferred.promise;
};


/*
 Author : Harish Yayi
 Description : This method is for retrieving the details of a particular project
 based on the project ID provided in the request.
 If an optional filter "date" is provided,then it retrieves only the team members where the
 date falls in between start_date and end-date of
 the project utilization of the team member
 and also the total hours of the project is also calculated based on that.
 Created On : June 11, 2015
 Last Edited : November 18,2015
 Last Edited By : Harish Yayi
 */
projectService.getProject = (req) => {
  const deferred = q.defer();
  const resObj = {};
	// get the project ID from the url
  const id = req.params.projectId;
	// creating a new json document to send it in the response by custom building it.
  const projDoc = {};
  const manager = req.query.manager;
  let teamArray = [];
	// get the range- today,last30days, last90days, next30days, next90days, alltime,uptotoday
  let range = req.query.range;
  if ((range === '' || range === undefined)) {
    range = 'today';
  }
  function checkIDInTeam(team, _id) {
    for (let i = 0; i < team.length; i++) {
      if (team[i].id === _id) {
        return i;
      }
    }
    return -1;
  }

  // validate range
  if (!_.isEmpty(range)) {
    const preDefinedRanges = ['today',
                              'alltime',
                              'uptotoday',
                              'next30days',
                              'next90days',
                              'last30days',
                              'last90days'];
    if (preDefinedRanges.indexOf(range) === -1) {
      resObj.status_code = 400;
      resObj.message = 'Please specify the range parameter properly';
      deferred.resolve(resObj);
      return deferred.promise;
    }
  }

  // utility function
  function calUtil(start, end, percentage) {
    return ((((end - start) / (1000 * 60 * 60 * 24 * 7)) * 40) * (percentage) / 100);
  }

  let hours = 0;

  function calculateForToday(utilElement, teamMember) {
    const dateObj = new Date(); // get the current utilization
    dateObj.setHours(0);
    dateObj.setMinutes(0);
    dateObj.setSeconds(0);
    dateObj.setMilliseconds(0);
    const currDate = dateObj.getTime();
    if ((currDate >= utilElement.start_date) && (currDate <= utilElement.end_date)) {
      const index = checkIDInTeam(projDoc.team, teamMember.id);
      if (index !== -1) {
        projDoc.team[index].job_role.push(utilElement.job_role);
        projDoc.team[index].component.push(utilElement.component);
        projDoc.team[index].utilization.push(utilElement.percentage);
      } else {
        const temp = _.clone(teamMember);
        temp.job_role = [];
        temp.component = [];
        temp.utilization = [];
        temp.job_role.push(utilElement.job_role);
        temp.component.push(utilElement.component);
        temp.utilization.push(utilElement.percentage);
        projDoc.team.push(temp);
      }
      // calculate hours,  hours= (hours calculated)* allocation percentage
      // it is assumed that a team member can work maximum of 40hours each week
      hours = hours + ((8 * (utilElement.percentage)) / 100);
    }
  }

  function calculateForAllTime(utilElement, teamMember) {
    const index = checkIDInTeam(projDoc.team, teamMember.id);
    if (index !== -1) {
      projDoc.team[index].job_role.push(utilElement.job_role);
      projDoc.team[index].component.push(utilElement.component);
      projDoc.team[index].utilization.push(utilElement.percentage);
    } else {
      const temp = _.clone(teamMember);
      temp.job_role = [];
      temp.component = [];
      temp.utilization = [];
      temp.job_role.push(utilElement.job_role);
      temp.component.push(utilElement.component);
      temp.utilization.push(utilElement.percentage);
      projDoc.team.push(temp);
    }
    // calculate hours,  hours= (hours calculated)* allocation percentage
    // it is assumed that a team member can work maximum of 40hours each week
    hours = hours + calUtil(utilElement.start_date, utilElement.end_date, utilElement.percentage);
  }

  function calculateForUptoToday(utilElement, teamMember) {
    const actualDate = new Date();
    // get milliseconds till the end of the day
    const currDateEOD = new Date(actualDate.getFullYear()
      , actualDate.getMonth()
      , actualDate.getDate()
      , 23, 59, 59).getTime();
    // calculate previous utilization
    if ((currDateEOD > utilElement.end_date)) {
      const index = checkIDInTeam(projDoc.team, teamMember.id);
      if (index !== -1) {
        projDoc.team[index].job_role.push(utilElement.job_role);
        projDoc.team[index].component.push(utilElement.component);
        projDoc.team[index].utilization.push(utilElement.percentage);
      } else {
        const temp = _.clone(teamMember);
        temp.job_role = [];
        temp.component = [];
        temp.utilization = [];
        temp.job_role.push(utilElement.job_role);
        temp.component.push(utilElement.component);
        temp.utilization.push(utilElement.percentage);
        projDoc.team.push(temp);
      }
      // calculate hours,  hours= (hours calculated)* allocation percentage
      // it is assumed that a team member can work maximum of 40hours each week
      hours = hours + calUtil(utilElement.start_date, utilElement.end_date, utilElement.percentage);
    }
    // calculate current utilization
    if ((currDateEOD >= utilElement.start_date) && (currDateEOD <= utilElement.end_date)) {
      const index = checkIDInTeam(projDoc.team, teamMember.id);
      if (index !== -1) {
        projDoc.team[index].job_role.push(utilElement.job_role);
        projDoc.team[index].component.push(utilElement.component);
        projDoc.team[index].utilization.push(utilElement.percentage);
      } else {
        const temp = _.clone(teamMember);
        temp.job_role = [];
        temp.component = [];
        temp.utilization = [];
        temp.job_role.push(utilElement.job_role);
        temp.component.push(utilElement.component);
        temp.utilization.push(utilElement.percentage);
        projDoc.team.push(temp);
      }
      hours = hours + calUtil(utilElement.start_date, currDateEOD, utilElement.percentage);
    }
  }

  function calculateForLastDays(utilElement, teamMember, scope) {
    let days = 0;
    if (scope.indexOf('last30days') === 0) {
      days = 30;
    } else if (scope.indexOf('last90days') === 0) {
      days = 90;
    }
    const actualDate = new Date();
    // get milliseconds till the end of the day
    const currDateEOD = new Date(actualDate.getFullYear()
      , actualDate.getMonth()
      , actualDate.getDate()
      , 23, 59, 59).getTime();
    // get milliseconds for 23hours,59mins,59secs
    const millisec = (23 * 60 * 60 * 1000) + (59 * 60 * 1000) + (59 * 1000);
    // get milliseconds of the day which is 30days before the current date
    const startDate = moment(currDateEOD).subtract(days, 'days').valueOf() - millisec;
    if (startDate >= utilElement.start_date && currDateEOD <= utilElement.end_date) {
      // if utilization range contains 30days range
      // utilElement.start_date                utilElement.end_date
      // v                                        v
      // #----------------------------------------#
      //
      //         #----------------------#
      //         ^                      ^
      //         startDate              currDateEOD
      const index = checkIDInTeam(projDoc.team, teamMember.id);
      if (index !== -1) {
        projDoc.team[index].job_role.push(utilElement.job_role);
        projDoc.team[index].component.push(utilElement.component);
        projDoc.team[index].utilization.push(utilElement.percentage);
      } else {
        const temp = _.clone(teamMember);
        temp.job_role = [];
        temp.component = [];
        temp.utilization = [];
        temp.job_role.push(utilElement.job_role);
        temp.component.push(utilElement.component);
        temp.utilization.push(utilElement.percentage);
        projDoc.team.push(temp);
      }
      // calculate hours,  hours= (hours calculated)* allocation percentage
      // it is assumed that a team member can work maximum of 40hours each week
      hours = hours + calUtil(startDate, currDateEOD, utilElement.percentage);
    } else if (utilElement.start_date >= startDate && utilElement.end_date <= currDateEOD) {
      // if 30days range contains utilization range
      // startDate                            currDateEOD
      // v                                        v
      // #----------------------------------------#
      //
      //         #----------------------#
      //         ^                      ^
      // utilElement.start_date      utilElement.end_date
      const index = checkIDInTeam(projDoc.team, teamMember.id);
      if (index !== -1) {
        projDoc.team[index].job_role.push(utilElement.job_role);
        projDoc.team[index].component.push(utilElement.component);
        projDoc.team[index].utilization.push(utilElement.percentage);
      } else {
        const temp = _.clone(teamMember);
        temp.job_role = [];
        temp.component = [];
        temp.utilization = [];
        temp.job_role.push(utilElement.job_role);
        temp.component.push(utilElement.component);
        temp.utilization.push(utilElement.percentage);
        projDoc.team.push(temp);
      }
      // calculate hours,  hours= (hours calculated)* allocation percentage
      // it is assumed that a team member can work maximum of 40hours each week
      hours = hours + calUtil(utilElement.start_date, utilElement.end_date, utilElement.percentage);
    } else if (startDate >= utilElement.start_date && startDate <= utilElement.end_date) {
      // utilElement.start_date     utilElement.end_date
      //                  v                v
      //                  #----------------#
      //
      //                          #----------------------#
      //                          ^                      ^
      //                          startDate              currDateEOD
      const index = checkIDInTeam(projDoc.team, teamMember.id);
      if (index !== -1) {
        projDoc.team[index].job_role.push(utilElement.job_role);
        projDoc.team[index].component.push(utilElement.component);
        projDoc.team[index].utilization.push(utilElement.percentage);
      } else {
        const temp = _.clone(teamMember);
        temp.job_role = [];
        temp.component = [];
        temp.utilization = [];
        temp.job_role.push(utilElement.job_role);
        temp.component.push(utilElement.component);
        temp.utilization.push(utilElement.percentage);
        projDoc.team.push(temp);
      }
      // calculate hours,  hours= (hours calculated)* allocation percentage
      // it is assumed that a team member can work maximum of 40hours each week
      hours = hours + calUtil(startDate, utilElement.end_date, utilElement.percentage);
    } else if (utilElement.start_date >= startDate && utilElement.start_date <= currDateEOD) {
      // utilElement.start_date        utilElement.end_date
      //                 v                v
      //                 #----------------#
      //
      //         #------------------#
      //         ^                  ^
      //       startDate            currDateEOD
      const index = checkIDInTeam(projDoc.team, teamMember.id);
      if (index !== -1) {
        projDoc.team[index].job_role.push(utilElement.job_role);
        projDoc.team[index].component.push(utilElement.component);
        projDoc.team[index].utilization.push(utilElement.percentage);
      } else {
        const temp = _.clone(teamMember);
        temp.job_role = [];
        temp.component = [];
        temp.utilization = [];
        temp.job_role.push(utilElement.job_role);
        temp.component.push(utilElement.component);
        temp.utilization.push(utilElement.percentage);
        projDoc.team.push(temp);
      }
      // calculate hours,  hours= (hours calculated)* allocation percentage
      // it is assumed that a team member can work maximum of 40hours each week
      hours = hours + calUtil(utilElement.start_date, currDateEOD, utilElement.percentage);
    }
  }

  function calculateForNextDays(utilElement, teamMember, scope) {
    let days = 0;
    if (scope.indexOf('next30days') === 0) {
      days = 30;
    } else if (scope.indexOf('next90days') === 0) {
      days = 90;
    }
    const actualDate = new Date();
    // get milliseconds till the end of the day
    const currDate = new Date(actualDate.getFullYear()
      , actualDate.getMonth()
      , actualDate.getDate() + 1).getTime();
    // get milliseconds for 23hours,59mins,59secs
    const millisec = (23 * 60 * 60 * 1000) + (59 * 60 * 1000) + (59 * 1000);
    // get milliseconds of the day which is 30days before the current date
    const endDateEOD = moment(currDate).add(days, 'days').valueOf() + millisec;
    if (currDate >= utilElement.start_date && endDateEOD <= utilElement.end_date) {
      // if utilization range contains 30days range
      // utilElement.start_date                utilElement.end_date
      // v                                        v
      // #----------------------------------------#
      //
      //         #----------------------#
      //         ^                      ^
      //         currDate          endDateEOD
      const index = checkIDInTeam(projDoc.team, teamMember.id);
      if (index !== -1) {
        projDoc.team[index].job_role.push(utilElement.job_role);
        projDoc.team[index].component.push(utilElement.component);
        projDoc.team[index].utilization.push(utilElement.percentage);
      } else {
        const temp = _.clone(teamMember);
        temp.job_role = [];
        temp.component = [];
        temp.utilization = [];
        temp.job_role.push(utilElement.job_role);
        temp.component.push(utilElement.component);
        temp.utilization.push(utilElement.percentage);
        projDoc.team.push(temp);
      }
      // calculate hours,  hours= (hours calculated)* allocation percentage
      // it is assumed that a team member can work maximum of 40hours each week
      hours = hours + calUtil(currDate, endDateEOD, utilElement.percentage);
    } else if (utilElement.start_date >= currDate && utilElement.end_date <= endDateEOD) {
      // if 30days range contains utilization range
      // currDate                            endDateEOD
      // v                                        v
      // #----------------------------------------#
      //
      //         #----------------------#
      //         ^                      ^
      // utilElement.start_date      utilElement.end_date
      const index = checkIDInTeam(projDoc.team, teamMember.id);
      if (index !== -1) {
        projDoc.team[index].job_role.push(utilElement.job_role);
        projDoc.team[index].component.push(utilElement.component);
        projDoc.team[index].utilization.push(utilElement.percentage);
      } else {
        const temp = _.clone(teamMember);
        temp.job_role = [];
        temp.component = [];
        temp.utilization = [];
        temp.job_role.push(utilElement.job_role);
        temp.component.push(utilElement.component);
        temp.utilization.push(utilElement.percentage);
        projDoc.team.push(temp);
      }
      // calculate hours,  hours= (hours calculated)* allocation percentage
      // it is assumed that a team member can work maximum of 40hours each week
      hours = hours + calUtil(utilElement.start_date, utilElement.end_date, utilElement.percentage);
    } else if (currDate >= utilElement.start_date && currDate <= utilElement.end_date) {
      // utilElement.start_date     utilElement.end_date
      //                  v                v
      //                  #----------------#
      //
      //                          #----------------------#
      //                          ^                      ^
      //                          currDate              endDateEOD
      const index = checkIDInTeam(projDoc.team, teamMember.id);
      if (index !== -1) {
        projDoc.team[index].job_role.push(utilElement.job_role);
        projDoc.team[index].component.push(utilElement.component);
        projDoc.team[index].utilization.push(utilElement.percentage);
      } else {
        const temp = _.clone(teamMember);
        temp.job_role = [];
        temp.component = [];
        temp.utilization = [];
        temp.job_role.push(utilElement.job_role);
        temp.component.push(utilElement.component);
        temp.utilization.push(utilElement.percentage);
        projDoc.team.push(temp);
      }
      // calculate hours,  hours= (hours calculated)* allocation percentage
      // it is assumed that a team member can work maximum of 40hours each week
      hours = hours + calUtil(currDate, utilElement.end_date, utilElement.percentage);
    } else if (utilElement.start_date >= currDate && utilElement.start_date <= endDateEOD) {
      // utilElement.start_date        utilElement.end_date
      //                 v                v
      //                 #----------------#
      //
      //         #------------------#
      //         ^                  ^
      //       currDate          endDateEOD
      const index = checkIDInTeam(projDoc.team, teamMember.id);
      if (index !== -1) {
        projDoc.team[index].job_role.push(utilElement.job_role);
        projDoc.team[index].component.push(utilElement.component);
        projDoc.team[index].utilization.push(utilElement.percentage);
      } else {
        const temp = _.clone(teamMember);
        temp.job_role = [];
        temp.component = [];
        temp.utilization = [];
        temp.job_role.push(utilElement.job_role);
        temp.component.push(utilElement.component);
        temp.utilization.push(utilElement.percentage);
        projDoc.team.push(temp);
      }
      // calculate hours,  hours= (hours calculated)* allocation percentage
      // it is assumed that a team member can work maximum of 40hours each week
      hours = hours + calUtil(utilElement.start_date, endDateEOD, utilElement.percentage);
    }
  }


  function findTeamMemberUtilization(query, teamMember) {
    const deferredU = q.defer();
    Model.queryDocuments(Model.Databases.UTILIZATIONS, query).then((docs) => {
      // get project utilization of each team member
      if (docs.docs.length !== 0) {
        const project = _.findWhere(docs.docs[0].projects, { proj_id: id });
        const utilizationArray = project.utilization;
        for (let j = 0; j < utilizationArray.length; j++) {
          const utilElement = utilizationArray[j];
          if (!_.isEmpty(range) && range.indexOf('today') === 0) {
            // today
            calculateForToday(utilElement, teamMember);
          } else if (!_.isEmpty(range) && range.indexOf('alltime') === 0) {
            // upto today
            calculateForAllTime(utilElement, teamMember);
          } else if (!_.isEmpty(range) && range.indexOf('uptotoday') === 0) {
            // upto today
            calculateForUptoToday(utilElement, teamMember);
          } else if (!_.isEmpty(range) && range.indexOf('last') === 0) {
            // last 30/90 days
            calculateForLastDays(utilElement, teamMember, range);
          } else if (!_.isEmpty(range) && range.indexOf('next') === 0) {
            // next 30/90 days
            calculateForNextDays(utilElement, teamMember, range);
          }
        }
      }
      deferredU.resolve();
    }, (err) => {
      logger.log('error', 'Error in getProjects method in Projects Service'.concat('---', err));
      deferredU.resolve(err);
    });
    return deferredU.promise;
  }

  // get project details
  Model.retrieveDocumentsById(Model.Databases.PROJECTS, [id], true).then((doc) => {
    if (doc === undefined) {
      resObj.status_code = 404;
      resObj.message = 'Project not found';
      deferred.resolve(resObj);
    } else {
      // build the project details document
      projDoc._id = doc._id;
      projDoc.name = doc.name;
      projDoc.description = doc.description;
      projDoc.IPT_record = doc.IPT_record;
      projDoc.status = doc.status;
      projDoc.process = doc.process;
      projDoc.geo = doc.geo;
      projDoc.technical_leads = doc.technical_leads;
      projDoc.project_managers = doc.project_managers;
      projDoc.deliverable = doc.deliverable;
      projDoc.project_link = doc.project_link;
      projDoc.team = [];
      // if date filter is not provided,
      // return the team array without calculating the utilization
      // and also people count in the project
      if (!range) {
        projDoc.team = doc.team;
        projDoc.people_count = doc.team.length; // total number of people in the project
      }
      teamArray = doc.team;

      const promises = [];
      for (let i = 0; i < teamArray.length; i++) {
        const teamMemberID = teamArray[i].id.toLowerCase();
        const query = {
          selector: {
            projects: { $elemMatch: { proj_id: id } }, user_id: teamMemberID,
            reports_to: (!_.isEmpty(manager) && manager !== 'all') ? manager : undefined,
          },
          fields: ['_id', 'projects'],
        };
        promises.push(findTeamMemberUtilization(query, teamArray[i]));
      }

      q.all(promises).then(() => {
        for (let p = 0; p < projDoc.team.length; p++) {
          if (projDoc.team[p].job_role.length > 0) {
            projDoc.team[p].job_role = _.uniq(projDoc.team[p].job_role).toString();
          } else {
            projDoc.team[p].job_role = '';
          }
          let component = _.uniq(projDoc.team[p].component);
          component = component.filter((v) => {
            if (v !== '') {
              return true;
            }
            return false;
          });
          projDoc.team[p].component = component.toString();
          let utilizationSum = 0;
          const teamMemberUtilization = projDoc.team[p].utilization;
          for (let u = 0; u < teamMemberUtilization.length; u++) {
            utilizationSum = utilizationSum + teamMemberUtilization[u];
          }
          projDoc.team[p].utilization = (utilizationSum / teamMemberUtilization.length).toFixed(1);
        }
        projDoc.total_hours = Math.round(hours);
        projDoc.people_count = projDoc.team.length;
        resObj.status_code = 200;
        resObj.message = {
          kind: 'Resource#ProjectDetails',
          item: projDoc,
        };
        deferred.resolve(resObj);
        return deferred.promise;
      }, (err) => {
        deferred.resolve(err);
        return deferred.promise;
      });
    }
  }, () => {
    resObj.status_code = 500;
    resObj.message = 'Could not retrieve the project details';
    deferred.resolve(resObj);
    return deferred.promise;
  });
  return deferred.promise;
};


/*
 Author : Harish Yayi
 Description : This method is for retrieving projects in the projects database.
 If the sort is provided as "UTIL_DESC",
 then this method sorts the projects in descending order of total hours of the project.
 If the user parameter is provided in the url,
 then this method only looks for projects with the user as the team member in it.
 If the manager parameter is provided in the url,
 then this method only looks for projects that is owned by the searched manager.
 Created On : June 11, 2015
 Last Edited : January 06,2015
 Last Edited By : Caesar Cavales
 */
projectService.getProjects = (req) => {
  const deferred = q.defer();
  const resObj = {};
  // creating a new json document to send it in the response by custom building it.
  const finalDoc = {};
  finalDoc.kind = 'Resource#ProjectsList';
  finalDoc.pageInfo = {};
  finalDoc.items = [];
  let items = [];
  // get the query parameters
  let parts = req.query.parts; // can be name,status,totalhours,totalpeople
  const limit = req.query.limit;
  let offset = req.query.offset;
  const sortParameter = req.query.sort; // value can only be "UTIL_DESC"
  const treeMap = req.query.treemap; // value can only be "true"
  const manager = req.query.manager;
  // get the range- today,last30days, last90days, next30days, next90days, alltime,uptotoday
  let range = req.query.range;
  // method to sort the JSON array of objects by a particular attribute
  function predicatBy(prop) {
    return (a, b) => {
      if (a[prop] > b[prop]) {
        return -1;
      } else if (a[prop] < b[prop]) {
        return 1;
      }
      return 0;
    };
  }

  // validations
  if (offset === undefined || offset === '') {
    offset = 0; // defaulted to 0 if not provided
  }
  if (isNaN(offset)) {
    resObj.status_code = 400;
    resObj.message = 'Please specify offset as a positive integer greater than or equal to 0';
    deferred.resolve(resObj);
    return deferred.promise;
  }
  if (!_.isEmpty(sortParameter) && sortParameter.indexOf('UTIL_DESC') === -1) {
    resObj.status_code = 400;
    resObj.message = 'sort parameter should be UTIL_DESC';
    deferred.resolve(resObj);
    return deferred.promise;
  }
  if (!_.isEmpty(treeMap) && treeMap.indexOf('true') === -1) {
    resObj.status_code = 400;
    resObj.message = 'treemap parameter should be true';
    deferred.resolve(resObj);
    return deferred.promise;
  }
  // validate parts
  if (req.query.parts === undefined || parts === '' || parts.indexOf('()') >= 0) {
    parts = 'name,status,totalhours,totalpeople';
  } else {  // validate parts
    const preDefinedParts = ['name', 'status', 'totalhours', 'totalpeople'];
    let temp = parts.substring(1, parts.length - 1).split(',');
    let errCount = 0;
    temp = temp.sort();
    for (let tempIndex = 0; tempIndex < temp.length; tempIndex++) {
      if (preDefinedParts.indexOf(temp[tempIndex]) < 0) {
        errCount++;
      }
    }
    if (temp.length > 4 || errCount > 0) {
      resObj.status_code = 400;
      resObj.message = 'Please specify the parts parameter properly';
      deferred.resolve(resObj);
      return deferred.promise;
    }
  }
  if ((range === '' && !_.isEmpty(treeMap) && treeMap.indexOf('true') >= 0)
    || range === undefined) {
    range = 'today';
  }
  // validate range
  if (!_.isEmpty(range)) {
    const preDefinedRanges = ['today',
                              'alltime',
                              'uptotoday',
                              'next30days',
                              'next90days',
                              'last30days',
                              'last90days'];
    if (preDefinedRanges.indexOf(range) === -1) {
      resObj.status_code = 400;
      resObj.message = 'Please specify the range parameter properly';
      deferred.resolve(resObj);
      return deferred.promise;
    }
  }

  let params = '';
  if (manager !== 'all') {
    params = { start_key: [manager], end_key: [manager, {}], include_docs: false };
  }

  // queries view to get all the projects from the projects database.
  Model.queryView(Model.Databases.PROJECTS, 'projectsView1', params).then((documents) => {
    const projects = documents.rows;
    // if no projects found
    if (projects.length === 0) {
      finalDoc.pageInfo.totalResults = 0;
      finalDoc.pageInfo.resultsPerPage = 0;
      resObj.status_code = 200;
      resObj.message = finalDoc;
      deferred.resolve(resObj);
      return deferred.promise;
    } else if (projects.length > 0) {
      let viewName = '';
      // Based on the range parameter, viewName is assigned.
      if (range === 'today') {
        viewName = 'today';
      } else if (range === 'alltime') {
        viewName = 'alltime';
      } else if (range === 'uptotoday') {
        viewName = 'uptotoday';
      } else if (range === 'last30days') {
        viewName = 'last30days';
      } else if (range === 'last90days') {
        viewName = 'last90days';
      } else if (range === 'next30days') {
        viewName = 'next30days';
      } else if (range === 'next90days') {
        viewName = 'next90days';
      } else { // if none of the above, default the viewName to today
        viewName = 'today';
      }
      let queryParams = {};
      // we have a composite key of type [projectid,managerid]
      // If the manager parameter is present in the url, we do groupby of entire composite key
      if (manager !== 'all') {
        queryParams = { reduce: true, group: true };
      } else {
        // If the manager paramater is undefined or all,
        // then we do groupby of only projectid, hence group_level=1
        queryParams = { reduce: true, group_level: 1 };
      }
      Model.queryView(Model.Databases.UTILIZATIONS, viewName, queryParams, true).then((docs) => {
        const utilDocs = docs.rows;
        for (let projectIndex = 0; projectIndex < projects.length; projectIndex++) {
          let projUtil = {};
          // Find if the project entry is present in the utilizatons databse.
          if (manager !== 'all') {
            projUtil = _.find(utilDocs, (utilDoc) => {
              if (utilDoc.key[0] === projects[projectIndex].id && utilDoc.key[1] === manager) {
                return true;
              }
              return false;
            });
          } else {
            projUtil = _.find(utilDocs, (utilDoc) => {
              if (utilDoc.key[0] === projects[projectIndex].id) {
                return true;
              }
              return false;
            });
          }
          const project = {};
          // If the project is found in the utilizations database,
          // we build the project object and push it to items array
          if (projUtil) {
            project.proj_id = projects[projectIndex].id;
            project.name = projects[projectIndex].value.name;
            project.status = projects[projectIndex].value.status;
            project.people_count = projUtil.value.people;
            project.total_hours = Math.round(projUtil.value.hours);
          } else {
            // If the project is not found,
            // that means that there is no entry of the project in the utilizations db,
            // hence peopel_count and total_hours are 0
            project.proj_id = projects[projectIndex].id;
            project.name = projects[projectIndex].value.name;
            project.status = projects[projectIndex].value.status;
            project.people_count = 0;
            project.total_hours = 0;
          }
          items.push(project);
        }
        finalDoc.pageInfo.totalResults = items.length; // assigning total number of results
        // assigning the limit
        if (limit === undefined || isNaN(limit) || limit === '') {
          finalDoc.pageInfo.resultsPerPage = documents.rows.length;
        } else {
          finalDoc.pageInfo.resultsPerPage = limit;
        }
        if (!_.isEmpty(sortParameter) && sortParameter.indexOf('UTIL_DESC') >= 0) {
          // sort the items array by total hours in descending order.
          items = items.sort(predicatBy('total_hours'));
        }
        if (!_.isEmpty(treeMap) && treeMap.indexOf('true') >= 0) {
          // sort the items array by total hours in descending order
          items = items.sort(predicatBy('total_hours'));
          const percent = 5;
          const maxTotalHoursProject = items[0].total_hours;
          // calculate the threshold hours based on the project with highest total hours
          const thresholdHours = (maxTotalHoursProject / 100) * percent;
          let l = 0;
          for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            if (items[itemIndex].total_hours > thresholdHours) {
              items[l] = items[itemIndex];
              l++;
            }
          }
          // remove the projects with total hours less than threshold hours
          items = items.slice(0, l);
          finalDoc.pageInfo.totalResults = items.length;
          if (limit === undefined || isNaN(limit) || limit === '') {
            finalDoc.pageInfo.resultsPerPage = items.length;
          } else {
            finalDoc.pageInfo.resultsPerPage = limit;
          }
        }
        // slice the items to the limit mentioned
        if (limit === undefined || isNaN(limit) || limit === '') {
          finalDoc.items = items.slice(parseInt(offset, 10));
        } else {
          finalDoc.items = items.slice(parseInt(offset, 10),
                                        parseInt(limit, 10) + parseInt(offset, 10));
        }
        resObj.status_code = 200;
        resObj.message = finalDoc;
        deferred.resolve(resObj);
        return deferred.promise;
      }, (err) => {
        logger.log('error', 'Error in getProjects method in Projects Service'.concat('---', err));
        resObj.status_code = 500;
        resObj.message = err;
        deferred.resolve(resObj);
        return deferred.promise;
      });
    }
    return deferred.promise;
  }, (err) => {
    logger.log('error', 'Error in getProjects method in Projects Service'.concat('---', err));
    resObj.status_code = 500;
    resObj.message = 'Could not retrieve projects';
    deferred.resolve(resObj);
    return deferred.promise;
  });
  return deferred.promise;
};
