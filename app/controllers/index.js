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
  updateTime(event) {
    event.preventDefault();
    this.changeTime();
  }

  @action
  updateTimestamp(event) {
    event.preventDefault();
    console.log('test123');
    console.log(this.updateId);
    fetch(`/clock/update/${this.updateId}`, { method: 'POST' });

    // this.ajax.post(`/clock/update/${this.updateId}`);
  }

  @action
  startPolling(event) {
    console.log('start auto updating timestamp');
    this.poll.addPoll({
      interval: 500,
      callback: () => {
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
      },
      label: 'time-polling',
    });
  }

  @action
  stopPolling(event) {
    console.log('stop auto updating timestamp');
    this.poll.stopPollByLabel('time-polling');
  }
}
