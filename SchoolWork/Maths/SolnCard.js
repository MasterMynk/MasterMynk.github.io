import Card from "/SchoolWork/Card.js";

class SolnCard extends Card {
  constructor() {
    super();
  }

  get styles() {
    return (
      super.styles +
      `
.card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
    `
    );
  }
}

customElements.define("soln-card", SolnCard);
