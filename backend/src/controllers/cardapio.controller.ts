import { Request, Response } from "express";
import path from "path";
import ejs from "ejs";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";
import * as CardapioService from "../services/cardapio.service";

const TEMPLATE_PATH = path.join(__dirname, "..", "..", "templates", "cardapio", "cardapio.ejs");

export const gerarPDF = async (req: Request, res: Response): Promise<void> => {
  let browser;
  try {
    const dados = await CardapioService.montarDadosCardapio();

    browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Capa e conteúdo são renderizados como documentos HTML separados (ver "modo"
    // em cardapio.ejs) e depois unidos num único PDF — assim o rodapé fixo do
    // conteúdo nunca aparece na capa, sem precisar calcular a altura dela pra
    // "escondê-lo" por baixo (abordagem que se mostrou frágil).
    const htmlCapa = await ejs.renderFile(TEMPLATE_PATH, { ...dados, modo: "capa" });
    await page.setContent(htmlCapa, { waitUntil: "load" });
    await page.evaluateHandle("document.fonts.ready"); // espera Google Fonts carregarem antes de gerar o PDF
    const pdfCapa = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0.6in", bottom: "0.6in", left: "0.6in", right: "0.6in" },
    });

    const htmlConteudo = await ejs.renderFile(TEMPLATE_PATH, { ...dados, modo: "conteudo" });
    await page.setContent(htmlConteudo, { waitUntil: "load" });
    await page.evaluateHandle("document.fonts.ready");
    const pdfConteudo = await page.pdf({
      format: "A4",
      printBackground: true,
      // bottom maior que os demais lados: reserva a faixa onde o rodapé fixo
      // (position: fixed, ver cardapio.ejs) fica, pra nunca sobrepor o último
      // item da página.
      margin: { top: "0.6in", bottom: "0.85in", left: "0.6in", right: "0.6in" },
    });

    const documentoFinal = await PDFDocument.create();
    for (const bytes of [pdfCapa, pdfConteudo]) {
      const doc = await PDFDocument.load(bytes);
      const paginas = await documentoFinal.copyPages(doc, doc.getPageIndices());
      paginas.forEach((p) => documentoFinal.addPage(p));
    }
    const pdfBuffer = Buffer.from(await documentoFinal.save());

    const nomeArquivo = dados.restaurante?.nome
      ? `cardapio-${dados.restaurante.nome.replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase()}.pdf`
      : "cardapio.pdf";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${nomeArquivo}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Erro ao gerar PDF do cardápio:", error);
    res.status(500).json({ message: "Erro ao gerar o PDF do cardápio." });
  } finally {
    await browser?.close();
  }
};
