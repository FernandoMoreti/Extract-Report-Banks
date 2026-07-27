import * as dotenv from 'dotenv';
dotenv.config();

export const jbcred_infos = {
    url: `${process.env.URL_JBCRED}`,
    headless: true,
    password: `${process.env.PASSWORD_JBCRED}`,
    username: `${process.env.USERNAME_JBCRED}`,
    selector: {
        username: 'input[id="ctl00_txtUsuario"]',
        password: 'input[id="ctl00_txtSenha"]',
        btnEntrar: 'input[id="ctl00_btnLogin"]'
    }
}