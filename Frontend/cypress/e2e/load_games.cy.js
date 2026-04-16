describe('Integración Frontend - Backend', () => {
  it('Realiza la petición a la API tras iniciar el flujo', () => {

    cy.intercept('GET', '/api/games', {
      fixture: 'games.json'
    }).as('getGames')

    cy.visit('http://localhost:5173')

    cy.contains('Entrar', { timeout: 10000 }).click()

    // La prueba DE INTEGRACIÓN es que esta llamada ocurra correctamente
    cy.wait('@getGames').its('response.statusCode').should('eq', 200)
  })
})
