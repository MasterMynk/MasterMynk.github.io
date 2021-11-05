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
  text-align: center;
  font-size: 1.1em;
}
main::before { content: "∴ "; }
    `
    );
  }

  connectedCallback() {
    this.secondary = true;
  }
}

customElements.define("ans-card", AnsCard);
