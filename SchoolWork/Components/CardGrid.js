class CardGrid extends HTMLElement {
  static get observedAttributes() {
    return ["cards-min-width"];
  }

  constructor() {
    super();

    // The Shadow root is assigned to a varaible called root for faster typing :)
    this.root = this.attachShadow({ mode: "open" });
    this.root.innerHTML = `
<style>
  ${this.styles}
</style>

<main>
  <slot></slot>
</main>
    `;

    this.style_e = this.root.querySelector("style");
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    oldVal != newVal && (this.cardsMinWidth = newVal);
  }

  get cardsMinWidth() {
    return this.getAttribute("cards-min-width");
  }

  set cardsMinWidth(to) {
    this.styles = this.styles;
    return this.setAttribute("cards-min-width", to);
  }

  get styles() {
    return `
@import url(/SchoolWork/global.css);

main {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: stretch;
  gap: 3em;
  padding: 0 min(4vw, 5em);

  width: 100%;

  margin-bottom: 4em !important;
}

main ::slotted(*) {
  min-width: min(${this.cardsMinWidth || 375}px, 96vw);
}
`;
  }

  set styles(to) {
    this.style_e.innerHTML = to;
  }
}

customElements.define("card-grid", CardGrid);
