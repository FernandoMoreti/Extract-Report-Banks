import { C6BankExtractor } from "./model/C6_bank"

export async function ExtractMapper(bank: string) {

    switch (bank) {
        case "C6 bank Comissao":
            console.log("Iniciando a Extração do C6 Bank")
            const c6_bank = new C6BankExtractor()
            return await c6_bank.Run()
    }
}