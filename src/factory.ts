import { C6BankExtractor } from "./model/C6Bank"
import { GrandinoExtractor } from "./model/Grandino"
import { JbcredExtractor } from "./model/Jbcred"
import { NovosaqueExtractor } from "./model/Novosaque"
import { NovosaqueCartaoExtractor } from "./model/NovosaqueCartao"

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
        case "Jbcred":
            console.log("Iniciando a Extração do Jbcred")
            const jbcred = new JbcredExtractor()
            return await jbcred.Run()
        case "Novo Saque":
            console.log("Iniciando a Extração do Novo Saque")
            const novosaque = new NovosaqueExtractor()
            return await novosaque.Run()
        case "Novo Saque Cartao":
            console.log("Iniciando a Extração do Novo Saque Cartao")
            const novosaquecartao = new NovosaqueCartaoExtractor()
            return await novosaquecartao.Run()
    }
}