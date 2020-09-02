'use strict';


let body = {};
let headers = {};
let params = {};
let query = {};


/**
 * Mock Express request for testing controllers.
 */
class MockRequest {
  get body() {
    return body;
  }

  set body(value) {
    body = value;
  }


  get headers() {
    return headers;
  }

  set headers(value) {
    headers = value;
  }


  get params() {
    return params;
  }

  set params(value) {
    params = value;
  }


  get query() {
    return query;
  }

  set query(value) {
    query = value;
  }


  clear() {
    body = {};
    headers = {};
    params = {};
    query = {};
  }
}

module.exports = MockRequest;
