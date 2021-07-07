import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class IndexRoute extends Route {
  @service store;
  @service poll;

  constructor() {
    super(...arguments);

    let ts = this.store.createRecord('timestamp', {
      id: window.identifier,
      time: 'refresh to fetch a time from the server',
    });
    ts.save();
    // let message = this.store.createRecord('message', {
    //   text: 'Message content test',
    //   to: window.identifier,
    // });
    // message.save();
  }

  async id() {
    return window.identifier;
  }
}
