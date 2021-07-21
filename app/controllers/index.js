import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class IndexController extends Controller {
  @service store;
  @service poll;
  id = window.identifier;
  chat = this.store.findAll('message');
  isPolling = false;
  isFetching = false;

  constructor() {
    super(...arguments);
    this.startPolling();
  }

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

  @action
  startPolling() {
    if (!this.isPolling) {
      this.isPolling = true;
      this.poll.addPoll({
        interval: 100,
        callback: () => {
          if (!this.isFetching) {
            this.isFetching = true;
            fetch(`/push-update/`, {
              headers: { 'MU-TAB-ID': window.identifier },
            })
              .then((response) => response.json())
              .then((resp) => {
                let type = resp.type;
                let realm = resp.realm;
                if (type) {
                  console.log(`Received push update : ${JSON.stringify(resp)}`);
                  console.log(new Date());
                  let data = resp.data;
                  // Push-update for type clock means the timestamp has to update
                  if (realm.value === 'http://clock') {
                    if (type.value == 'http://update') {
                      this.store
                        .findRecord('timestamp', window.identifier)
                        .then(function (timestamp) {
                          timestamp.time = data.time;
                          timestamp.save();
                        });
                    }
                  } else if (realm.value === 'http://chat') {
                    if (type.value == 'http://refresh') {
                      this.set('chat', this.store.findAll('message'));
                    }
                  }
                }
                this.isFetching = false;
              })
              .catch((err) => {
                this.isFetching = false;
                console.log(`An error occured: ${err}`);
              });
          }
        },
      });
    }
  }
}
