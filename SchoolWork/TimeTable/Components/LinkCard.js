import Card from "/SchoolWork/Components/Card.js";

class LinkCard extends Card {
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
  gap: 1.5em;
}
`
    );
  }
}

customElements.define("link-card", LinkCard);
