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
    fetch(`/clock/update/${this.updateId}`, { method: 'POST' });
  }

  @action
  startPolling(event) {
    console.log('start auto updating timestamp');
    this.poll.addPoll({
      interval: 1000,
      callback: () => {
        fetch(`/push-update/${window.identifier}`, {
          headers: { 'MU-TAB-ID': window.identifier },
        })
          .then((response) => response.json())
          .then((resp) => {
            let type = resp.type;
            if (type) {
              console.log(`Received push update : ${JSON.stringify(resp)}`);
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

  @action
  stopPolling(event) {
    console.log('stop auto updating timestamp');
    this.poll.stopPollByLabel('time-polling');
  }
}
