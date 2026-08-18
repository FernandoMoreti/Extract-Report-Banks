import { C6BankExtractor } from "./model/C6Bank"
import { GrandinoExtractor } from "./model/Grandino"
import { JbcredExtractor } from "./model/Jbcred"
// import { NbcExtractor } from "./model/Nbc"
import { NovosaqueExtractor } from "./model/Novosaque"
import { NovosaqueCartaoExtractor } from "./model/NovosaqueCartao"
import { Workbank } from "./model/Workbank"

export async function ExtractMapper(bank: string, logger: (msg: string) => void)     {

    switch (bank) {
        case "Baixa Automatica":
            logger("Iniciando a baixa automática do Workbank")
            const workbank = new Workbank()
            return await workbank.Run((msg: string) => logger(msg))
        case "C6 bank Comissao":
            logger("Iniciando a Extração do C6 Bank")
            const c6_bank = new C6BankExtractor()
            return await c6_bank.Run((msg: string) => logger(msg))
        case "Grandino":
            logger("Iniciando a Extração do Grandino")
            const grandino = new GrandinoExtractor()
            return await grandino.Run((msg: string) => logger(msg))
        case "Jbcred":
            logger("Iniciando a Extração do Jbcred")
            const jbcred = new JbcredExtractor()
            return await jbcred.Run((msg: string) => logger(msg))
        // case "NBC":
        //     logger("Iniciando a Extração do NBC")
        //     const nbc = new NbcExtractor()
        //     return await nbc.Run((msg: string) => logger(msg))
        case "Novo Saque":
            logger("Iniciando a Extração do Novo Saque")
            const novosaque = new NovosaqueExtractor()
            return await novosaque.Run((msg: string) => logger(msg))
        case "Novo Saque Cartao":
            logger("Iniciando a Extração do Novo Saque Cartao")
            const novosaquecartao = new NovosaqueCartaoExtractor()
            return await novosaquecartao.Run((msg: string) => logger(msg))
    }
}