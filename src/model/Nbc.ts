// import { Bank } from "./Bank.ts";
// import path from "node:path";
// import { formatWithFixedHour } from "../utils/utils.ts";
// import { nbc_infos } from "../config/Nbc.ts";

// const dataBank = nbc_infos

// export class NbcExtractor extends Bank {

//     constructor() {
//         super({
//             name: "Nbc",
//             url: dataBank.url,
//             user: dataBank.username || "",
//             password: dataBank.password || "",
//             headless: dataBank.headless || false,
//             selectors: {
//                 userSelector: dataBank.selector.username,
//                 passwordSelector: dataBank.selector.password,
//                 btnLogin: dataBank.selector.btnEntrar
//             },
//         });
//     }

//     async Login(): Promise<void> {
//         let attempt = 0
//         const maxAttempt = 2

//         if (!this.username || !this.password) {
//             throw new Error("ERRO: Credenciais não encontradas no arquivo .env");
//         }

//         while (attempt < maxAttempt) {
//             try {
//                 console.log(`Iniciando tentativa ${attempt + 1} de login...`)

//                 await this.inicializeBrowser()

//                 if (!this.page) throw new Error("Página não foi iniciada.");

//                 // Adicionando o login
//                 await this.page.waitForSelector(
//                     this.selectors.userSelector
//                 );
//                 await this.page.fill(
//                     this.selectors.userSelector, this.username
//                 );

//                 // Adicionando a senha
//                 await this.page.click(
//                     this.selectors.passwordSelector
//                 );
//                 await this.page.fill(
//                     this.selectors.passwordSelector, this.password
//                 );

//                 // Prepara-se para caso tenha algum alert, prompt ou confirm, clicando sempre no OK
//                 this.page.once('dialog', async d => d.accept());

//                 // Clicando no entrar
//                 await this.page.click(this.selectors.btnLogin);

//                 try {
//                     const btnHtml = await this.page.waitForSelector('button:has-text("OK")', { timeout: 3000 });
//                     if(btnHtml) await btnHtml.click();
//                 } catch {}

//                 await this.page.waitForTimeout(2000)

//                 if (this.page.url() == this.url || this.page.url().includes("LOGIN")) {
//                     attempt++
//                     continue
//                 }

//                 await this.page.waitForTimeout(2000)

//                 return

//             } catch (error) {
//                 throw new Error("Erro ao efetuar o login")
//             }
//         }
//     }

//     async Navigate() {

//         try {

//             const today = new Date().getDate();

//             await this.page?.getByRole('button', { name: 'Relatórios' }).click();
//             await this.page?.getByRole('button', { name: 'Relatórios' }).click();
//             await this.page?.getByRole('link', { name: 'SIC - Sistema Integrado de' }).click();

//             await this.page?.locator('#ctl00_Cph_ddlCODSIST').selectOption('909');
//             await this.page?.getByRole('row', { name: 'Gerenciais', exact: true }).getByRole('link').click();
//             await this.page?.getByRole('link', { name: 'Comissões a Receber' }).click();

//             await this.page?.locator('#ctl00_Cph_ucVar_ucVarU_dl_ctl00_uc_BackofficeCmss_E_CODBACK_CAMPO').click();
//             await this.page?.locator('#ctl00_Cph_ucVar_ucVarU_dl_ctl00_uc_BackofficeCmss_E_CODBACK_CAMPO').fill('01');
//             await this.page?.getByRole('cell', { name: 'Comissões a Receber* Backoffice 01 Tipo de Impressão: Pesquisar Por: Quebrar' }).click();
//             await this.page?.locator('#ctl00_Cph_ucVar_ucVarU_dl_ctl00_uc_CodComissionado_E_COD_CAMPO').click();
//             await this.page?.locator('#ctl00_Cph_ucVar_ucVarU_dl_ctl00_uc_CodComissionado_E_COD_CAMPO').fill('2500');

//             await this.page?.waitForTimeout(1000)

//             await this.page?.locator('#ctl00_Cph_ucVar_ucVarU_dl_ctl00_uc_Periodo_txtInicial_CAMPO').pressSequentially(` ${today}`, { delay: 1000 });
//             await this.page?.locator('#ctl00_Cph_ucVar_ucVarU_dl_ctl00_uc_Periodo_txtFinal_CAMPO').pressSequentially(` ${today}`, { delay: 1000 });

//             await this.page?.locator('div').filter({ hasText: 'Entrega' }).nth(3).click();

//             await this.page?.waitForTimeout(1000)

//             await this.page?.locator('#ctl00_Cph_ucReq_ucEntr_RQFMTARQ_CAMPO').selectOption({ value: 'E' });

//             return
//         } catch (e) {
//             console.error("Erro durante o processo de login:", e)

//             if (this.browser) {
//                 await this.browser.close();
//                 this.browser = undefined;
//                 this.page = undefined;
//             }
//         }
//     }

//     async Download(): Promise<string> {
//         let attempt = 0
//         const maxAttempts = 3

//         while (attempt < maxAttempts) {

//             attempt++;

//             try {

//                 await this.page?.pause()

//                 const [download] = await Promise.all([
//                     this.page?.waitForEvent('download', { timeout: 60000 }),
//                     await this.page?.getByRole('cell', { name: 'Gerar', exact: true }).click()
//                 ]);

//                 if (!download) {
//                     console.log("Download não recebido")
//                     throw new Error("Erro ao realizar o download")
//                 }

//                 const fileName = download.suggestedFilename();

//                 if (!fileName) {
//                     throw new Error("Erro ao obter o nome do arquivo baixado")
//                 }

//                 const downloadPath = path.resolve('./download', fileName)

//                 await download.saveAs(downloadPath);

//                 console.log("Download concluído com sucesso!");

//                 return fileName
//             } catch (e) {
//                 console.error(`Erro na tentativa ${attempt}:`, e);

//                 if (attempt >= maxAttempts) {
//                     throw new Error(`Falha no download após ${maxAttempts} tentativas. Erro original: ${e}`);
//                 }

//                 await this.page?.waitForTimeout(3000);
//             }
//         }

//         throw new Error("Falha no download após as tentativas disponíveis.")
//     }
// }

// QUANDO PEGAR PARA FAZER REVISAR POIS NN TEM COMO SABER SE O ARQUIVO ESTA VAZIO OU NN
