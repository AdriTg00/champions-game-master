describe('Integración flujo completo - Ranking final', () => {
  it('Muestra el ranking tras completar las elecciones', () => {

    cy.intercept('GET', '/api/games', {
      fixture: 'games.json'
    }).as('getGames')

    // Simulamos usuario autenticado
    cy.visit('http://localhost:5173', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'currentUser',
          JSON.stringify({ username: 'test', role: 'user' })
        )
      }
    })

    cy.wait('@getGames')

    // Iniciamos el flujo del juego
    cy.contains('Comenzar', { timeout: 10000 }).click()

    // Realizamos elecciones hasta llegar al ranking
    for (let i = 0; i < 15; i++) {
      cy.get('.cards', { timeout: 10000 })
        .find('div')
        .first()
        .click()
    }

    // Verificamos que se muestra el ranking final
    cy.contains('Tu ranking', { timeout: 10000 }).should('be.visible')
  })
})
