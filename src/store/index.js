const EndpointStore = require('./endpoints');

class Store {
  constructor(initialState) {
    const init = initialState || {};
    this._data = {
      endpoints: new EndpointStore(init.endpoints),
    };
  }

  get data() {
    return this._data;
  }
}

module.exports = Store;
