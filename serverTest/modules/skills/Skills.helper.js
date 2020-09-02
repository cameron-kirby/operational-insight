'use strict';

/**
 * Test helper functions for the skills module.
 */

/**
 * Gets the document template for a skill.
 *
 * @returns {Skill}
 *    The skill template document.
 */
module.exports.getTemplate = () => {
  const template = {
    _id: '01355952d98f3d147084906b54c0e4e5',
    _rev: '6-31debb773c3a98d43aee70a408dc6a63',
    name: 'Operational Decision Manager (ODM) Development',
    description: 'Test Description',
    category_id: 'c95d88ba211a0f909609c1f6ca57a227',
    category: 'Smarter Process',
    people_count: 1,
    trending: true,
    managers: [
      'testuser@us.ibm.com',
    ],
    created_by: 'cbcavale@us.ibm.com',
    created_date: 1458928158577,
    updated_date: 1458928436839,
    updated_by: 'chastang@us.ibm.com',
  };


  return template;
};
