import JSONAPIAdapter from '@ember-data/adapter/json-api';

export default class ApplicationAdapter extends JSONAPIAdapter {
  get headers() {
    return {
      'MU-TAB-ID': window.identifier,
    };
  }
}
