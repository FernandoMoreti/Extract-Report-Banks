import * as dotenv from 'dotenv';
dotenv.config();

export const grandino_infos = {
    url: `${process.env.URL_GRANDINO}`,
    headless: true,
    password: `${process.env.PASSWORD_GRANDINO}`,
    username: `${process.env.USERNAME_GRANDINO}`,
    selector: {
        username: 'input[name="txtUsuario$CAMPO"]',
        password: 'input[name="txtSenha$CAMPO"]',
        btnEntrar: 'input[type="submit"]'
    }
}