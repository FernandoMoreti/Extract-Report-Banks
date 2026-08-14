import * as dotenv from 'dotenv';
dotenv.config();

export const workbank_infos = {
    url: `${process.env.URL_WORKBANK}`,
    headless: true,
    password: `${process.env.PASSWORD_WORKBANK}`,
    username: `${process.env.USERNAME_WORKBANK}`,
    selector: {
        username: 'input[id="usuario"]',
        password: 'input[id="senha"]',
        btnEntrar: 'button[id="bt-59F89FD9F982A44380E32BDCDAA28DCF859C9033ACDF11C3469F2736C1A093E6B68F4C3935B5813A105EE329A2646049A2278F415A8FAD6742E43C7EF0443881"]'
    }
}