'use strict';

/**
 * Test helper functions for the categories module.
 */

/**
 * Gets the document template for a category.
 *
 * @returns {Category}
 *    The category template document.
 */
module.exports.getTemplate = () => {
  const template = {
    name: 'Testus',
    created_by: 'testuser@us.ibm.com',
    created_date: new Date().getTime(),
  };


  return template;
};
