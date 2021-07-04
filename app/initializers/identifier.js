export function initialize(application) {
  // make the application wait to continue until the identifier is received
  application.deferReadiness();
  fetch('/uuid')
    .then((response) => response.json())
    .then((data) => {
      window.identifier = data.uuid;
      // let the application continue with the identifier
      application.advanceReadiness();
    })
    .catch((err) => {
      console.error(err);
      application.advanceReadiness();
    });
}

export default {
  initialize,
};
