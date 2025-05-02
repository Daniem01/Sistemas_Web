
import bcrypt from "bcryptjs";

export const RolesEnum = Object.freeze({
    USUARIO: 'U',
    ADMIN: 'A'
});

export class Usuario {

    #id;
    #username;
    #password;
    #email;
    rol;
    nombre;

    constructor(username, password, nombre, rol = RolesEnum.USUARIO, id = null, email) {
        this.#username = username;
        this.#password = password;
        this.nombre = nombre;
        this.rol = rol;
        this.#id = id;
        this.#email = email;
    }

    static #getByUsernameStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;
    static #getAll = null;
    static #deleteAll = null;

    static initStatements(db) {
        if (this.#getByUsernameStmt !== null) return;

        this.#getByUsernameStmt = db.prepare('SELECT * FROM Usuarios WHERE username = @username');
        this.#insertStmt = db.prepare('INSERT INTO Usuarios(username, password, nombre, rol, email) VALUES (@username, @password, @nombre, @rol, @email)');
        this.#updateStmt = db.prepare('UPDATE Usuarios SET username = @username, password = @password, rol = @rol, nombre = @nombre, email = @email WHERE id = @id');
        this.#deleteStmt = db.prepare('DELETE FROM Usuarios WHERE username = @username');
        this.#getAll = db.prepare('SELECT * FROM Usuarios');
        this.#deleteAll = db.prepare('DELETE FROM Usuarios WHERE username != @username');
    }

    static getUsuarioByUsername(username) {
        const usuario = this.#getByUsernameStmt.get({ username });

        //console.log('Datos obtenidos de la base de datos:', usuario);

        if (usuario === undefined) throw new UsuarioNoEncontrado(username);

        const { password, rol, nombre, id, email } = usuario;

        return new Usuario(username, password, nombre, rol, id, email);
    }

    static #insert(usuario) {
        let result = null;
        try {
            const username = usuario.#username;
            const password = usuario.#password;
            const nombre = usuario.nombre;
            const rol = usuario.rol;
            const email = usuario.#email;
            const datos = {username, password, nombre, rol, email};

            result = this.#insertStmt.run(datos);

            usuario.#id = result.lastInsertRowid;
        } catch(e) { // SqliteError: https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#class-sqliteerror
            if (e.code === 'SQLITE_CONSTRAINT') {
                throw new UsuarioYaExiste(usuario.#username);
            }
            throw new ErrorDatos('No se ha insertado el usuario', { cause: e });
        }
        return usuario;
    }

    static obtenerUsuarios() {
        return this.#getAll.all();
    }

    /*
    static deleteAllUsers(currentUsername) {
        this.#deleteAll.run({ username: currentUsername });
    }
        */
    

    static #update(usuario) {
        const username = usuario.#username;
        const password = usuario.#password;
        const nombre = usuario.nombre;
        const rol = usuario.rol;
        const email = usuario.#email;
        //const datos = {username, password, nombre, rol};
        const datos = { username, password, nombre, rol, email, id: usuario.id };


        const result = this.#updateStmt.run(datos);
        if (result.changes === 0) throw new UsuarioNoEncontrado(username);

        return usuario;
    }


    static login(username, password) {
        let usuario = null;
        try {
            usuario = this.getUsuarioByUsername(username);
        } catch (e) {
            throw new UsuarioOPasswordNoValido(username, { cause: e });
        }

        // XXX: En el ej3 / P3 lo cambiaremos para usar async / await o Promises
        if ( ! bcrypt.compareSync(password, usuario.#password) ) throw new UsuarioOPasswordNoValido(username);

        return usuario;
    }

    get id() {
        return this.#id;
    }

    get password() {
        return this.#password;
    }

    set password(nuevoPassword) {
        // XXX: En el ej3 / P3 lo cambiaremos para usar async / await o Promises
        this.#password = bcrypt.hashSync(nuevoPassword);
    }

    get email() {
        return this.#email;
    }

    get username() {
        return this.#username;
    }

    persist() {
        if (this.#id === null) return Usuario.#insert(this);
        return Usuario.#update(this);
    }
   
static register(username, password, email, nombre) {
    const hash = bcrypt.hashSync(password, 10);
    const nuevoUsuario = new Usuario(username, hash, nombre, RolesEnum.USUARIO, null, email);
    
    return nuevoUsuario.persist();
}

static addUserAdmin(username, password, email, nombre) {
    const hash = bcrypt.hashSync(password, 10);

    const nuevoUsuario = new Usuario(username, hash, nombre, RolesEnum.ADMIN, null , email);
    
    return nuevoUsuario.persist();
}

static deleteByUsername(username) {
    const result = this.#deleteStmt.run({ username });
    if (result.changes === 0) throw new UsuarioNoEncontrado(username);
    //return true;
}

static usuarioExiste(username) {
    if (this.#getByUsernameStmt === null) {
        throw new Error("La base de datos no está inicializada. Llama a initStatements(db) primero.");
    }
    const usuario = this.#getByUsernameStmt.get({ username });
    return usuario !== undefined;
}

static actualizarCampos(username, username2, contraseña2, nuevoRol, nuevoEmail) {
   let usuario = this.getUsuarioByUsername(username);

    
    if (username2.trim() !== "") {
        usuario.#username = username2;
    }

    if (contraseña2.trim() !== "") {
        usuario.#password = contraseña2;
    }

    if (nuevoRol.trim() !== "") {
        usuario.rol = nuevoRol;
    }

    if (nuevoEmail.trim() !== "") {
        usuario.#email = nuevoEmail;
    }

    return usuario.persist();
}
}

export class UsuarioNoEncontrado extends Error {
    /**
     * 
     * @param {string} username 
     * @param {ErrorOptions} [options]
     */
    constructor(username, options) {
        super(`Usuario no encontrado: ${username}`, options);
        this.name = 'UsuarioNoEncontrado';
    }
}

export class UsuarioOPasswordNoValido extends Error {
    /**
     * 
     * @param {string} username 
     * @param {ErrorOptions} [options]
     */
    constructor(username, options) {
        super(`Usuario o password no válido: ${username}`, options);
        this.name = 'UsuarioOPasswordNoValido';
    }
}


export class UsuarioYaExiste extends Error {
    /**
     * 
     * @param {string} username 
     * @param {ErrorOptions} [options]
     */
    constructor(username, options) {
        super(`Usuario ya existe: ${username}`, options);
        this.name = 'UsuarioYaExiste';
    }
}

/*
export class UsuarioYaExiste extends Error {
    /**
     * 
     * @param {string} username 
     * @param {ErrorOptions} [options]
     
    constructor(username, options) {
        super(`Usuario ya existe: ${username}`, options);
        this.name = 'UsuarioYaExiste';
    }
}
    */
