import Card from "/SchoolWork/Card.js";

class AnsCard extends Card {
  constructor() {
    super();
  }

  get styles() {
    return super.styles + `
.card {
  text-align: center;
  font-size: 1.1em;
  width: 100%;
  max-width: 375px;
}
.card::before { content: "∴ "; }
    `;
  }

  connectedCallback() {
    this.secondary = true;
  }
}

customElements.define("ans-card", AnsCard);
