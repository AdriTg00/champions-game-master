describe('Integración GameChooser - Lógica de selección', () => {
  it('Permite seleccionar un juego y actualiza el contador de elecciones', () => {

    cy.intercept('GET', '/api/games', {
      fixture: 'games.json'
    }).as('getGames')

    // Simulamos usuario logueado
    cy.visit('http://localhost:5173', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'currentUser',
          JSON.stringify({ username: 'test', role: 'user' })
        )
      }
    })

    cy.wait('@getGames')

    // Iniciamos el juego
    cy.contains('Comenzar', { timeout: 10000 }).click()

    // Comprobamos contador inicial
    cy.contains('Elección 0 / 15', { timeout: 10000 }).should('be.visible')

    // Click en una carta
    cy.get('.cards', { timeout: 10000 })
      .find('div')
      .first()
      .click()

    // El contador debe incrementarse
    cy.contains('Elección 1 / 15', { timeout: 10000 }).should('be.visible')
  })
})
