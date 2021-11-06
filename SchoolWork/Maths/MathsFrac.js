class MathsFrac extends HTMLElement {
  constructor() {
    super();

    // this.root is created so that I don't have to type this.shadowRoot
    this.root = this.attachShadow({ mode: "open" });
    this.root.innerHTML = `
<style>
  @import url(/SchoolWork/global.css);

  main {
    display: inline-block;
    font-size: .75em;
  }

  main ::slotted([slot=numerator]) {
    border-bottom: 1px solid currentColor;
  }

  main ::slotted(:is([slot=numerator], [slot=denominator])) {
    text-align: center;
  }

</style>

<main>
  <slot name="numerator"></slot>
  <slot name="denominator"></slot>
</main>
`;
  }
}

customElements.define("maths-frac", MathsFrac);
