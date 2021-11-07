export default class Card extends HTMLElement {
  static get observedAttributes() {
    return ["secondary"];
  }

  constructor() {
    super();

    // this.root is not necessary and is just created for ease of use
    this.root = this.attachShadow({ mode: "open" });

    this.updBorderClr();
    this.root.innerHTML = this.rootHTML;
  }

  attributeChangedCallback(name) {
    this.updBorderClr();
    this.root.innerHTML = this.rootHTML;
  }

  updBorderClr() {
    this.borderClr = this.secondary
      ? "var(--accent-clr)"
      : "rgb(var(--main-clr))";
  }

  get rootHTML() {
    return `
<style>
  ${this.styles}
</style>

<main>
  <slot></slot>
</main>
    `;
  }

  get styles() {
    return `
@import url(/SchoolWork/global.css);

main {
  padding: 1em;
  backdrop-filter: blur(var(--card-blur));
  background: rgba(var(--elem-bg-clr), calc(var(--opacity) + .25));

  height: 100%;

  border-radius: var(--card-border-rad);
  border: var(--border-thickness) solid ${this.borderClr};

  box-shadow: 0.5em 0.5em 0.5em rgba(10, 10, 10, 0.6);
}

@supports (backdrop-filter: blur(var(--card-blur))) {
  main {
    background: rgba(var(--elem-bg-clr), var(--opacity));
  }
}
`;
  }

  get secondary() {
    return this.hasAttribute("secondary");
  }
  set secondary(enable) {
    if (enable) this.setAttribute("secondary", "");
    else this.removeAttribute("secondary");
  }
}

// The only reason that this element isn't named just 'card' is because custom
// elements compulsorily should include a hyphen(-).
// Source: https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define
customElements.define("cust-card", Card);
