export interface BrowserOptions {
    geolocation?: { latitude: number; longitude: number };
    permissions?: string[];
    locale?: string;
    name?: string
}

export interface LoginSelectors {
    userSelector: string
    passwordSelector: string
    btnLogin: string
}

export interface BankConfig {
    name: string
    url: string
    user: string
    password: string
    headless: boolean
    selectors: LoginSelectors
}