class InputGo extends HTMLElement {
  constructor() {
    super();

    // this.root is created so that I don't have to type this.shadowRoot
    this.root = this.attachShadow({ mode: "open" });
    this.root.innerHTML = `
<style>
  @import url(/SchoolWork/global.css);

  main {
    gap: 1em;
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  #go.btn {
    display: block;
    width: 100%;
  }
</style>

<main>
  <slot name="input"></slot>
  <a href="#" target="_blank" class="btn" id="go">
    <slot></slot>
  </a>
</main>
`;

    this.goBtn = this.root.querySelector("#go.btn");
    this.onGo = () => {
      this.goBtn.href = this.querySelector('[slot="input"]').value;
    };
  }

  connectedCallback() {
    this.goBtn.addEventListener("click", this.onGo);
  }

  disconnectedCallback() {
    this.goBtn.removeEventListener("click", this.onGo);
  }
}

customElements.define("input-go", InputGo);
