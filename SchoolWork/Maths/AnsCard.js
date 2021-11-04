import Card from "/SchoolWork/Card.js";

class AnsCard extends Card {
  constructor() {
    super();

    this.root.innerHTML += `
<style> 
  .card::before { content: "∴ "; }
</style>
    `;
  }

  connectedCallback() {
    this.secondary = true;
  }
}

customElements.define("ans-card", AnsCard);
