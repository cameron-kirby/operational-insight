'use strict';

const assert = require('assert');

const Factory = require('../../../server/modules/utils/Factory');

let result;

function TestClassNoParams() {
  const thisClass = this;

  thisClass.hi = () => {
    result = 'hi';
  };
}

function TestClassParams(parameters) {
  const thisClass = this;

  thisClass.hi = () => {
    result = parameters.hi;
  };
}

describe('Factory', () => {
  describe('create', () => {
    it('should create a class without parameters.', (done) => {
      const factory = new Factory();
      factory.add('test', TestClassNoParams);

      const instance = factory.create('test');

      instance.hi();
      try {
        assert.equal(result, 'hi');
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should create a class with bound parameters.', (done) => {
      const factory = new Factory();
      factory.add('test', TestClassParams, { hi: 'hi bound' });

      const instance = factory.create('test');

      instance.hi();
      try {
        assert.equal(result, 'hi bound');
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should create a class with injected parameters.', (done) => {
      const factory = new Factory();
      factory.add('test', TestClassParams);

      const instance = factory.create('test', { hi: 'hi injected' });

      instance.hi();
      try {
        assert.equal(result, 'hi injected');
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
