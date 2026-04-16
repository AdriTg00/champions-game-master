describe('E2E - Inicio del juego (robusto)', () => {
  it('Permite iniciar el flujo principal del juego', () => {

    cy.clearLocalStorage()

    // Simulamos login si hace falta
    cy.intercept('POST', '**/api/users/login', {
      statusCode: 200,
      body: {
        user: { username: 'e2eUser' }
      }
    }).as('login')

    cy.visit('http://localhost:5173')

    // Esperamos a que la app pinte algo
    cy.get('body', { timeout: 20000 }).should('be.visible')

    // Dependiendo del estado, actuamos
    cy.get('body').then($body => {

      // Caso 1: estamos en login
      if ($body.text().includes('Entrar')) {
        cy.contains('Entrar').click()
        cy.wait('@login')
      }

    })

    // Ahora SÍ o SÍ debe aparecer Home
    cy.contains('Comenzar', { timeout: 20000 })
      .should('be.visible')
      .click()

    // Entramos al juego
    cy.contains('Elección', { timeout: 20000 })
      .should('be.visible')
  })
})
