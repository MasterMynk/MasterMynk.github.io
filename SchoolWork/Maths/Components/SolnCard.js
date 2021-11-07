import Card from "/SchoolWork/Components/Card.js";

class SolnCard extends Card {
  constructor() {
    super();
  }

  get styles() {
    return (
      super.styles +
      `
main {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1em;
}
    `
    );
  }
}

customElements.define("soln-card", SolnCard);
