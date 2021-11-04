export default class Card extends HTMLElement {
  static get observedAttributes() {
    return ["secondary"];
  }

  constructor() {
    super();

    // this.root is not necessary and is just created for ease of use
    this.root = this.attachShadow({ mode: "open" });

    this.updBorderClr();
    this.updRoot();
  }

  attributeChangedCallback(name) {
    this.updBorderClr();
    console.log(
      `Reached Attr Changed Cb with border color ${this.borderClr}`,
      name
    );
    this.updRoot();
  }

  updBorderClr() {
    this.borderClr = this.secondary
      ? "var(--accent-clr)"
      : "rgb(var(--main-clr))";
  }

  updRoot() {
    this.root.innerHTML = `
<style>
  ${this.styleHTML}
</style>

<div class="card">
  <slot />
</div>
    `;
  }

  get styleHTML() {
    return `
@import url(/SchoolWork/vars.css);

.card {
  padding: 0.25em;
  font-size: 1.2em;
  text-align: center;
  border-radius: var(--card-border-rad);
  border: 2px solid ${this.borderClr};
  background-color: rgba(17, 17, 17, 0.3);
  box-shadow: 0.5em 0.5em 0.5em rgba(10, 10, 10, 0.6);
}`;
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
