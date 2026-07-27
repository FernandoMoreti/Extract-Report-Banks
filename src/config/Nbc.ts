import * as dotenv from 'dotenv';
dotenv.config();

export const nbc_infos = {
    url: `${process.env.URL_NBC}`,
    headless: false,
    password: `${process.env.PASSWORD_NBC}`,
    username: `${process.env.USERNAME_NBC}`,
    selector: {
        username: 'input[name="EUsuario$CAMPO"]',
        password: 'input[name="ESenha$CAMPO"]',
        btnEntrar: 'a[id="lnkEntrar"]'
    }
}