// Frontend/__tests__/shuffle.test.js
import { shuffleArray } from '../src/utils/shuffle.js';

describe('Algoritmo de Barajado', () => {

    // CASO 1: INTEGRIDAD DE DATOS
    // Si entran 5 cartas, deben salir 5 cartas. No pueden desaparecer.
    test('El array barajado debe conservar la misma longitud', () => {
        const cartasOriginales = ['Juego 1', 'Juego 2', 'Juego 3', 'Juego 4'];
        const cartasBarajadas = shuffleArray(cartasOriginales);
        expect(cartasBarajadas).toHaveLength(4);
    });

    // CASO 2: CONTENIDO CORRECTO
    // Aunque el orden cambie, los elementos deben ser los mismos.
    test('El array barajado debe contener los mismos elementos', () => {
        const input = ['A', 'B', 'C'];
        const output = shuffleArray(input);
        expect(output).toContain('A');
        expect(output).toContain('B');
        expect(output).toContain('C');
    });

    // CASO 3: Aleatoriedad
    // El resultado NO debe ser idéntico al original (debe haberse movido algo)
    test('El array resultante no debe tener el mismo orden original', () => {
        const ordenOriginal = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const resultado = shuffleArray(ordenOriginal);
        expect(resultado).not.toEqual(ordenOriginal);
    });
});