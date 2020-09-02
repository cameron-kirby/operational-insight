'use strict';

const express = require('express');

const auth = require('./auth.js');
const projectController = require('../controllers/Projects');
const userController = require('../controllers/Users');
const dropdownController = require('../controllers/Dropdown');
const searchController = require('../controllers/Search');
const newsFeedController = require('../controllers/NewsFeed');
const projectStatusController = require('../controllers/ProjectStatus');
const projectProcessController = require('../controllers/ProjectProcess');
const projectGeoController = require('../controllers/ProjectGeo');
const managersController = require('../controllers/Managers');


class Router {
  constructor(categoriesController,
    jobRolesController,
    schedulerController,
    skillsController,
    utilizationsController) {
    this.router = new express.Router();

    /*
    * Routes that can be accessed by any one
    */
    this.router.post('/login', auth.login); // login API

    /*
    * Routes related to Projects module
    */
    this.router.get('/rest/v1/projects', projectController.getProjects); // Get Projects
    this.router.get('/rest/v1/projects/:projectId', projectController.getProject); // Get Project
    this.router.post('/rest/v1/projects', projectController.add); // Add Project
    this.router.put('/rest/v1/projects/:projectId', projectController.update); // Update Project
    this.router.delete('/rest/v1/admin/projects/:projectId',
      projectController.delete); // Delete Project

    /*
    * Routes related to Users module
    */
    this.router.get('/rest/v1/users', userController.findAll);
    this.router.get('/rest/v1/users/:id', userController.findOne);
    this.router.post('/rest/v1/users/', userController.add);
    this.router.put('/rest/v1/users/:id', userController.update);
    this.router.delete('/rest/v1/admin/users/:id', userController.delete);
    this.router.get('/rest/v1/users/isExist/:id', userController.isExist);
    this.router.put('/rest/v1/users/:id/validateUtilization',
      utilizationsController.validate.bind(utilizationsController));

    /*
    * Routes related to Skills module
    */
    this.router.get('/rest/v1/skills',
      skillsController.getSkills.bind(skillsController)); // Get Skills
    this.router.get('/rest/v1/skills/:skillId',
      skillsController.getSkill.bind(skillsController)); // Get Skill
    this.router.post('/rest/v1/admin/skills',
      skillsController.add.bind(skillsController)); // Add Skill
    this.router.put('/rest/v1/admin/skills/:skillId',
      skillsController.update.bind(skillsController)); // Update Skill
    this.router.delete('/rest/v1/admin/skills/:skillId',
      skillsController.delete.bind(skillsController)); // Delete Skill

    /*
    * Route related to dropdown module
    */
    this.router.get('/rest/v1/dropdown', dropdownController.getDropdown); // Get project geos

    /*
    * Route related to search module
    */
    this.router.get('/rest/v1/search',
      searchController.searchProjectsPeopleSkills); // Get employee types

    /*
    * Routes related to Skills module
    */
    this.router.get('/rest/v1/newsfeeds', newsFeedController.getNewsFeeds); // Get Newsfeeds
    this.router.get('/rest/v1/newsfeeds/:newsfeedId',
      newsFeedController.getNewsFeed); // Get newsfeed
    this.router.post('/rest/v1/admin/newsfeeds', newsFeedController.add); // Add newsfeed
    this.router.put('/rest/v1/admin/newsfeeds/:newsfeedId',
      newsFeedController.update); // Update newsfeed

    /*
    * Routes related to skill categories module
    */
    this.router.post('/rest/v1/admin/categories',
      categoriesController.add.bind(categoriesController)); // Add skill category
    this.router.delete('/rest/v1/admin/categories/:categoryId',
      categoriesController.delete.bind(categoriesController)); // Delete skill category
    this.router.get('/rest/v1/admin/categories',
      categoriesController.getCategories.bind(categoriesController)); // Get Categories
    this.router.get('/rest/v1/admin/categories/:categoryId',
      categoriesController.getCategory.bind(categoriesController)); // Get category details
    this.router.put('/rest/v1/admin/categories/:categoryId',
      categoriesController.updateCategory.bind(categoriesController)); // Update category details

    /*
    * Routes related to project status module
    */
    this.router.post('/rest/v1/admin/projectstatus',
      projectStatusController.add); // Add project status
    this.router.delete('/rest/v1/admin/projectstatus/:projectStatusId',
      projectStatusController.delete); // Delete project status
    this.router.get('/rest/v1/admin/projectstatus/:projectStatusId',
      projectStatusController.getProjectStatus); // Get project status details
    this.router.get('/rest/v1/admin/projectstatus',
      projectStatusController.getProjectStatuses); // Get all project status
    this.router.put('/rest/v1/admin/projectstatus/:projectStatusId',
      projectStatusController.updateProjectStatus); // Update project status

    /*
    * Routes related to project process module
    */
    this.router.post('/rest/v1/admin/projectprocess',
      projectProcessController.add); // Add project process
    this.router.delete('/rest/v1/admin/projectprocess/:projectProcessId',
      projectProcessController.delete); // Delete project process
    this.router.get('/rest/v1/admin/projectprocess/:projectProcessId',
      projectProcessController.getProjectProcess); // Get project process details
    this.router.get('/rest/v1/admin/projectprocess',
      projectProcessController.getProjectProcesses); // Get all project processes
    this.router.put('/rest/v1/admin/projectprocess/:projectprocessId',
      projectProcessController.updateProjectProcess); // Update project process

    /*
    * Routes related to project geo module
    */
    this.router.post('/rest/v1/admin/projectgeo', projectGeoController.add); // Add project geo
    this.router.delete('/rest/v1/admin/projectgeo/:projectGeoId',
      projectGeoController.delete); // Delete project geo
    this.router.get('/rest/v1/admin/projectgeo/:projectGeoId',
      projectGeoController.getProjectGeo); // Get project geo details
    this.router.get('/rest/v1/admin/projectgeo',
      projectGeoController.getProjectGeos); // Get all project geos
    this.router.put('/rest/v1/admin/projectgeo/:projectGeoId',
      projectGeoController.updateProjectGeos); // Update project process

    /*
    * Routes related to job roles module
    */
    this.router.post('/rest/v1/admin/jobroles',
      jobRolesController.add.bind(jobRolesController)); // Add job roles
    this.router.delete('/rest/v1/admin/jobroles/:jobRoleId',
      jobRolesController.delete.bind(jobRolesController)); // Delete job roles
    this.router.get('/rest/v1/admin/jobroles/:jobRoleId',
      jobRolesController.getJobRole.bind(jobRolesController)); // Get job role details
    this.router.get('/rest/v1/admin/jobroles',
      jobRolesController.getJobRoles.bind(jobRolesController)); // Get job roles
    this.router.put('/rest/v1/admin/jobroles/:jobRoleId',
      jobRolesController.updateJobRoles.bind(jobRolesController)); // Update job roles

    /*
    * Routes related to managers module
    */
    this.router.get('/rest/v1/managers', managersController.getManagers); // Get all managers
    this.router.get('/rest/v1/managers/:managerId',
      managersController.getOneManager); // Get one manager

    /**
     * Routes related to the scheduler module.
     */
    this.router.get('/rest/v1/scheduler/:taskId',
      schedulerController.findById.bind(schedulerController));


    /*
    * Routes related to utilization module
    */
    this.router.get('/rest/v1/utilizations',
      utilizationsController.findList.bind(utilizationsController)); // Get all utilizations
    this.router.get('/rest/v1/utilizations/:userId',
      utilizationsController.findOne.bind(utilizationsController)); // Get utilization details
  }
}

module.exports = Router;

