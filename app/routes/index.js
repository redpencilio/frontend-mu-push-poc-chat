import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class IndexRoute extends Route {
  @service store;
  @service poll;

  constructor() {
    super(...arguments);

    let ts = this.store.createRecord('timestamp', {
      id: 'local',
      time: 'Click the update button to update the time',
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
