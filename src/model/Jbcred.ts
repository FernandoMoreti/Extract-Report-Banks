import { Bank } from "./Bank.ts";
import { jbcred_infos } from "../config/Jbcred.ts";
import path from "node:path";

const dataBank = jbcred_infos

export class JbcredExtractor extends Bank {

    constructor() {
        super({
            name: "Jbcred",
            url: dataBank.url,
            user: dataBank.username || "",
            password: dataBank.password || "",
            headless: dataBank.headless || false,
            selectors: {
                userSelector: dataBank.selector.username,
                passwordSelector: dataBank.selector.password,
                btnLogin: dataBank.selector.btnEntrar
            },
        });
    }

    async Login(): Promise<void> {
        let attempt = 0
        const maxAttempt = 2

        if (!this.username || !this.password) {
            throw new Error("ERRO: Credenciais não encontradas no arquivo .env");
        }

        while (attempt < maxAttempt) {
            try {
                console.log(`Iniciando tentativa ${attempt + 1} de login...`)

                await this.inicializeBrowser()

                if (!this.page) throw new Error("Página não foi iniciada.");

                // Adicionando o login
                await this.page.waitForSelector(
                    this.selectors.userSelector
                );
                await this.page.fill(
                    this.selectors.userSelector, this.username
                );

                // Adicionando a senha
                await this.page.click(
                    this.selectors.passwordSelector
                );
                await this.page.fill(
                    this.selectors.passwordSelector, this.password
                );

                // Prepara-se para caso tenha algum alert, prompt ou confirm, clicando sempre no OK
                this.page.once('dialog', async d => d.accept());

                // Clicando no entrar
                await this.page.click(this.selectors.btnLogin);

                try {
                    const btnHtml = await this.page.waitForSelector('button:has-text("OK")', { timeout: 3000 });
                    if(btnHtml) await btnHtml.click();
                } catch {}

                await this.page.waitForTimeout(2000)

                if (this.page.url() == this.url || this.page.url().includes("LOGIN")) {
                    attempt++
                    continue
                }

                await this.page.waitForTimeout(2000)

                return

            } catch (error) {
                throw new Error("Erro ao efetuar o login")
            }
        }
    }

    async Navigate() {

        try {
            const today = new Date();

            today.setDate(today.getDate() - 1);

            const day = today.getDate().toString().padStart(2, '0');
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const year = today.getFullYear().toString();

            await this.page?.getByRole('button',{ name: 'Clique aqui para ver suas' },).waitFor({ state: 'visible' });
            await this.page?.getByRole('button',{ name: 'Clique aqui para ver suas' },).click();

            await this.page?.locator('#ctl00_ContentPlaceHolder1_tbPrincipal_TabPanel3_txtSenhaComissao').waitFor({ state: 'visible' });
            await this.page?.locator('#ctl00_ContentPlaceHolder1_tbPrincipal_TabPanel3_txtSenhaComissao',).click();
            await this.page?.locator('#ctl00_ContentPlaceHolder1_tbPrincipal_TabPanel3_txtSenhaComissao',).fill('6H3O6H');

            await this.page?.getByRole('button', { name: 'Acessar' }).click();

            await this.page?.locator('label').filter({ hasText: `até ${day}/${month}/${year}` }).last().click();

            await this.page?.waitForTimeout(1500);

            await this.page?.getByRole('button', { name: 'Submit' }).click();
            await this.page?.getByRole('link', { name: 'Selecionar' }).click();

            return
        } catch (e) {
            console.error("Erro durante o processo de login:", e)

            if (this.browser) {
                await this.browser.close();
                this.browser = undefined;
                this.page = undefined;
            }
        }


    }

    async Download(): Promise<string> {
        let attempt = 0
        const maxAttempts = 3

        while (attempt < maxAttempts) {

            attempt++;

            try {

                const [download] = await Promise.all([
                    this.page?.waitForEvent('download', { timeout: 60000 }),
                    await this.page?.locator('#ctl00_ContentPlaceHolder1_tbPrincipal_TabPanel2_btnExportarDetalhes',).click(),
                ]);

                if (!download) {
                    console.log("Download não recebido")
                    throw new Error("Erro ao realizar o download")
                }

                const fileName = download.suggestedFilename();

                if (!fileName) {
                    throw new Error("Erro ao obter o nome do arquivo baixado")
                }

                const downloadPath = path.resolve('./download', fileName)

                await download.saveAs(downloadPath);

                console.log("Download concluído com sucesso!");

                return fileName
            } catch (e) {
                console.error(`Erro na tentativa ${attempt}:`, e);

                if (attempt >= maxAttempts) {
                    throw new Error(`Falha no download após ${maxAttempts} tentativas. Erro original: ${e}`);
                }

                await this.page?.waitForTimeout(3000);
            }
        }

        throw new Error("Falha no download após as tentativas disponíveis.")
    }
}