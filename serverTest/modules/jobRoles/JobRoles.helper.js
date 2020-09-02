'use strict';


module.exports.getTemplate = () => {
  const template = {
    name: 'Testus',
    description: 'Test Description',
    created_by: 'testuser@us.ibm.com',
    created_date: new Date().getTime(),
  };

  return template;
};
