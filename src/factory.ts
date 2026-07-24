import { C6BankExtractor } from "./model/C6Bank"
import { GrandinoExtractor } from "./model/Grandino"

export async function ExtractMapper(bank: string) {

    switch (bank) {
        case "C6 bank Comissao":
            console.log("Iniciando a Extração do C6 Bank")
            const c6_bank = new C6BankExtractor()
            return await c6_bank.Run()
        case "Grandino":
            console.log("Iniciando a Extração do Grandino")
            const grandino = new GrandinoExtractor()
            return await grandino.Run()
    }
}