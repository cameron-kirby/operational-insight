'use strict';


const _ = require('underscore');
const q = require('q');


/**
 * Service for the JobRoles REST resource. This service performs the business logic of the Job Roles
 * REST resource.
 */
class JobRolesService {
  constructor(jobRoleRepository,
    projectsRepository,
    utilizationRepository) {
    this._jobRoleRepository = jobRoleRepository;
    this._projectsRepository = projectsRepository;
    this._utilizationRepository = utilizationRepository;
  }


  /**
   * Updates the flattened JobRole data.
   *
   * @param {Number} jobRoleId
   *    The id of the JobRole.
   * @param {String} updatedName
   *    The new name of the JobRole.
   * @param {String} originalName
   *    The original name of the JobRole.
   *
   * @returns {Promise}
   *    The promise to update the flattened JobRole data.
   */
  _updateFlattenedData(jobRoleId,
    updatedName,
    originalName) {
    const deferred = q.defer();

    if (updatedName !== originalName) {
      this._projectsRepository.findByJobRoleName(originalName)
        .then((projects) => {
          const projectsDeferred = q.defer();

          const updatedProjectDocuments = [];
          _.each(projects.docs, (projJobRole) => {
            _.each(projJobRole.team, (projTeam) => {
              // Check if the user's job_role is the one being updated
              if (projTeam.job_role === originalName) {
                const updatedJobRole = projTeam;
                updatedJobRole.job_role = updatedName;
                updatedProjectDocuments.push(projJobRole);
              }
            });
          });

          projectsDeferred.resolve(updatedProjectDocuments);

          return projectsDeferred.promise;
        })
        .then(this._projectsRepository.updateList)
        .then(() => {
          const projDeferred = q.defer();
          projDeferred.resolve(originalName);
          return projDeferred.promise;
        })
        .then(this._utilizationRepository.findByJobRoleName)
        .then((utilizations) => {
          const utilDeferred = q.defer();

          const updatedUtilizationDocuments = [];
          _.each(utilizations.docs, (utilJobRole) => {
            utilJobRole.projects.forEach((utilProject) => {
              utilProject.utilization.forEach((utilUtilization) => {
                // Check if the utilization's jobRole needs to be updated.
                if (utilUtilization.job_role === originalName) {
                  const updatedUtilization = utilUtilization;
                  updatedUtilization.job_role = updatedName;
                  updatedUtilizationDocuments.push(utilJobRole);
                }
              });
            });
          });
          utilDeferred.resolve(updatedUtilizationDocuments);

          return utilDeferred.promise;
        })
        .then(this._utilizationRepository.updateList)
        .then(() => {
          deferred.resolve();
        });
    } else {
      deferred.resolve();
    }

    return deferred.promise;
  }
  /**
   * Adds a new Job Role document to the database.
   *
   * @param {String} name
   *    The name of the new Job Role.
   * @param {String} description
   *    The description of the new Job Role.
   * @param {String} creatorUserId
   *    The creator of this Job Role.
   *
   * @returns {Promise}
   *    The promise to create the Job Role.
   */
  add(name,
    description,
    creatorUserId) {
    const jobRoleDocument = {
      name,
      description,
      created_by: creatorUserId,
      created_date: new Date().getTime(),
    };

    return this._jobRoleRepository.createOrUpdate(jobRoleDocument);
  }


  /**
   * Deletes a Job Role from the database.
   *
   * @param {Number} jobRoleId
   *    The id of the JobRole to be deleted.
   */
  delete(jobRoleId) {
    return this._jobRoleRepository.findById(jobRoleId)
      .then(this._jobRoleRepository.delete);
  }


  /**
   * Gets a single job role.
   *
   * @param {Number} jobRoleId
   *    The id of the job role.
   */
  getJobRole(jobRoleId) {
    return this._jobRoleRepository.findById(jobRoleId);
  }


  /**
   * Finds all of the Job Roles. This method accepts both a limit, and an offset parameter used to
   * reduce the number of records returned in a single call.
   *
   * @params {Number} limit
   *    The number of records that will be returned.
   * @params {Number} offset
   *    The position of the first record that will be returned.
   *
   * @returns {Promise}
   *    The promise to return the job roles.
   */
  getJobRoles(limit,
    offset) {
    return this._jobRoleRepository.findAll(limit, offset);
  }


  /**
   * Updates a JobRole, and if necessary updates the flattened JobRole data.
   *
   * @param {Number} jobRoleId
   *    The id of the JobRole that will be updated.
   * @param {String} name
   *    The new name of the JobRole.
   * @param {String} description
   *    The new description of the JobRole.
   * @param {String} modifierUserId
   *    The user id of the person who made this request.
   *
   * @returns {Promise}
   *    The promise to update the JobRole, and if necessary update the flattened JobRole data.
   */
  update(jobRoleId,
    name,
    description,
    modifierUserId) {
    let originalName;
    return this._jobRoleRepository.findById(jobRoleId)
      .then((jobRoleDocument) => {
        const roleDeferred = q.defer();

        originalName = jobRoleDocument.name;

        // Create a deep copy of the original document.
        const updatedJobRole = JSON.parse(JSON.stringify(jobRoleDocument));
        updatedJobRole.name = name || jobRoleDocument.name;
        updatedJobRole.description = description || jobRoleDocument.description;
        updatedJobRole.modified_by = modifierUserId;
        updatedJobRole.modified_date = new Date().getTime();
        roleDeferred.resolve(updatedJobRole);

        return roleDeferred.promise;
      })
      .then(this._jobRoleRepository.createOrUpdate)
      .then(() => this._updateFlattenedData(jobRoleId, name, originalName));
  }
}

module.exports = JobRolesService;
