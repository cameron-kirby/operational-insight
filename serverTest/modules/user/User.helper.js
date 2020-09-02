'use strict';

/**
 * Test helper functions for the user module.
 */

/**
 * Gets the document template for a user.
 *
 * @returns {User}
 *    The user template document.
 */
module.exports.getTemplate = () => {
  const template = {
    _id: 'testutil@us.ibm.com',
    uid: '12345678',
    notesid: 'Test Util/Raleigh/IBM',
    cc: 'us',
    fname: 'Test',
    lname: 'Util',
    email: 'testutil@us.ibm.com',
    cname: 'Test Util',
    status: 'Active',
    role: 'User',
    isManager: 'False',
    vacations: [],
    reports_to: {
      _id: 'jlsteele@us.ibm.com',
      _rev: '2-8e6105c9559d5eab29e216dab9596851',
      uid: '958716897',
      notesid: 'Jeff Steele/Phoenix/IBM',
      cc: 'us',
      fname: 'Jeffrey',
      lname: 'Steele',
      cname: 'Jeff Steele',
      status: 'Active',
      job_title: 'ISC Lab - Manager: Strategy, Development and Architecture',
      team: 'Strategy, Development and Architecture',
      dob: '',
      created_by: 'cbcavale@us.ibm.com',
      created_date: 1445051171000,
      employee_type: 'IBM Employee, Regular',
      updated_by: 'jlsteele@us.ibm.com',
      updated_date: 1449690430977,
      phone: '1-480-717-2748',
    },
    skills: [],
    num_projects: 0,
    created_by: 'testutil@us.ibm.com',
    created_date: new Date(),
    employee_type: 'IBM Employee, Regular',
    updated_by: 'testutil@us.ibm.com',
    updated_date: new Date(),
  };
  return template;
};
