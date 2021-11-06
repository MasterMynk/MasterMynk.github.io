class MathsDiv extends HTMLElement {
  constructor() {
    super();

    // this.root is created so that I don't have to type this.shadowRoot
    this.root = this.attachShadow({ mode: "open" });
    this.root.innerHTML = `
<style>
  @import url(/SchoolWork/global.css);

  main {
    --border: 1px solid currentColor;

    display: flex;
    align-items: flex-start;
    font-size: min(1em, 4vw);
  }

  ::slotted([slot=divisor]) {
    display: inline-block;
    padding-right: .2em;

    border-bottom: var(--border);
    border-right: var(--border);

    margin-top: 1.3em !important;
  }

  .rhs > ::slotted(*) {
    padding-left: .3em;
  }

  ::slotted([slot=divident]) {
    border-top: var(--border);
    margin-bottom: .2em !important;
  }

  ::slotted([slot=steps]) {
    text-align: right;
    line-height: 1.7;
  }
</style>

<main>
  <slot name="divisor"></slot>
  <div class="rhs">
    <slot name="quotient"></slot>
    <slot name="divident"></slot>
    <slot name="steps"></slot>
  </div>
</main>
`;
    Array.from(
      this.querySelectorAll("[slot=steps] > *:nth-child(odd)")
    ).forEach((step) => (step.style.borderBottom = "2px solid currentColor"));
  }
}

customElements.define("maths-div", MathsDiv);
