describe('E2E - Selección de videojuego', () => {
  it('Permite iniciar el juego y elegir un videojuego', () => {

    // 1️⃣ Stub del backend (CLAVE)
    cy.intercept('GET', '**/api/games', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Juego A' },
        { id: 2, name: 'Juego B' },
        { id: 3, name: 'Juego C' }
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

    // 3️⃣ Esperamos a que termine la carga
    cy.wait('@getGames')

    // 4️⃣ Ahora Home existe
    cy.contains('Comenzar', { timeout: 20000 })
      .should('be.visible')
      .click()

    // 5️⃣ Contador inicial
    cy.contains('Elección 0 / 15', { timeout: 20000 })
      .should('be.visible')

    // 6️⃣ Elegimos un juego (botón real)
    cy.contains('button', 'Elegir', { timeout: 20000 })
      .first()
      .click()

    // 7️⃣ El contador aumenta
    cy.contains('Elección 1 / 15', { timeout: 20000 })
      .should('be.visible')
  })
})
