import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import Ember from 'ember';

export default class IndexController extends Controller {
  @service store;
  @service poll;
  // @service ajax;
  ajax = Ember.inject.service();
  id = window.identifier;
  chat = this.store.findAll('message');

  get clock() {
    return this.store.findRecord('timestamp', window.identifier);
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
    this.startPolling();
  }

  @action
  updateLocalTimestamp(event) {
    event.preventDefault();
    fetch(`/clock/update/${window.identifier}`, { method: 'POST' });
    this.startPolling();
  }

  @action
  updateTimestamp(event) {
    event.preventDefault();
    fetch(`/clock/update/${this.updateId}`, { method: 'POST' });
    this.startPolling();
  }

  @action
  startPolling() {
    // console.log('start auto updating');
    this.poll.addPoll({
      interval: 5000,
      callback: () => {
        fetch(`/push-update/`, {
          headers: { 'MU-TAB-ID': window.identifier },
        })
          .then((response) => response.json())
          .then((resp) => {
            let type = resp.type;
            if (type) {
              // console.log(`Received push update : ${JSON.stringify(resp)}`);
              let data = resp.data;
              // Push-update for type clock means the timestamp has to update
              if (type.value === 'http://clock') {
                if (data) {
                  this.store
                    .findRecord('timestamp', window.identifier)
                    .then(function (timestamp) {
                      timestamp.time = data.time;
                      timestamp.save();
                    });
                }
              } else if (type.value === 'http://chat') {
                if (data.refresh) {
                  this.set('chat', this.store.findAll('message'));
                }
              }
            }
          })
          .catch((err) => {
            console.error(err);
          });
      },
      label: 'time-polling',
    });
  }
}
