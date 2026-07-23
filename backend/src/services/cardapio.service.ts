import prisma from "../config/prisma";
import { RequestContext } from "../utils/request-context";
import * as ProdutoService from "./produto.service";
import * as ComboService from "./combo.service";
import * as PromocaoService from "./promocao.service";

const CATEGORIAS_CARDAPIO = [
  { cat: "PRINCIPAL", titulo: "Principais", tag: "Preparados na hora" },
  { cat: "ACOMPANHAMENTO", titulo: "Acompanhamentos", tag: "Para dividir — ou não" },
  { cat: "SOBREMESA", titulo: "Sobremesas", tag: "O final que a refeição merece" },
  { cat: "BEBIDA", titulo: "Bebidas", tag: "Sempre geladas" },
];

// Espelha frontend/src/utils/format.js (calcComboSomaPrecosVenda/calcComboDesconto) —
// Combo não tem desconto pré-calculado no backend, ao contrário de Promocao.
function calcComboSomaPrecosVenda(combo: { produtos: { quantidade: number; produto: { precoVenda: number } }[] }) {
  return combo.produtos.reduce((s, cp) => s + cp.quantidade * cp.produto.precoVenda, 0);
}

function calcComboDesconto(combo: { preco: number; produtos: { quantidade: number; produto: { precoVenda: number } }[] }) {
  const soma = calcComboSomaPrecosVenda(combo);
  if (soma === 0 || combo.preco >= soma) return null;
  return ((soma - combo.preco) / soma) * 100;
}

export const fmtBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export const montarDadosCardapio = async () => {
  const restauranteId = RequestContext.getRestauranteId()!;

  const [restaurante, produtos, combosRaw, promocoes] = await Promise.all([
    prisma.restaurante.findUnique({ where: { id: restauranteId }, select: { nome: true, logo: true } }),
    ProdutoService.listarProdutos(),
    ComboService.listarCombos(),
    PromocaoService.listarPromocoes(),
  ]);

  const grupos = CATEGORIAS_CARDAPIO.map((g) => ({
    ...g,
    itens: produtos.filter((p) => p.categoria === g.cat),
  })).filter((g) => g.itens.length > 0);

  const combos = combosRaw.map((c) => {
    const precoNormal = calcComboSomaPrecosVenda(c);
    const desconto = calcComboDesconto(c);
    const economia = precoNormal - c.preco;
    return { ...c, precoNormal, desconto, economia };
  });

  // Numeração sequencial das seções pré-calculada aqui (não no template) —
  // mesmo princípio de "calcular antes de renderizar" usado no gerador de relatórios.
  // Ordem: Promoções + Combos (compartilham página) → Principais → Acompanhamentos →
  // Sobremesas → Bebidas. Cada categoria de produto sempre começa em página nova
  // (novaPagina); Promoções/Combos só forçam a quebra na entrada do grupo — entre os
  // dois, se couberem juntos, continuam na mesma página (padrão de overflow atual).
  // comDivisor: o ornamento que abre toda seção, inclusive a primeira (Promoções) —
  // a capa agora é página própria, então a primeira seção também merece o enfeite.
  const secoes: any[] = [];
  let numero = 0;

  if (promocoes.length) {
    numero += 1;
    secoes.push({ tipo: "promocoes", numero, promocoes, novaPagina: true, comDivisor: true });
  }

  if (combos.length) {
    numero += 1;
    secoes.push({ tipo: "combos", numero, combos, novaPagina: secoes.length === 0, comDivisor: true });
  }

  grupos.forEach((g) => {
    numero += 1;
    secoes.push({ tipo: "produtos", numero, titulo: g.titulo, tag: g.tag, itens: g.itens, novaPagina: true, comDivisor: true });
  });

  // Índice de categorias exibido na capa — como ela agora fica sozinha na primeira
  // página, serve de prévia do que o cliente vai encontrar no restante do documento.
  const categoriasIndice = secoes.map((s) =>
    s.tipo === "promocoes" ? "Promoções" : s.tipo === "combos" ? "Combos" : s.titulo
  );

  const dataGeracao = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return { restaurante, secoes, categoriasIndice, dataGeracao, fmtBRL };
};
