class CardGrid extends HTMLElement {
  constructor() {
    super();

    // The Shadow root is assigned to a varaible called root for faster typing :)
    this.root = this.attachShadow({ mode: "open" });
    this.root.innerHTML = `
<style>
  @import url(/SchoolWork/global.css);

  main {
    width: 100%;

    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: stretch;
    gap: 3em;
  }

  main ::slotted(soln-card) {
    max-width: 375px;
    width: 100%;
  }

</style>

<main>
  <slot />
</main>
    `;
  }
}

customElements.define("card-grid", CardGrid);
