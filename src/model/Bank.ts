import { Browser, chromium, Page } from 'playwright'
import { BankConfig, BrowserOptions, LoginSelectors } from '../types/types'
import { hasReportToday } from '../utils/utils';

export abstract class Bank {

    protected bankName: string;
    protected page: Page | undefined;
    protected browser: Browser | undefined;
    protected url: string;
    protected headless: boolean;
    protected username: string;
    protected password: string;
    protected selectors: LoginSelectors

    constructor(config: BankConfig) {
        this.bankName = config.name
        this.url = config.url
        this.headless = config.headless
        this.username = config.user
        this.password = config.password
        this.selectors = config.selectors
    }

    async OpenBrowser(url: string, headless: boolean = true, options?: BrowserOptions) {

        console.log('Abrindo o navegador')

        const browser = await chromium.launch({
            headless: headless
        })

        const context = await browser.newContext({
            viewport: null,
            acceptDownloads: true,
            locale: options?.locale || 'pt-BR',
            geolocation: options?.geolocation,
            permissions: options?.permissions || [],
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })

        const page = await context.newPage()

        if (options?.name == "C6Bank" || options?.name == "QualiBank") {
            await page.goto(url)

            await page.waitForLoadState('networkidle')

            return { browser, context, page }
        }

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })

        await page.waitForTimeout(3000)

        return { browser, page }
    }

    async inicializeBrowser() {
        const options = {
            permissions: ['geolocation'],
            geolocation: { latitude: -23.5505, longitude: -46.6333 },
            locale: 'pt-BR',
            name: this.bankName
        }

        const browserInstance = await this.OpenBrowser(this.url, this.headless, options)
        this.page = browserInstance.page
        this.browser = browserInstance.browser
    }

    abstract Login(): Promise<void>;

    abstract Navigate(): Promise<string | void>

    abstract Download(): Promise<string>

    async CloseBrowser(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
        }
    }

    public async Run(): Promise<string | undefined> {
        console.log(`\nIniciando Robo: ${this.bankName} `);

        try {

            // const hasReport = await hasReportToday(this.bankName)

            // if (typeof hasReport === 'string') {
            //     return hasReport
            // }

            console.log(`[${this.bankName}] Logando no site...`);
            await this.Login();

            console.log(`[${this.bankName}] Navegando para extrair o relatório...`);
            const navigateData = await this.Navigate();

            if (navigateData) {
                return navigateData
            }

            console.log(`[${this.bankName}] Iniciando download do relatório...`);
            const filename = await this.Download();

            if (!filename) {
                throw new Error("Nome do arquivo nnão foi encontrado")
            }

            console.log(`[${this.bankName}] Processo finalizado com SUCESSO!`);

            return filename

        } catch (error) {
            console.error(`[${this.bankName}] FALHA CRÍTICA:`, error);
            return undefined;
        } finally {
            await this.CloseBrowser();
            console.log(`Fechando Browser...\n`);
        }
    }
}