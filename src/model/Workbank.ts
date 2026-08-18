import { workbank_infos } from "../config/Workbank";
import { convertValues } from "../utils/utils";
import { Bank } from "./Bank";

const dataBank = workbank_infos

export class Workbank extends Bank {

    constructor() {
        super({
            name: "Workbank",
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

    async Login() {
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

                await this.page.getByRole(
                    'textbox', { name: 'Nome do usuário' }
                ).press('Enter');

                // Adicionando a senha
                await this.page.click(
                    this.selectors.passwordSelector
                );
                await this.page.fill(
                    this.selectors.passwordSelector, this.password
                );

                await this.page.getByRole(
                    'textbox', { name: 'Senha' }
                ).press('Enter');

                // Prepara-se para caso tenha algum alert, prompt ou confirm, clicando sempre no OK
                this.page.once('dialog', async d => d.accept());

                // Clicando no entrar
                await this.page.getByRole('button', { name: 'OPERACIONAL' }).click();;

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

            const closeButton = this.page?.getByTitle('Fechar')

            if (closeButton && (await closeButton.isVisible())) {
                await closeButton.click();
            }

            await this.page?.waitForTimeout(1500)

            await this.page?.goto('https://lev.workbankvirtual.com.br/n/PROCESSO/ACERTOCOMISSAO.ASPX')

            await this.page?.waitForTimeout(5000)

            await this.page?.getByText('Pesquisar search').click();

            return

        } catch(error) {
            console.error("Erro no Navigate: " + error)
            throw new Error("Erro no Navigate")
        }
    }

    async FindZeroValues(): Promise<string | void> {
        try {

            await this.page?.getByLabel('Exibir 102550Todos resultados').selectOption('-1');
            await this.page?.getByRole('columnheader', { name: 'RESUMO DE VALORES: Ordenar' }).click();

            const labelsComissao = this.page?.locator('label[title="Valor da comissão"]');
            const count = await labelsComissao!.count();

            let countSelected: number = 0;

            for (let i = 0; i < count!; i++) {
                const labelAtual = labelsComissao!.nth(i);
                const textoComissao = (await labelAtual.innerText()).trim();

                const value = await convertValues(textoComissao)

                if (!value) {
                    continue
                }

                await labelAtual.locator('xpath=./ancestor::tr').locator('td.select-checkbox').click()

                countSelected++
            }

            if (countSelected === 0) {
                return "Nenhum valor zerado ou negativo encontrado"
            }

            return
        } catch(error) {
            console.error("Erro ao buscar zeradas: " + error)
            throw new Error("Erro ao buscar zeradas")
        }
    }

    async CheckAll() {
        try {
            await this.page?.getByRole('button', { name: 'Iniciar Acerto fact_check' }).click();

            await this.page?.waitForTimeout(5000)

            let hasMore = true;

            while (hasMore) {

                const card = this.page?.getByText('edit_note').first()
                const cardCount = this.page?.getByText('edit_note')

                const count = await cardCount!.count();

                console.log(`Contagem de cards em confirmação: ${count}`)

                if (count === 0) {
                    console.log("Não há mais itens para processar.");
                    break;
                }

                await card!.click();

                await this.page?.getByText('Sim thumb_up_alt').waitFor({ state: "visible"});
                await this.page?.getByText('Sim thumb_up_alt').click();

                await this.page?.waitForTimeout(1000);
            }

            await this.page?.waitForTimeout(5000)

            return

        } catch (error) {
            console.error("Erro ao confirmar os valores zerados: " + error)
            throw new Error("Erro ao confirmar os valores zerados")
        }

    }

    async Download() {
        try {

            await this.page?.getByText('Prosseguir play_for_work').click();

            await this.page?.waitForTimeout(10000)

            await this.page?.getByText('Concluir cloud_done').waitFor({ state: "visible"});
            await this.page?.getByText('Concluir cloud_done').click();

            await this.page?.waitForTimeout(10000)

            return
        } catch (error) {
            console.error("Erro ao processar valores zerados(finalizar): " + error)
            throw new Error("Erro ao processar valores zerados(finalizar)")
        }
    }

    async Run(logger: (msg: string) => void) {
        logger(`\nIniciando Robo: ${this.bankName} `);

        try {

            logger(`[${this.bankName}] Logando no site...`);
            await this.Login();

            logger(`[${this.bankName}] Navegando para extrair o relatório...`);
            await this.Navigate();

            logger(`[${this.bankName}] Iniciando procura por valores zerados ou menores que zero...`);
            const hasZero = await this.FindZeroValues();

            if (hasZero == "Nenhum valor zerado ou negativo encontrado") {
                logger(`[${this.bankName}] Não foram encontrados valores zerados ou negativos. Encerrando processo.`);
                return "Nenhum valor zerado ou negativo encontrado"
            }

            logger(`[${this.bankName}] Confirmando valores encontrados...`);
            await this.CheckAll()

            logger(`[${this.bankName}] Processando valores...`);
            await this.Download()

            logger(`[${this.bankName}] Processo finalizado com SUCESSO!`);

            return "Workbank"

        } catch (error) {
            logger(`[${this.bankName}] FALHA CRÍTICA: ` + error);
            return "Nenhum valor zerado ou negativo encontrado";
        } finally {
            await this.CloseBrowser();
            logger(`Fechando Browser...\n`);
        }
    }
}
