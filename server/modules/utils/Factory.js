'use strict';

const errorHelper = require('../../helper/ErrorHelper');


/**
 * Factory for creating objects.
 */
class Factory {
  /**
   * Constructs a new factory ready to accept new constructors.
   */
  constructor() {
    this._constructors = {};
  }


  /**
   * Adds an object to this factory, which will be built by invoking
   * create with the supplied key.
   *
   * @param {String} key
   *    The key used to build this object.
   * @param {Function} constructors
   *    The constructor for the given object.
   * @param {Object} boundParameters
   *    Parameters that are already bound to this constructor.
   */
  add(key, constructor, boundParameters) {
    this._constructors[key] = {
      constructor,
      boundParameters,
    };
  }

  /**
   * Creates a an instance of the specified class, with the supplied parameters.
   * The supplied parameters are combined with those parameters bound to that constructor,
   * when calling Factory.add(). An exception is thrown if the instancing fails.
   *
   * @param {String} key
   *    The name of the class to be constructed.
   * @param {JSONObject} parameters
   *    The parameters to be supplied to the constructor.
   *
   * @returns {Object}
   *    The new instance.
   */
  create(key, parameters) {
    try {
      const constructor = this._constructors[key];
      const params = {};

      for (const prop in constructor.boundParameters) {
        if (constructor.boundParameters
          && constructor.boundParameters.hasOwnProperty(prop)) {
          params[prop] = constructor.boundParameters[prop];
        }
      }

      for (const prop in parameters) {
        if (parameters
          && parameters.hasOwnProperty(prop)) {
          params[prop] = parameters[prop];
        }
      }


      return new constructor.constructor(params);
    } catch (error) {
      errorHelper.createAndLogError('Factory::create', error);
      throw error;
    }
  }
}

module.exports = Factory;
