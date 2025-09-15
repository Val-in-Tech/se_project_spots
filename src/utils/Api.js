class Api {
  constructor({ baseUrl, headers }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  getInitialCards() {
    return fetch("https://around-api.en.tripleten-services.com/v1/cards", {
      headers: {
    authorization: "dbc7ac93-a7e1-4202-a0be-543dc69048ed",
      },
  }).then((res) => res.json());
}


}

export default Api;