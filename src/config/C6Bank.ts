import * as dotenv from 'dotenv';
dotenv.config();

export const c6_infos = {
    url: `${process.env.URL_C6_BANK}`,
    headless: false,
    password: `${process.env.PASSWORD_C6_BANK}`,
    username: `${process.env.USERNAME_C6_BANK}`,
    selector: {
        username: 'input[name="EUsuario$CAMPO"]',
        password: 'input[name="ESenha$CAMPO"]',
        btnEntrar: 'a[id="lnkEntrar"]'
    }
}