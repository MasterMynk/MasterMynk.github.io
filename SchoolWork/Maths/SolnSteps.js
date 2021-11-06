class SolnSteps extends HTMLElement {
  static get observedAttributes() {
    return ["qt-identifier"];
  }

  constructor() {
    super();

    // this.root is just created so that I don't have to type this.shadowRoot
    this.root = this.attachShadow({ mode: "open" });

    this.root.innerHTML = `
<style>
  ${this.styles}
</style>

<main>
  <slot></slot>
</main>
    `;
  }

  attributeChangedCallback() {
    this.root.querySelector("style").innerHTML = this.styles;
  }

  get styles() {
    return `
@import url(/SchoolWork/global.css);

main ::slotted(*) {
  display: flex;
  align-items: center;
  gap: 0.25em;

  margin-bottom: 1em !important;
}

main ::slotted(*:first-child)::before { content: "${this.qtName}) "; }

main ::slotted(*:not(:first-child))::before { content: "⇒ "; }
main ::slotted(*:not(:first-child)) {
  padding-left: ${this.qtName.length + 1.2}ch;
}
`;
  }

  get qtName() {
    return this.getAttribute("qt-identifier") || "";
  }

  set qtName(to) {
    this.setAttribute("qt-identifier", to);
    return this.qtName;
  }
}

customElements.define("soln-steps", SolnSteps);
