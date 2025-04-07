import { join, dirname } from 'node:path';
import 'dotenv/config';

export const config = {
    port: process.env.APP_PORT && !isNaN(parseInt(process.env.APP_PORT, 10))
        ? parseInt(process.env.APP_PORT, 10)
        : 3000,

    recursos: join(dirname(import.meta.dirname), 'static'),
    vistas: join(dirname(import.meta.dirname), 'vistas'),

    session: {
        resave: false,
        saveUninitialized: true,
        secret: process.env.APP_SESSION_SECRET || 'no muy secreto',
    },
};