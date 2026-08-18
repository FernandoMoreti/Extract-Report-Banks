import express, { Request, Response } from "express";
import cors from 'cors'
import { ExtractMapper } from "./factory";
import path from "node:path";
import fs from "fs"

const app = express()

app.use(express.json())
app.use(cors())

app.post('/api/rpa/', async (req: Request, res: Response) => {
    const { bank } = req.body

    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendChunk = (type: 'log' | 'error' | 'success' | 'file', message: string, extra = {}) => {
        res.write(JSON.stringify({ type, message, ...extra }) + '\n');
    }

    try {
        sendChunk('log', `Ativei o RPA do banco: ${bank}`);

        sendChunk('log', `Buscando mapeamento para ${bank}...`);

        const filename: string | undefined = await ExtractMapper(bank, (msg: string) => sendChunk('log', msg))

        if (!filename) {
            sendChunk('error', "Recebemos undefined quando buscamos o filename");
            return res.end()
        }

        if (filename == "Hoje não é dia de Buscar relatórios") {
            sendChunk('error', filename)
            return res.end()
        } else if (filename == "Nenhum registo localizado no banco") {
            sendChunk('error', filename)
            return res.end()
        } else if (filename == "Nenhum valor zerado ou negativo encontrado") {
            sendChunk('error', filename)
            return res.end()
        } else if (filename == "Workbank") {
            sendChunk('log', "Baixa automatica realizada com sucesso!!!")
            return res.end()
        }

        sendChunk('log', `Arquivo encontrado: ${filename}. Preparando download...`);

        const filePath = path.join('./download', filename!);

        const fileBuffer = fs.readFileSync(filePath);
        const base64File = fileBuffer.toString('base64');

        sendChunk('file', 'Arquivo pronto', {
            fileData: base64File,
            filename: filename
        });

        fs.unlink(filePath, (err) => {
            if (err) console.error("Erro ao deletar arquivo temporário:", err); 
        });

        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno no servidor.');
    }
})

app.listen(3008, () => {
    console.log("Server on, http://localhost:3008")
})