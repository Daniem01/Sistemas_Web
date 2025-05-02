import express from 'express';
import { 
    viewLogin, doLogin, doLogout, viewRegister, doRegister, 
    aniadirUsuario, viewAdd, viewEliminate, eliminateUser,
    viewModify, doModify, administrarUsuarios, viewDatosUsuario,
    actualizarCuenta
} from './controllers.js';

const usuariosRouter = express.Router();

usuariosRouter.get('/login', viewLogin);
usuariosRouter.post('/login', doLogin);
usuariosRouter.get('/logout', doLogout);
usuariosRouter.get('/register', viewRegister);
usuariosRouter.post('/register', doRegister);
usuariosRouter.get('/addUser', viewAdd);
usuariosRouter.post('/addUser', aniadirUsuario);
usuariosRouter.get('/eliminate', viewEliminate);
usuariosRouter.post('/eliminate', eliminateUser);
usuariosRouter.get('/modifyUser', viewModify);
usuariosRouter.post('/modifyUser', doModify);
usuariosRouter.post('/delete', doModify);
usuariosRouter.get('/administrarUsuarios', administrarUsuarios);
usuariosRouter.get('/datos', viewDatosUsuario);  
usuariosRouter.post('/actualizarCuenta', actualizarCuenta); 

export default usuariosRouter;