'use strict';


let status = undefined;
let location = undefined;
let json = undefined;
let sentResponse = undefined;


/**
 * Mock Express response for testing controllers.
 */
class MockResponse {
  get sentResponse() {
    return sentResponse;
  }


  status(value) {
    status = value;
    return this;
  }


  location(value) {
    location = value;
    return this;
  }


  json(value) {
    json = value;
    sentResponse = {
      location,
      json,
      status,
    };
  }


  send(newStatus) {
    if (newStatus) {
      status = newStatus;
    }

    sentResponse = {
      location,
      json,
      status,
    };
  }
}

module.exports = MockResponse;
