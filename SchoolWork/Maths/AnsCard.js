import Card from "/SchoolWork/Card.js";

class AnsCard extends Card {
  constructor() {
    super();
  }

  get styles() {
    return (
      super.styles +
      `
main {
  font-size: 1.1em;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25em;
  padding: .65em;
}
main::before {
  content: "∴ ";
  font-size: 1.35em;
}
    `
    );
  }

  connectedCallback() {
    this.secondary = true;
  }
}

customElements.define("ans-card", AnsCard);
