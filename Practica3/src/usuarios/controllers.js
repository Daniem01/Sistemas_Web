import { Usuario, RolesEnum } from './Usuario.js';
import { body, validationResult } from 'express-validator';

export function viewLogin(req, res) {
    let contenido = 'paginas/login';
    if (req.session != null && req.session.login) {
        contenido = 'paginas/home'
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function viewRegister(req, res) {
    res.render('pagina', {
        contenido: 'paginas/register',
        session: req.session
    });
}

export function administrarUsuarios(req, res) {
    const usuarios = Usuario.obtenerUsuarios();
    
    res.render('pagina', {
        contenido: 'paginas/administrarUsuarios',
        usuarios,
        session: req.session
    });
}

export function viewModify(req, res) {
    res.render('pagina', {
        contenido: 'paginas/modifyUser',
        session: req.session
    });
}

export function viewEliminate(req, res) {
    res.render('pagina', {
        contenido: 'paginas/borrarUsuario',
        session: req.session
    });
}

export function viewAdd(req, res) {
    res.render('pagina', {
        contenido: 'paginas/aniadirUsuario',
        session: req.session
    });
}

export function doLogin(req, res) {
    //No valen campos vacíos
    const validations = [
        body('username', 'El nombre de usuario es obligatorio').notEmpty(),
        body('password', 'La contraseña es obligatoria').notEmpty(),
    ];

    //Validaciones
    Promise.all(validations.map(validation => validation.run(req))).then(() => {
        const errors = validationResult(req);
        //Si hay error devolverlo al usuario (errores tiene algo dentro)
        if (!errors.isEmpty()) {
            return res.render('pagina', {
                contenido: 'paginas/login',
                //Mostrar los errores que haya
                error: errors.array().map(err => err.msg).join('. '), 
            });
        }

        //Capturar username y password
        const username = req.body.username.trim();
        const password = req.body.password.trim();

        try {
            //Verificamos si el usuario existe y si la contraseña es la correcta
            const usuario = Usuario.login(username, password);
            req.session.login = true;
            req.session.nombre = usuario.nombre;
            req.session.esAdmin = usuario.rol === RolesEnum.ADMIN;

            //Renderiza la página por login true
            return res.render('pagina', {
                contenido: 'paginas/home',
                session: req.session,
            });

        } catch (e) {
            //Error de usuario o contraseña, renderiza
            return res.render('pagina', {
                contenido: 'paginas/login',
                error: 'El usuario o contraseña no son válidos',
            });
        }
    });
}

export function aniadirUsuario(req, res) {
    body('nombre').escape();
    body('email').normalizeEmail();
    body('pass').escape();
    body('username').escape();
    body('rol').isIn([RolesEnum.ADMIN, RolesEnum.USER]);

    const nombre = req.body.nombre.trim();
    const email = req.body.email.trim();
    const pass = req.body.pass.trim();
    const rol = req.body.tipoUsuario.trim();
    const username = req.body.username.trim();
    //console.log(rol);
    
    if (!nombre || !email || !rol || !username) {
        return res.render('pagina', {
            contenido: 'paginas/aniadirUsuario',
            mensaje: 'Todos los campos son obligatorios.'
        });
    }

    try {
    
        if(rol == "A") { Usuario.addUserAdmin(username,pass,email,nombre); }
        else Usuario.register(username,pass,email,nombre);
        //console.log(rol);
        const usuarios = Usuario.obtenerUsuarios();
        return res.render('pagina', {
            contenido: 'paginas/administrarUsuarios',
            session: req.session,
            usuarios,
            mensaje: 'Usuario añadido con éxito'
        });

    } catch (e) {
        // Si ocurre algún error al crear el usuario
        return res.render('pagina', {
            contenido: 'paginas/aniadirUsuario',
            mensaje: 'Error al añadir el usuario: ' + e.message
        });
    }
}

export function doRegister(req, res) {
    
    body('name').escape();
    body('usernameRegister').escape();
    body('email').normalizeEmail();
    body('password1').escape();
    body('password2').escape();

    const username = req.body.usernameRegister.trim();
    const password1 = req.body.password1.trim();
    const password2 = req.body.password2.trim();
    const email = req.body.email.trim();
    const name = req.body.name.trim();

    if (password1 !== password2) {
        return res.render('pagina', {
            contenido: 'paginas/register',
            mensaje: 'Las contraseñas no coinciden',
            session: req.session
        });
    }

    try {

        const nuevoUsuario = Usuario.register(username, password1, email, name);

        req.session.login = true;
        req.session.nombre = nuevoUsuario.nombre;
        req.session.esAdmin = nuevoUsuario.rol === RolesEnum.ADMIN;

        return res.render('pagina', {
            contenido: 'paginas/home',
            session: req.session
        });
    } catch (e) {
        return res.render('pagina', {
            contenido: 'paginas/register',
            mensaje: 'Error en el registro: ' + e.message,
            session: req.session
        });
    }
        
}


export function doLogout(req, res, next) {
    req.session.login = null
    req.session.nombre = null;
    req.session.esAdmin = null;
    req.session.save((err) => {
        if (err) next(err);
        req.session.regenerate((err) => {
            if (err) next(err)
            res.redirect('/');
        })
    })
}

export function eliminateUser(req,res){
    if(!Usuario.usuarioExiste(req.body.username)){
    return res.render('pagina', {
        contenido: 'paginas/borrarUsuario',
        mensaje: 'Error al borrar el usuario ',
        session: req.session
    });
}
    else {
        Usuario.deleteByUsername(req.body.username);
        const usuarios = Usuario.obtenerUsuarios();
        return res.render('pagina', {
        contenido: 'paginas/administrarUsuarios',
        mensaje: 'Usuario borrado con exito ',
        usuarios,
        session: req.session
        });

}

}

export function doModify(req, res) {
    body('username').escape();
    body('usuario2').normalizeEmail();
    body('pass2').escape();
    body('email').normalizeEmail();
    body('tipoUsuario').isIn([RolesEnum.ADMIN, RolesEnum.USER]); 

    const usuario = req.body.username.trim();
    const usuario2 = req.body.usuario2.trim();
    const pass2 = req.body.pass2.trim();
    const rol = req.body.tipoUsuario.trim();
    const email = req.body.email.trim();
    //console.log(rol);
    
        if(Usuario.usuarioExiste(usuario)){
        Usuario.actualizarCampos(usuario, usuario2, pass2, rol, email);
        const usuarios = Usuario.obtenerUsuarios();
        return res.render('pagina', {
            contenido: 'paginas/administrarUsuarios',
            session: req.session,
            usuarios,
            mensaje: 'Usuario modificado con éxito'
        });
    }
        else{
        return res.render('pagina', {
            contenido: 'paginas/modifyUser',
            mensaje: 'El usuario no existe ' ,
            session: req.session
        });
    }
}

export function viewGestionarCuenta(req, res){
    console.log('Contenido de la sesión:', req.session);

    res.render('pagina', {
        contenido: 'paginas/gestionarCuenta',
        session: req.session
    });
}

export function viewActualizarCuenta(req, res) {
    const { username, password, nombre, email } = req.body;

    console.log('Contenido de la sesion:', req.session);
    try {
        const usuario = Usuario.getUsuarioByUsername(req.session.usuario.username);
        if (!usuario) {
            throw new Error('Usuario no encontrado.');
        }

        //Verificar si el nuevo username ya se usa
        if (username && username !== usuario.username) {
            const usuarioExistente = Usuario.getUsuarioByUsername(username);
            if (usuarioExistente) {
                throw new Error('El nombre de usuario ya está en uso. Por favor, elige otro.');
            }
            usuario.username = username;
            req.session.usuario.username = username;
        }

        if (nombre) {
            usuario.nombre = nombre;
            req.session.usuario.nombre = nombre; 
        }

        if (email) {
            usuario.email = email;
            req.session.usuario.email = email;
        }

        if (password) {
            usuario.password = password;
        }

        usuario.persist();

        res.render('pagina', {
            contenido: 'paginas/gestionarCuenta',
            mensaje: 'Datos actualizados correctamente.',
            session: req.session
        });
    } catch (error) {
        res.render('pagina', {
            contenido: 'paginas/gestionarCuenta',
            mensaje: `Error al actualizar los datos: ${error.message}`,
            session: req.session
        });
    }
}