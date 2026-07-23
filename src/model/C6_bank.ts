import { Bank } from "./Bank.ts";
import { c6_infos } from "../config/C6Bank.ts";
import path from "node:path";

const dataBank = c6_infos

export class C6BankExtractor extends Bank {

    constructor() {
        super({
            name: "C6_Bank",
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

                await this.page.waitForTimeout(5000)

                if (this.page.url() == this.url || this.page.url().includes("LOGIN")) {
                    attempt++
                    continue
                }

                await this.page.waitForTimeout(5000)

                return

            } catch (error) {
                throw new Error("Erro ao efetuar o login")
            }
        }
    }

    async Navigate() {

        try {
            await this.page?.waitForSelector(
                '#navbar-collapse-funcao > ul > li:nth-child(2) > a',
            );

            await this.page?.getByRole('button', { name: 'Relatórios', exact: true }).click();
            await this.page?.waitForTimeout(750);
            await this.page?.getByRole('button', { name: 'Relatórios', exact: true }).click();

            const page1Promise = this.page?.waitForEvent('popup');
            await this.page?.getByRole('link', { name: 'Relatórios Gerenciais' }).click();
            const page1 = await page1Promise;

            await page1?.getByRole('link', { name: 'Painel Financeiro' }).click();
            const page2Promise = page1?.waitForEvent('popup');
            await page1?.getByRole('link', { name: '💲 Comissão Flat + Débitos (' }).click();
            const page2 = await page2Promise;

            this.page = page2

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

                await this.page?.waitForTimeout(10000)

                await this.page?.getByRole(
                    'button',
                    { name: 'Analítico Comissão Flat (' },
                ).click();
                await this.page?.getByRole('menuitem', { name: 'Download data' }).click();

                await this.page?.getByRole('dialog', { name: 'Download' }).click();
                await this.page?.getByRole('option',
                    { name: 'Excel Spreadsheet (Excel 2007' },
                ).click();
                await this.page?.getByRole('banner', { name: 'Download' }).click();

                await this.page?.getByRole('button',
                    { name: 'Advanced data options' },
                ).click();
                await this.page?.getByRole('radio', { name: 'All results' }).check();

                const [download] = await Promise.all([
                    this.page?.waitForEvent('download', { timeout: 30000 }),
                    this.page?.getByRole('button', { name: 'Download' }).click({ force: true }),
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