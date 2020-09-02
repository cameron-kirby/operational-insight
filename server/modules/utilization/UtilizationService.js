'use strict';


const q = require('q');
const _ = require('underscore');


/**
 * Service for the Utilization REST Resource. This service performs all of the business logic
 * required when manipulating utilizations.
 */
class UtilizationService {
  constructor(utilizationRepository) {
    this._utilizationRepository = utilizationRepository;
  }


  /**
   * Finds all of the years including and between the start and end year.
   *
   * @param {Number} yearStart
   *    The start year.
   * @param {Number} yearEnd
   *    The end year.
   *
   * @returns {Number[]}
   *    All of the years between the two years.
   */
  _getAllYearBetween(yearStart, yearEnd) {
    const allYears = [];
    const a = new Date(yearStart).getFullYear();
    const b = new Date(yearEnd).getFullYear();

    for (let i = a; i <= b; i++) {
      allYears.push(i);
    }

    return allYears;
  }


  /**
   * Finds the list of utilizations for user's who report to the specified manager, within the
   * supplied time frame.
   *
   * @param {JSON} frontBookmark
   *   The front bookmark of the query.
   * @param {Number} limit
   *   The maximum number of utilizations that will be returned.
   * @param {Number} offset
   *   The offset of the query.
   * @param {String} manager
   *   The id of the manager.
   * @param {Number} startDate
   *   The timestamp of the start of the requested date range.
   * @param {Number} endDate
   *   The timestamp of the end of the requested date range.
   *
   * @returns {Promise}
   *   The promise to return the list of utilizations for the direct reports of the given
   *   manager and date range.
   */
  findByManagerAndDateRange(frontBookmark,
    limit,
    offset,
    manager,
    startDate,
    endDate) {
    const deferred = q.defer();

    this._utilizationRepository.findByManager(frontBookmark,
      limit,
      offset,
      manager)
      .then((utilizationDocuments) => {
        const utilizationsDoc = {
          items: [],
          kind: 'Resource#UtilizationsList',
          pageInfo: {},
        };

        // Loop through all person's projects. Filter only docs with today's utilizations
        const bookmark = utilizationDocuments.bookmark;
        let yearFilterBuff = [];

        _.each(utilizationDocuments.docs, (person) => {
          const currentPerson = person;
          const projUtils = [];
          let totalUtilAve = 0;

          _.each(person.projects, (project) => {
            const currentProject = project;
            const utilToday = [];
            let projUtilAve = 0;

            _.each(project.utilization, (util) => {
              yearFilterBuff = yearFilterBuff.concat(this._getAllYearBetween(util.start_date,
                util.end_date));

              if ((util.start_date <= endDate) && (util.end_date >= startDate)) {
                projUtilAve += util.percentage;
                utilToday.push(util);
              }
            });

            if (utilToday.length > 0) {
              currentProject.utilization = utilToday;
              projUtilAve = projUtilAve / utilToday.length;
              currentProject.proj_average_util = projUtilAve.toFixed();
              totalUtilAve += projUtilAve;
              projUtils.push(project);
            }
          });

          if (projUtils.length > 0) {
            currentPerson.projects = projUtils;
            currentPerson.user_util = totalUtilAve.toFixed();
            utilizationsDoc.items.push(person);
          }
        });

        // Remove duplicate year filters
        const yearFilters = yearFilterBuff.filter((elem, pos) =>
          yearFilterBuff.indexOf(elem) === pos
        );

        utilizationsDoc.pageInfo.yearFilters = yearFilters;
        utilizationsDoc.pageInfo.totalResults = utilizationsDoc.itemslength;
        utilizationsDoc.pageInfo.bookmark = bookmark;
        deferred.resolve(utilizationsDoc);
      })
      .catch((error) => {
        deferred.reject(error);
      });


    return deferred.promise;
  }


  /**
   * Finds all of the utilizations for the user with the given id, in the supplied date range.
   *
   * @param {String} userId
   *    The id of the user.
   * @param {Number} startDate
   *   The timestamp of the start of the requested date range.
   * @param {Number} endDate
   *   The timestamp of the end of the requested date range.
   *
   * @returns {Promise}
   *    The promise to return all of the utilizations for the user.
   */
  findByUserIdAndDateRange(userId,
    startDate,
    endDate) {
    const deferred = q.defer();


    this._utilizationRepository.findByUserId(userId)
      .then((utilizationDocuments) => {
        const utilizationDoc = {
          items: [],
          kind: 'Resource#UserUtilization',
          pageInfo: {},
        };
        const userUtil = utilizationDocuments.docs[0];
        const yearFilterBuff = [];

        _.each(userUtil.projects, (project) => {
          let projUtilAve = 0;

          _.each(project.utilization, (util) => {
            const currentUtil = util;
            const projStart = new Date(util.start_date).getFullYear();
            const endStart = new Date(util.end_date).getFullYear();

            yearFilterBuff.push(projStart);
            yearFilterBuff.push(endStart);

            if ((util.start_date <= endDate) && (util.end_date >= startDate)) {
              projUtilAve += util.percentage;
              currentUtil.name = project.name;
              currentUtil.proj_id = project.proj_id;
              utilizationDoc.items.push(util);
            }
          });
        });

        // Remove duplicate year filters
        const yearFilters = yearFilterBuff.filter((elem, pos) =>
          yearFilterBuff.indexOf(elem) === pos
        );

        // utilizationDoc.item = utilToday;
        utilizationDoc.pageInfo.updated_date = userUtil.updated_date;
        utilizationDoc.pageInfo.yearFilters = yearFilters;
        utilizationDoc.pageInfo.totalResults = utilizationDoc.itemslength;
        deferred.resolve(utilizationDoc);
      })
      .catch((error) => {
        deferred.reject(error);
      });

    return deferred.promise;
  }


  /**
   * Validates a user's utilization. This function updates the last modified timestamp of the
   * user's utilization document.
   *
   * @param {String} userId
   *    The id of the user whose utilization is being validated.
   * @returns {Promise}
   *    The promise to return the updated document or an error.
   */
  validate(userId) {
    const deferred = q.defer();

    this._utilizationRepository.findByUserId(userId)
      .then((utilizationDocuments) => {
        const utilDeferred = q.defer();

        const newDocument = utilizationDocuments.docs[0];
        newDocument.updated_date = new Date().getTime();
        utilDeferred.resolve(newDocument);

        return utilDeferred.promise;
      })
      .then(this._utilizationRepository.createOrUpdate)
      .then((document) => {
        deferred.resolve(document);
      })
      .catch((error) => {
        deferred.reject(error);
      });

    return deferred.promise;
  }


  /**
   * Scans all of the utilizations to determine, which are out of date.
   *
   * @params {Number} endDate
   *    The timestamp for the end date of the query.
   * @returns {Promise}
   *    The promise to return the utilizations that are out of date.
   */
  findUnverifiedUtilizations(endDate) {
    return this._utilizationRepository.findByUpdatedDateOutsideDateRange(endDate);
  }
}

module.exports = UtilizationService;
