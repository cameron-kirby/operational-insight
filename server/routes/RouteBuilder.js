'use strict';


const Route = require('./index.js');

const CategoriesController = require('../modules/categories/CategoriesController');
const CategoriesRepository = require('../modules/categories/CategoriesRepository');
const CategoriesService = require('../modules/categories/CategoriesService');

const JobRolesController = require('../modules/jobRoles/JobRolesController');
const JobRolesService = require('../modules/jobRoles/JobRolesService');
const JobRolesRepository = require('../modules/jobRoles/JobRolesRepository');

const ProjectsRepository = require('../modules/projects/ProjectsRepository');

const SkillsController = require('../modules/skills/SkillsController');
const SkillsRepository = require('../modules/skills/SkillsRepository');
const SkillsService = require('../modules/skills/SkillsService');

const UsersRepository = require('../modules/users/UsersRepository');

const UtilizationController = require('../modules/utilization/UtilizationController');
const UtilizationRepository = require('../modules/utilization/UtilizationRepository');
const UtilizationService = require('../modules/utilization/UtilizationService');

const DataUtilities = require('../modules/utils/DataUtilities');
const Factory = require('../modules/utils/Factory');

const SchedulerController = require('../modules/scheduler/SchedulerController');
const SchedulerService = require('../modules/scheduler/SchedulerService');


/**
 * Builder for the Route class. This is especially helpful for the unit and integration tests.
 */
class RouteBuilder {
  /**
   * Constructs a new empty RouteBuilder.
   */
  constructor() {
    this.dataUtilities = new DataUtilities();
    this.factory = new Factory();

    // Building Repositories.
    this.categoriesRepository = new CategoriesRepository();
    this.jobRolesRepository = new JobRolesRepository();
    this.projectsRepository = new ProjectsRepository();
    this.skillsRepository = new SkillsRepository();
    this.usersRepository = new UsersRepository();
    this.utilizationRepository = new UtilizationRepository();


    // Building Services.
    this.categoriesService = new CategoriesService(this.categoriesRepository,
      this.skillsRepository,
      this.usersRepository,
      this.dataUtilities);
    this.jobRolesService = new JobRolesService(this.jobRolesRepository,
      this.projectsRepository,
      this.utilizationRepository);
    this.schedulerService = new SchedulerService(this.factory);
    this.skillsService = new SkillsService(this.categoriesRepository,
      this.skillsRepository,
      this.usersRepository);
    this.utilizationService = new UtilizationService(this.utilizationRepository);


    // Building Controllers.
    this.categoriesController = new CategoriesController(this.categoriesService);
    this.jobRolesController = new JobRolesController(this.jobRolesService);
    this.schedulerController = new SchedulerController(this.schedulerService);
    this.skillsController = new SkillsController(this.skillsService);
    this.utilizationController = new UtilizationController(this.utilizationService);
  }


  /**
   * Builds the Route.
   */
  build() {
    return new Route(this.categoriesController,
      this.jobRolesController,
      this.schedulerController,
      this.skillsController,
      this.utilizationController);
  }
}

module.exports = RouteBuilder;
