import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class IndexRoute extends Route {
  @service store;

  constructor() {
    super(...arguments);

    let ts = this.store.createRecord('timestamp', {
      id: window.identifier,
      time: new Date().toString(),
    });
    ts.save();
  }

    async id(){
        console.log(window.identifier)
        return window.identifier
    }

  async model() {
    return this.store.findRecord('timestamp', window.identifier);
  }
}
