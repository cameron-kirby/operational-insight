/*
 Author : Harish Yayi
 Description : This file contains the method which gets the data from database got dropdowns.
 List of dropdowns :
 1)Project geo 2) Project process 3)Project status 4)Roles 5)Employee status 6)Employee type
 7)Job roles
 Created On : June 11, 2015
 Last Edited : July 8, 2015
 Last Edited By : Harish Yayi
 */

var Model = require('../models/Model');
var q = require('q');
var async = require('async');
var _ = require('underscore');

module.exports.getDropdown = function (req, res) {
    var filter = req.query.filter;
    var responseDoc = {};
    responseDoc.kind='';
    responseDoc.items = [];
    var query = "";
    var dbName = "";
    var isView = false;
    var indexName = "";
    var params = "";

    if(_.isEmpty(filter))
    {
        res.status(400).json({'error_code': 400, 'message': "Filter parameter is mandatory"});
        return;
    }
    if (filter.indexOf('projectgeo')>=0) {
        responseDoc.kind = "Resource#ProjectGeoList"
        query = {selector: {_id: {$gt: 0}, name: {$regex: "^.*"}}};
        dbName = Model.Databases.PROJECT_GEO;
    }
    else if(filter.indexOf('projectprocess')>=0)
    {
        responseDoc.kind = "Resource#ProjectProcessList"
        query = {selector: {_id: {$gt: 0}, name: {$regex: "^.*"}}};
        dbName = Model.Databases.PROJECT_PROCESS;
    }
    else if(filter.indexOf('projectstatus')>=0)
    {
        responseDoc.kind = "Resource#ProjectStatusList"
        query = {selector: {_id: {$gt: 0}, name: {$regex: "^.*"}}};
        dbName = Model.Databases.PROJECT_STATUS;
    }
    else if(filter=='roles')
    {
        responseDoc.kind = "Resource#RolesList"
        query = {selector: {_id: {$gt: 0}, name: {$regex: "^.*"}}};
        dbName = Model.Databases.ROLES;
    }
    else if(filter.indexOf('employeestatus')>=0)
    {
        responseDoc.kind = "Resource#EmployeeStatusList"
        query = {selector: {_id: {$gt: 0}, name: {$regex: "^.*"}}};
        dbName = Model.Databases.EMPLOYEE_STATUS;
    }
    else if(filter.indexOf('employeetype')>=0)
    {
        responseDoc.kind = "Resource#EmployeeTypesList"
        query = {selector: {_id: {$gt: 0}, name: {$regex: "^.*"}}};
        dbName = Model.Databases.EMPLOYEE_TYPE;
    }
    else if(filter.indexOf('jobroles')>=0)
    {
        responseDoc.kind = "Resource#JobRolesList"
        query = {selector: {_id: {$gt: 0}, name: {$regex: "^.*"}}};
        dbName = Model.Databases.JOB_ROLES;
    }
    else if(filter.indexOf('projects')>=0)
    {
      isView = true;
      responseDoc.kind = "Resource#ProjectsList"
      dbName = Model.Databases.PROJECTS;
      indexName = "all";
      params = "all";
    }
    else
    {
        res.status(400).json({'error_code': 400, 'message': "Please specify the parts parameter properly as per the specifications"});
        return;
    }

    if(!isView) {
      // query to retrieve all the documents whose _id greater than 0 and name attribute exists
      Model.queryDocuments(dbName, query).then(function (documents) {
          var dropdownList = documents.docs;
          if (dropdownList.length == 0) // if no resources found
          {
              res.status(200).json(responseDoc);
              return;
          }
          else if (dropdownList.length > 0) {
              responseDoc.items = dropdownList;
              res.status(200).json(responseDoc);
              return;
          }
      }, function (err) {
          res.status(500).json({'error_code': 500, 'message': "Could not find the resource"});
          return;
      });
    }
    else if (isView)
    {
      Model.queryView(dbName, indexName, params).then(function (documents) {
        var dropdownList = documents.rows;
        if (dropdownList.length == 0) // if no resources found
        {
          res.status(200).json(responseDoc);
          return;
        }
        else if (dropdownList.length > 0) {
          //if getting project list dropdown, filter only needed fields
          if (filter.indexOf('projects')>=0) {
            var projDocs = [];

            _.each(dropdownList, function(project, key) {
              var projObj = {};

              projObj.proj_id = project.doc._id;
              projObj.name = project.doc.name;

              projDocs.push(projObj);
            });

            responseDoc.items = projDocs;
          }

          res.status(200).json(responseDoc);
          return;
        }
      }, function (err) {
        res.status(500).json({'error_code': 500, 'message': "Could not find the resource"});
        return;
      });
    }
    else
    {
      console.log("isView not defined");
    }
}
