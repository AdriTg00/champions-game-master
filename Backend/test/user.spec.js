import { expect } from 'chai';
import UserModel from '../models/User.js';

describe('Pruebas Unitarias: Modelo de Usuario', () => {

    // 1. Un usuario perfecto
    it('Debe validar correctamente un usuario que cumple todos los requisitos', () => {
        const usuarioValido = new UserModel({
            username: 'JugadorPro',    // > 3 caracteres
            email: 'gamer@test.com',
            password: 'passwordSegura123' // > 8 caracteres
        });

        const error = usuarioValido.validateSync();
        // Si no hay errores, la variable error es undefined
        expect(error).to.be.undefined;
    });

    // 2. Campos obligatorios
    it('Debe dar error si falta el password', () => {
        const usuarioIncompleto = new UserModel({
            username: 'JugadorPro',
            email: 'gamer@test.com'
        });

        const error = usuarioIncompleto.validateSync();
        expect(error.errors['password']).to.exist;
    });

    // 3. Longitud mínima de Username
    it('Debe dar error si el username tiene menos de 3 caracteres', () => {
        const usuarioNombreCorto = new UserModel({
            username: 'Yo', // Solo 2 letras 
            email: 'test@test.com',
            password: 'passwordSegura123'
        });

        const error = usuarioNombreCorto.validateSync();
        expect(error.errors['username']).to.exist;
        expect(error.errors['username'].properties.message).to.include('shorter than the minimum allowed length');
    });

    // 4. Longitud mínima de Password
    it('Debe dar error si la contraseña tiene menos de 8 caracteres', () => {
        const usuarioPassDebil = new UserModel({
            username: 'JugadorPro',
            email: 'test@test.com',
            password: '123' // Muy corta    
        });

        const error = usuarioPassDebil.validateSync();
        expect(error.errors['password']).to.exist;
    });

    // 5. Método toJSON
    it('El método toJSON debe ocultar la contraseña y el _id', () => {
        const usuario = new UserModel({
            username: 'Espia',
            email: 'espia@test.com',
            password: 'SuperSecreto123'
        });

        // Ejecutamos tu función personalizada toJSON()
        const jsonOutput = usuario.toJSON();

        // COMPROBACIONES:
        expect(jsonOutput.password).to.be.undefined; // El password no debe estar
        expect(jsonOutput._id).to.be.undefined;      // El _id de mongo no debe estar
        expect(jsonOutput.id).to.exist;              // Debe haber creado 'id' limpio
        expect(jsonOutput.username).to.equal('Espia'); // Los datos normales sí deben estar
    });
});