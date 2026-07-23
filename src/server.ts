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
    console.log(`Ativei o RPA do banco: ${bank}`)

    try {
        const filename: string | undefined = await ExtractMapper(bank)

        if (!filename) {
            res.status(404).json({ Status: "Failed", data: "Recebemos undefined quando buscamos o filename" })
        }

        const filePath = path.join('./download', filename!);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('x-filename', encodeURIComponent(filename!));
        res.setHeader('Access-Control-Expose-Headers', 'x-filename');

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('end', () => {
            fs.unlink(filePath, (err) => { if (err) console.error(err); });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno no servidor.');
    }
})

app.listen(3008, () => {
    console.log("Server on, http://localhost:3008")
})