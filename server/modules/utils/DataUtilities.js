'use strict';


const _ = require('underscore');


/**
 * Utilities used for helping to interact with data received from the database.
 */
class DataUtilities {
  /**
   * Flattens the data received from a view request from the database. This changes the data from:
   * {
   *   rows: [
   *     data: {
   *       doc : {
   *         {DatabaseDocument}
   *       }
   *     }
   *   ]
   * }
   *
   * to:
   * data [{DatabaseDocument}]
   *
   * @param {ViewData} viewData
   *    The raw JSON object received from a view request from the database.
   *
   * @returns {Array}
   *    The flattened data from the view request.
   */
  flattenViewData(viewData) {
    return _.map(viewData.rows, (data) =>
        data.doc
    );
  }
}

module.exports = DataUtilities;
