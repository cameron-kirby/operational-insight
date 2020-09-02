'use strict';

/**
 * Test helper for the Utilization resource.
 */

/**
 * Gets the document template for a utilization.
 *
 * @returns {Utilization}
 *    The utilization template document.
 */
module.exports.getTemplate = () => {
  const template = {
    user_id: 'testutil@us.ibm.com',
    fname: 'Test',
    lname: 'Util',
    reports_to: 'jlsteele@us.ibm.com',
    projects: [
      {
        name: 'Operational Insight',
        process: 'Innovation',
        proj_id: '704B91A3AC10D2C885257EC10003DA7B',
        status: 'Active New Development',
        utilization: [
          {
            end_date: 1483160400000,
            job_role: 'Developer',
            percentage: 35,
            start_date: 1455858000000,
            work_type: 'Active New Development',
            component: '',
          },
        ],
      }],
    updated_by: 'testutil@us.ibm.com',
    updated_date: new Date().getTime(),
  };
  return template;
};
