// Backend/test/game.model.spec.js
import { expect } from 'chai';
import Game from '../models/Game.js'; 

describe('Pruebas Unitarias: Modelo de Videojuego (Game)', () => {

    // CASO 1: CAMINO FELIZ (Juego válido)
    it('Debe aceptar un juego que tenga nombre', () => {
        const juegoValido = new Game({
            name: 'Elden Ring', 
            description: 'Un juego muy difícil'
        });

        const error = juegoValido.validateSync();

        expect(error).to.be.undefined;
    });

    // CASO 2: Fallo esperado
    it('Debe lanzar error si intentamos guardar un juego SIN nombre', () => {
        const juegoInvalido = new Game({
            description: 'Juego misterioso sin título'
        });

        const error = juegoInvalido.validateSync();

        expect(error).to.exist;
        expect(error.errors['name']).to.exist;
        expect(error.errors['name'].kind).to.equal('required');
    });

    // CASO 3: LÍMITES (Maxlength 100)
    it('Debe lanzar error si el nombre supera los 100 caracteres', () => {
        const nombreLargo = 'a'.repeat(101); 
        
        const juegoExagerado = new Game({ name: nombreLargo });

        const error = juegoExagerado.validateSync();

        expect(error.errors['name']).to.exist;
        expect(error.errors['name'].kind).to.equal('maxlength');
    });
});