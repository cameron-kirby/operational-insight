'use strict';

/**
 * Test helper for the LoginToken module.
 */

module.exports.getTemplate = () => {
  const template = {
    expries: '12345',
    token: 'abcd',
    user_id: 'testguy@us.ibm.com',
  };
  return template;
};
