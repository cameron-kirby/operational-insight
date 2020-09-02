'use strict';

/**
 * Test helper for the Scheduler module.
 */

const Duration = require('../../../server/modules/utils/Duration');

/**
 * Gets a standard document template for a ScheduledTask.
 *
 * @returns {ScheduledTask}
 *    A standard document for a ScheduledTask.
 */
module.exports.getTemplate = () => {
  const frequency = new Duration();
  frequency.weeks = 2;

  const lastExecuted = new Date();
  const template = {
    _id: 'testUtilizationVerificationEmail',
    enable: false,
    frequency,
    lastExecuted: lastExecuted.toString(),
    parameters: {
      templatePath: 'utilizationValidationEmail.html',
    },
  };

  return template;
};
