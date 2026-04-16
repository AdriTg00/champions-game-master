describe('E2E - Ranking final', () => {
  it('Muestra el ranking tras completar el juego', () => {

    // 1️⃣ Simulamos la respuesta del backend
    cy.intercept('GET', '**/api/games', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Juego A' },
        { id: 2, name: 'Juego B' },
        { id: 3, name: 'Juego C' },
        { id: 4, name: 'Juego D' }
      ]
    }).as('getGames')

    // 2️⃣ Forzamos usuario autenticado
    cy.clearLocalStorage()
    cy.visit('http://localhost:5173', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'currentUser',
          JSON.stringify({ username: 'e2eUser' })
        )
      }
    })

    // 3️⃣ Esperamos a que carguen los juegos
    cy.wait('@getGames')

    // 4️⃣ Iniciamos el juego
    cy.contains('Comenzar', { timeout: 20000 })
      .should('be.visible')
      .click()

    // 5️⃣ Realizamos elecciones hasta llegar al ranking
    for (let i = 0; i < 15; i++) {
      cy.contains('button', 'Elegir', { timeout: 20000 })
        .first()
        .click()
    }

    // 6️⃣ Comprobamos que aparece el ranking final
    cy.contains('Tu ranking', { timeout: 20000 })
      .should('be.visible')
  })
})
