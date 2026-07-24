import * as dotenv from 'dotenv';
dotenv.config();

export const novosaque_infos = {
    url: `${process.env.URL_NOVOSAQUE}`,
    headless: false,
    password: `${process.env.PASSWORD_NOVOSAQUE}`,
    username: `${process.env.USERNAME_NOVOSAQUE}`,
    selector: {
        username: 'input[id="email"]',
        password: 'input[id="password"]',
        btnEntrar: 'button[class="my-3 btn-block btn btn-primary"]'
    }
}