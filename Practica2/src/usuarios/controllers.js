import { body } from 'express-validator';
import { Usuario, RolesEnum } from './Usuario.js';

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



export function doLogin(req, res) {
    body('username').escape();
    body('password').escape();
    // Capturo las variables username y password
    const username = req.body.username.trim();
    const password = req.body.password.trim();

    try {
        const usuario = Usuario.login(username, password);
        req.session.login = true;
        req.session.nombre = usuario.nombre;
        req.session.esAdmin = usuario.rol === RolesEnum.ADMIN;

        return res.render('pagina', {
            contenido: 'paginas/home',
            session: req.session
        });

    } catch (e) {
        res.render('pagina', {
            contenido: 'paginas/login',
            error: 'El usuario o contraseña no son válidos'
        })
    }
}

export function doRegister(req, res) {
    // Sanitizamos los campos del formulario
    body('usernameRegister').escape();
    body('password1').escape();
    body('password2').escape();

    // Capturamos los valores enviados por el formulario
    const username = req.body.usernameRegister.trim();
    const password1 = req.body.password1.trim();
    const password2 = req.body.password2.trim();

    // Validamos que ambas contraseñas sean iguales
    if (password1 !== password2) {
        return res.render('pagina', {
            contenido: 'paginas/register',
            error: 'Las contraseñas no coinciden'
        });
    }

    try {
        // Se asume que Usuario.register se encarga de crear el usuario en la base de datos
        const nuevoUsuario = Usuario.register(username, password1);

        // Iniciamos sesión para el usuario registrado
        req.session.login = true;
        req.session.nombre = nuevoUsuario.nombre;
        req.session.esAdmin = nuevoUsuario.rol === RolesEnum.ADMIN;

        return res.render('pagina', {
            contenido: 'paginas/home',
            session: req.session
        });
    } catch (e) {
        // Si ocurre algún error en el registro, se muestra un mensaje de error en la página de registro
        return res.render('pagina', {
            contenido: 'paginas/register',
            error: 'Error en el registro: ' + e.message
        });
    }
}


export function doLogout(req, res, next) {
    // https://expressjs.com/en/resources/middleware/session.html
    // logout logic

    // clear the user from the session object and save.
    // this will ensure that re-using the old session id
    // does not have a logged in user
    req.session.login = null
    req.session.nombre = null;
    req.session.esAdmin = null;
    req.session.save((err) => {
        if (err) next(err);

        // regenerate the session, which is good practice to help
        // guard against forms of session fixation
        req.session.regenerate((err) => {
            if (err) next(err)
            res.redirect('/');
        })
    })
}
