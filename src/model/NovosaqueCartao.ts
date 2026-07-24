import { Bank } from "./Bank.ts";
import { novosaque_infos } from "../config/Novosaque.ts";
import path from "node:path";
import { formatWithFixedHour } from "../utils/utils.ts";

const dataBank = novosaque_infos

export class NovosaqueCartaoExtractor extends Bank {

    constructor() {
        super({
            name: "Novosaque",
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
            const initalDate = new Date();
            const endDate = new Date();

            const formattedInitialDate = (formatWithFixedHour(initalDate, true));
            const formattedEndDate = formatWithFixedHour(endDate);

            await this.page?.getByRole('button', { name: ' Saque FGTS' }).click();
            await this.page?.getByRole('menuitem', { name: 'Esteira FGTS' }).click();

            await this.page?.locator('#filter_date_type').selectOption('commission_payment_date');

            await this.page?.locator('#date_init_filter').fill(formattedInitialDate);
            await this.page?.locator('#date_end_filter').fill(formattedEndDate);

            await this.page?.waitForTimeout(1500);

            await this.page?.getByRole('button', { name: 'Filtrar', exact: true }).click();

            await this.page?.waitForTimeout(5000);

            await this.page?.locator('a').filter({ hasText: 'Comissões Pagas' }).click();

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
                    this.page?.getByRole('button', { name: 'Relatório Simples' }).click(),

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