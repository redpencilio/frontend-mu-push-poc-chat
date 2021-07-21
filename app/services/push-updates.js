import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class PushUpdatesService extends Service {
  @service poll;

  pollCallbackFunctions = new Set();
  isFetching = false;

  constructor() {
    super(...arguments);

    if (!window.identifier) {
      fetch('/uuid')
        .then((response) => response.json())
        .then((data) => {
          window.identifier = data.uuid;
        })
        .catch((err) => {
          console.error(err);
        });
    }

    // Start the polling function
    if (!window.isPolling) {
      this.poll.addPoll({
        interval: 100,
        callback: () => {
          // Check if the polling is already fetching, if not start fetching
          if (!this.isFetching) {
            this.isFetching = true;
            // Fetch a push update (with the id of the tab)
            fetch(`/push-update/`, {
              headers: { 'MU-TAB-ID': window.identifier },
            })
              // Convert the response to json and then parse it into data, type and realm
              .then((response) => response.json())
              .then((resp) => {
                let type = resp.type;
                if (type) {
                  let realm = resp.realm;
                  let data = resp.data;
                  // Call all callback functions with the three arguments data, type and realm
                  for (let func of this.pollCallbackFunctions) {
                    func(data, type, realm);
                  }
                  console.log(`Received push update : ${JSON.stringify(resp)}`);
                }
                // Allow the next fetch to happen
                this.isFetching = false;
              })
              .catch((err) => {
                this.isFetching = false;
                console.log(`An error occured: ${err}`);
              });
          }
        },
      });
      window.isPolling = true;
    }
  }

  addPollCallbackFunction(func) {
    this.pollCallbackFunctions.add(func);
  }
}
