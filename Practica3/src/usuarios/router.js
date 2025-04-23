import express from 'express';
import { viewLogin, doLogin, doLogout, viewRegister, doRegister, aniadirUsuario, viewAdd,  viewEliminate ,eliminateUser,
    viewModify, doModify, administrarUsuarios, viewGestionarCuenta, viewActualizarCuenta

} from './controllers.js';

const usuariosRouter = express.Router();

usuariosRouter.get('/login', viewLogin);
usuariosRouter.post('/login', doLogin);
usuariosRouter.get('/register', viewRegister);  // Ruta GET para mostrar el formulario de registro
usuariosRouter.post('/register', doRegister);    // Ruta POST para procesar el registro
usuariosRouter.get('/logout', doLogout);
usuariosRouter.get('/addUser', viewAdd);
usuariosRouter.post('/addUser', aniadirUsuario);
usuariosRouter.get('/eliminate', viewEliminate);
usuariosRouter.post('/eliminate', eliminateUser);
usuariosRouter.get('/modifyUser', viewModify);
usuariosRouter.post('/modifyUser', doModify);
usuariosRouter.post('/delete', doModify);
usuariosRouter.get('/administrarUsuarios', administrarUsuarios);
usuariosRouter.get('/gestionarCuenta', viewGestionarCuenta);
usuariosRouter.post('/actualizarCuenta', viewActualizarCuenta);

export default usuariosRouter;