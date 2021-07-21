import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class IndexController extends Controller {
  @service store;
  @service poll;
  @service pushUpdates;
  id = window.identifier;
  chat = this.store.findAll('message');

  constructor() {
    super(...arguments);

    // Push-update for type clock means the timestamp has to update
    this.pushUpdates.addPollCallbackFunction((data, type, realm) => {
      console.log('running clock check');
      if (realm.value === 'http://clock' && type.value === 'http://update') {
        this.store.findRecord('timestamp', 'local').then(function (timestamp) {
          timestamp.time = data.time;
          timestamp.save();
        });
      }
    });
    this.pushUpdates.addPollCallbackFunction((data, type, realm) => {
      console.log('running chat check');
      if (realm.value === 'http://chat' && type.value === 'http://refresh') {
        this.set('chat', this.store.findAll('message'));
      }
    });
  }

  get clock() {
    return this.store.findRecord('timestamp', 'local');
  }

  changeTime() {
    fetch(`/clock/${window.identifier}`)
      .then((response) => response.json())
      .then((data) => {
        this.store
          .findRecord('timestamp', window.identifier)
          .then(function (timestamp) {
            timestamp.time = data.time;
            timestamp.save();
          });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  @action
  sendMessage(event) {
    event.preventDefault();
    let message = this.store.createRecord('message', {
      text: this.message,
      to: this.messageTo,
    });
    message.save();
  }

  @action
  updateLocalTimestamp(event) {
    event.preventDefault();
    fetch(`/clock/update/${window.identifier}`, { method: 'POST' });
  }

  @action
  updateTimestamp(event) {
    event.preventDefault();
    fetch(`/clock/update/${this.updateId}`, { method: 'POST' });
  }
}
