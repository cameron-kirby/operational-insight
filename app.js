'use strict';

const http = require('http');
const fs = require('fs');

const logger = require('./server/helper/Logger');
const ServerInitializer = require('./server/ServerInitializer');
const RouteBuilder = require('./server/routes/RouteBuilder');

const EmailService = require('./server/modules/email/EmailService');


const UtilizationValidationEmailTask =
  require('./server/modules/scheduler/utilizationValidationEmail/UtilizationValidationEmailTask');


const routeBuilder = new RouteBuilder();
const router = routeBuilder.build();


// config files
const config = require('config');
logger.log('info', `NODE_ENV: ${config.util.getEnv('NODE_ENV')}`);

// set our port
const listeningPort = process.env.VCAP_APP_PORT || config.get('listening_port.localhost');

// Preparing the scheduler.
const emailService = new EmailService();
routeBuilder.factory.add('utilizationVerificationEmail',
  UtilizationValidationEmailTask,
  {
    documentId: 'utilizationVerificationEmail',
    emailService,
    utilizationService: routeBuilder.utilizationService,
  });


routeBuilder.schedulerService.start();

const serverInitializer = new ServerInitializer(router);
const app = serverInitializer.initialize();
// Check if logs folder exist. If not, create it
fs.exists('./logs', (exists) => {
  if (!exists) {
    fs.mkdir('./logs');
  }
});


// Launch the application.
http.createServer(app).listen(listeningPort,
  () => {
    logger.log('info', `Listening on port ${listeningPort}`);
  }
);