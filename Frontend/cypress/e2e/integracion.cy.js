describe('Prácticas de Integración - Champions Games', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5173'); 
  });


// --- PRUEBA 1: FLUJO COMPLETO (Carga API + Login + Jugar) ---
  it('Debería cargar juegos de la API, permitir loguearse y empezar a jugar', () => {
    
    cy.intercept('GET', '**/api/games', {
      statusCode: 200,
      body: {
        games: [
          { id: 1, title: 'Super Mario Mock', coverUrl: '', platforms: ['NES'] },
          { id: 2, title: 'Sonic Mock', coverUrl: '', platforms: ['Sega'] }
        ]
      }
    }).as('getGames');

    cy.intercept('POST', '**/api/users/login', {
      statusCode: 200,
      body: { user: { id: 1, username: 'Tester' } }
    }).as('doLogin');

    cy.visit('http://localhost:5173');

    cy.wait('@getGames');

    cy.get('input[placeholder="Tu usuario..."]').type('Tester');
    cy.get('input[placeholder="••••••"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.wait('@doLogin');
    cy.contains('Comenzar').should('be.visible').click();
    cy.contains('Super Mario Mock').should('be.visible');
    cy.contains('Sonic Mock').should('be.visible');
  });


// --- PRUEBA 2: VERIFICACIÓN DE DATOS (LocalStorage) ---
  it('Debería guardar el usuario en localStorage tras un login exitoso', () => {
    cy.visit('http://localhost:5173');

    cy.intercept('POST', '**/api/users/login', {
      statusCode: 200,
      body: {
        user: { id: 99, username: 'CypressUser', token: 'fake-jwt' }
      }
    }).as('postLogin');

    cy.intercept('GET', '**/api/games', { body: { games: [] } }).as('getGamesIgnore');

    cy.get('input[placeholder="Tu usuario..."]').type('CypressUser');
    cy.get('input[placeholder="••••••"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@postLogin');

    cy.contains('Choose Your Game').should('be.visible');

    cy.window().then((window) => {
      const storedUser = window.localStorage.getItem('currentUser');
      expect(storedUser).to.not.be.null;
      const user = JSON.parse(storedUser);
      expect(user.username).to.equal('CypressUser');
    });
  });

//PRUEBA 3
  it('Debería mostrar error si las credenciales son incorrectas', () => {
    cy.visit('http://localhost:5173/login');

    cy.intercept('POST', '**/api/users/login', {
      statusCode: 401,
      body: { error: 'Credenciales inválidas' }
    }).as('loginFail');

    cy.get('input[placeholder="Tu usuario..."]').type('UsuarioFalso');
    cy.get('input[placeholder="••••••"]').type('malapassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginFail');

    cy.get('.error').should('contain', 'Credenciales inválidas');
  });

});