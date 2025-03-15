import { Usuario } from "./usuarios/Usuario.js";
import { Carta } from "./cartas/Cartas.js";

export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Carta.initConsultas(db);
}