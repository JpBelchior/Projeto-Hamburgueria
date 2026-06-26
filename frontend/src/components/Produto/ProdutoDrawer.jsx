import { Power } from "lucide-react";
import { Clock, TrendingUp } from "lucide-react";
import { DrawerSection } from "../Ui/Drawer";
import Avatar from "../Ui/Avatar";
import Button from "../Ui/Button";
import { fmtBRL, CAT_LABEL, CAT_COLOR, ACCENT, calcLucro, calcMargem, margemStyle } from "../../utils/format";
import { UNIDADE_LABEL } from "../../constants";
import { useProdutoDrawer } from "../../hooks/useProdutoDrawer";
import { produtoService } from "../../services/produto.service";
import EntityDrawerShell from "../Ui/EntityDrawerShell";
import ProdutoForm from "./ProdutoForm";

// ── Vista de detalhes ─────────────────────────────────────────────────────────

function DetalheView({ produto, desempenho, periodoLabel }) {
  const lucro  = calcLucro(produto);
  const margem = calcMargem(produto);

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

      <div className="flex items-start gap-4">
        <Avatar name={produto.nome} src={produto.imagem ?? undefined} size="lg" />
        <div className="flex-1 min-w-0">
          {produto.descricao && (
            <p className="text-slate-400 text-sm leading-relaxed mb-2">{produto.descricao}</p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            {produto.tempoPreparoEstimado && (
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-slate-500" />
                <span className="text-slate-500 text-xs">{produto.tempoPreparoEstimado} min</span>
              </div>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${
              produto.ativo
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                : "bg-slate-700/40 text-slate-500 border-slate-600/30"
            }`}>
              {produto.ativo ? "Ativo no cardápio" : "Inativo"}
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* Precificação */}
      <div>
        <DrawerSection>Precificação</DrawerSection>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
            <p className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">Preço de Custo</p>
            <p className="text-white text-base font-bold tabular-nums">
              {produto.precoProducao != null ? fmtBRL(produto.precoProducao) : "—"}
            </p>
            <p className="text-slate-600 text-[10px] mt-0.5">soma da ficha técnica</p>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
            <p className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">Preço de Venda</p>
            <p className="text-base font-bold tabular-nums" style={{ color: ACCENT.text }}>
              {fmtBRL(produto.precoVenda)}
            </p>
            <p className="text-slate-600 text-[10px] mt-0.5">valor de cardápio</p>
          </div>
        </div>

        {lucro != null && (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={13} className="text-emerald-400 shrink-0" />
              <span className="text-slate-400 text-xs">Lucro por unidade</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-sm font-semibold tabular-nums">+{fmtBRL(lucro)}</span>
              {margem !== null && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${margemStyle(margem)}`}>
                  {margem}% margem
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ficha técnica */}
      {produto.ingredientes?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <DrawerSection>Ingredientes · Ficha Técnica</DrawerSection>
            <span className="text-slate-600 text-[10px] -mt-3">
              {produto.ingredientes.length} {produto.ingredientes.length === 1 ? "item" : "itens"}
            </span>
          </div>

          <div className="flex flex-col">
            {produto.ingredientes.map((pi, idx) => (
              <div key={idx} className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0">
                <span className="text-white text-xs">{pi.ingrediente.nome}</span>
                <span className="text-slate-500 text-xs tabular-nums">
                  {pi.quantidadeUsada} {UNIDADE_LABEL[pi.ingrediente.unidade] ?? pi.ingrediente.unidade}
                </span>
              </div>
            ))}
          </div>

          {produto.precoProducao != null && (
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-700/50">
              <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold">Preço de Custo</span>
              <span className="text-white text-sm font-bold tabular-nums">{fmtBRL(produto.precoProducao)}</span>
            </div>
          )}
        </div>
      )}

      {/* Desempenho */}
      <div>
        <DrawerSection>Desempenho · {periodoLabel}</DrawerSection>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
            <p className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">Unidades Vendidas</p>
            <p className="text-white text-xl font-bold tabular-nums">{desempenho?.qtdVendida ?? 0}</p>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
            <p className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">Receita Gerada</p>
            <p className="text-base font-bold tabular-nums" style={{ color: ACCENT.text }}>
              {fmtBRL(desempenho?.receita ?? 0)}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ProdutoDrawer({
  produtoId,
  createMode = false,
  periodo,
  periodoLabel,
  onClose,
  onProdutoCriado,
  onProdutoAtualizado,
  onProdutoDeletado,
}) {
  const { produto, desempenho, loading, erro, salvando, erroSalvar, handleToggleAtivo, handleSalvar, handleDelete } =
    useProdutoDrawer(produtoId, periodo, { onProdutoAtualizado, onProdutoDeletado });

  const color  = produto ? (CAT_COLOR[produto.categoria] ?? "#fbbf24") : "#fbbf24";
  const label  = produto ? (CAT_LABEL[produto.categoria] ?? produto.categoria) : "";

  return (
    <EntityDrawerShell
      item={produto}
      loading={loading} erro={erro}
      salvando={salvando} erroSalvar={erroSalvar}
      handleSalvar={handleSalvar} handleDelete={handleDelete}
      createMode={createMode} onClose={onClose}
      accentColor={createMode ? ACCENT.from : color}
      createTitle="Novo Produto"
      editTitle="Editar Produto"
      headerBadge={
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0"
          style={{ color, background: `${color}20`, border: `1px solid ${color}30` }}
        >
          {label}
        </span>
      }
      Form={ProdutoForm}
      onCriar={(data) => produtoService.criar(data)}
      onCriado={onProdutoCriado}
      confirmTitle="Excluir produto"
      confirmMessage={(() => {
        const combosQueContem    = produto?.combosQueContem    ?? [];
        const promocoesQueContem = produto?.promocoesQueContem ?? [];
        const combosAExcluir    = produto?.combosAExcluir    ?? [];
        const promocoesAExcluir = produto?.promocoesAExcluir ?? [];
        const temVinculos = combosQueContem.length > 0 || promocoesQueContem.length > 0;
        const partes = [
          temVinculos
            ? `Tem certeza que deseja excluir "${produto?.nome}"? O produto será removido de todos os combos e promoções onde está incluso.`
            : `Tem certeza que deseja excluir "${produto?.nome}"? O produto será removido do cardápio.`,
        ];
        if (combosQueContem.length > 0) {
          partes.push(`Os combos são: ${combosQueContem.join(", ")}.`);
        }
        if (promocoesQueContem.length > 0) {
          partes.push(`As promoções são: ${promocoesQueContem.join(", ")}.`);
        }
        for (const nomeCombo of combosAExcluir) {
          partes.push(`Como esse é o único produto do combo "${nomeCombo}", também o excluiremos.`);
        }
        for (const nomePromocao of promocoesAExcluir) {
          partes.push(`Como esse é o único item da promoção "${nomePromocao}", também a excluiremos.`);
        }
        return partes.join("\n\n");
      })()}
      footerActions={
        produto && (
          <Button variant="ghost" size="sm" icon={Power} onClick={handleToggleAtivo}>
            {produto.ativo ? "Desativar" : "Ativar"}
          </Button>
        )
      }
    >
      <DetalheView produto={produto} desempenho={desempenho} periodoLabel={periodoLabel} />
    </EntityDrawerShell>
  );
}
