class CardGrid extends HTMLElement {
  constructor() {
    super();

    // The Shadow root is assigned to a varaible called root for faster typing :)
    this.root = this.attachShadow({ mode: "open" });
    this.root.innerHTML = `
<style>
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

  main ::slotted(soln-card) {
    min-width: min(375px, 96vw);
  }

</style>

<main>
  <slot></slot>
</main>
    `;
  }
}

customElements.define("card-grid", CardGrid);
