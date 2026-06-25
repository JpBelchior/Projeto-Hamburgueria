import { useState } from "react";
import { Power, ChevronDown } from "lucide-react";
import { Clock, TrendingDown, TrendingUp } from "lucide-react";
import { DrawerSection } from "../Ui/Drawer";
import Button from "../Ui/Button";
import { fmtBRL, CAT_COLOR, margemStyle } from "../../utils/format";
import { usePromocaoDrawer } from "../../hooks/usePromocaoDrawer";
import { promocaoService } from "../../services/promocao.service";
import EntityDrawerShell from "../Ui/EntityDrawerShell";
import PromocaoForm from "./PromocaoForm";

// ── Vista de detalhes ─────────────────────────────────────────────────────────

function DetalheView({ promocao, desempenho, periodoLabel }) {
  const [expandido, setExpandido] = useState(null);
  const color = CAT_COLOR.PROMOCAO;

  const totalCombos   = (promocao.combos   ?? []).reduce((s, pc) => s + pc.combo.preco        * (pc.quantidade ?? 1), 0);
  const totalProdutos = (promocao.produtos  ?? []).reduce((s, pp) => s + pp.produto.precoVenda * (pp.quantidade ?? 1), 0);

  const custoCombos   = (promocao.combos   ?? []).reduce((s, pc) =>
    s + (pc.quantidade ?? 1) * (pc.combo.produtos ?? []).reduce((cs, cp) => cs + cp.quantidade * (cp.produto.precoProducao ?? 0), 0), 0);
  const custoProdutos = (promocao.produtos ?? []).reduce((s, pp) =>
    s + (pp.quantidade ?? 1) * (pp.produto.precoProducao ?? 0), 0);
  const custo = custoCombos + custoProdutos;

  const margem = (custo > 0 && promocao.precoReal != null)
    ? ((promocao.precoReal - custo) / custo) * 100
    : null;

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

      {/* Info geral */}
      <div className="flex flex-col gap-2">
        {promocao.descricao && (
          <p className="text-slate-400 text-sm leading-relaxed">{promocao.descricao}</p>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          {promocao.tempoPreparo && (
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-slate-500" />
              <span className="text-slate-500 text-xs">{promocao.tempoPreparo} min</span>
            </div>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${
            promocao.ativo
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
              : "bg-slate-700/40 text-slate-500 border-slate-600/30"
          }`}>
            {promocao.ativo ? "Ativa" : "Inativa"}
          </span>
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
              {custo > 0 ? fmtBRL(custo) : "—"}
            </p>
            <p className="text-slate-600 text-[10px] mt-0.5">soma do custo de produção</p>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
            <p className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">Preço com Desconto</p>
            <p className="text-base font-bold tabular-nums" style={{ color }}>
              {promocao.precoReal != null ? fmtBRL(promocao.precoReal) : "—"}
            </p>
            <p className="text-slate-600 text-[10px] mt-0.5">valor final ao cliente</p>
          </div>
        </div>

        {margem != null && (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={13} className="text-emerald-400 shrink-0" />
              <div>
                <p className="text-slate-400 text-xs">Margem de lucro</p>
                <p className="text-slate-600 text-[10px]">lucro sobre o custo de produção dos itens</p>
              </div>
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border shrink-0 ${margemStyle(margem)}`}>
              {margem.toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Itens incluídos */}
      {(promocao.combos?.length > 0 || promocao.produtos?.length > 0) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <DrawerSection>Itens Incluídos</DrawerSection>
            <span className="text-slate-600 text-[10px] -mt-3">
              {(promocao.combos?.length ?? 0) + (promocao.produtos?.length ?? 0)} itens
            </span>
          </div>

          <div className="flex flex-col">
            {promocao.combos?.map((pc, idx) => {
              const aberto = expandido === pc.combo.id;
              const temProdutos = (pc.combo.produtos?.length ?? 0) > 0;
              return (
                <div key={`c-${pc.combo.id}`} className="border-b border-slate-800/60 last:border-0">
                  <button
                    type="button"
                    onClick={() => temProdutos && setExpandido(aberto ? null : pc.combo.id)}
                    className={`flex items-center justify-between py-2.5 w-full text-left -mx-1 px-1 rounded-lg transition-colors group ${temProdutos ? "hover:bg-slate-800/40 cursor-pointer" : "cursor-default"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums" style={{ background: `${CAT_COLOR.PROMOCAO}18`, color: CAT_COLOR.PROMOCAO, border: `1px solid ${CAT_COLOR.PROMOCAO}30` }}>
                        ×{pc.quantidade ?? 1}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${CAT_COLOR.COMBO}18`, color: CAT_COLOR.COMBO, border: `1px solid ${CAT_COLOR.COMBO}30` }}>Combo</span>
                      <span className="text-white text-xs">{pc.combo.nome}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-500 text-xs tabular-nums">{fmtBRL(pc.combo.preco * (pc.quantidade ?? 1))}</span>
                      {temProdutos && (
                        <ChevronDown size={13} className={`text-slate-500 transition-transform duration-200 ${aberto ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </button>

                  {aberto && (
                    <div className="mb-2 ml-2 pl-3 border-l-2 border-slate-700/60 flex flex-col gap-1">
                      {pc.combo.produtos.map((cp, i) => (
                        <div key={i} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold px-1 py-0.5 rounded tabular-nums" style={{ background: `${CAT_COLOR.COMBO}18`, color: CAT_COLOR.COMBO, border: `1px solid ${CAT_COLOR.COMBO}30` }}>
                              ×{cp.quantidade}
                            </span>
                            <span className="text-slate-300 text-xs">{cp.produto.nome}</span>
                          </div>
                          <span className="text-slate-600 text-xs tabular-nums">{fmtBRL(cp.produto.precoVenda)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {promocao.produtos?.map((pp, idx) => (
              <div key={`p-${idx}`} className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums " style={{ background: `${CAT_COLOR.PROMOCAO}18`, color: CAT_COLOR.PROMOCAO , border: `1px solid ${CAT_COLOR.PROMOCAO}30` }}>
                    ×{pp.quantidade ?? 1}
                  </span>
                  <span className="text-white text-xs">{pp.produto.nome}</span>
                </div>
                <span className="text-slate-500 text-xs tabular-nums mr-7">{fmtBRL(pp.produto.precoVenda * (pp.quantidade ?? 1))}</span>
              </div>
            ))}
          </div>

          {(totalCombos + totalProdutos) > 0 && (
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-700/50">
              <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold">Total</span>
              <span className="text-white text-sm font-bold tabular-nums">{fmtBRL(totalCombos + totalProdutos)}</span>
            </div>
          )}

          {promocao.desconto != null && promocao.precoReal != null && (
            <div className="mt-3 bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <TrendingDown size={13} className="text-fuchsia-400 shrink-0" />
                <div>
                  <p className="text-slate-400 text-xs">Desconto da promoção</p>
                  <p className="text-slate-600 text-[10px]">economia de {fmtBRL((totalCombos + totalProdutos) - promocao.precoReal)} para o cliente</p>
                </div>
              </div>
              <span className="text-fuchsia-400 text-sm font-semibold tabular-nums shrink-0">
                {promocao.desconto.toFixed(1)}% off
              </span>
            </div>
          )}
        </div>
      )}

      {/* Desempenho */}
      <div>
        <DrawerSection>Desempenho · {periodoLabel}</DrawerSection>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
            <p className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">Pedidos</p>
            <p className="text-white text-xl font-bold tabular-nums">{desempenho?.qtdVendida ?? 0}</p>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
            <p className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">Receita Gerada</p>
            <p className="text-base font-bold tabular-nums" style={{ color }}>
              {fmtBRL(desempenho?.receita ?? 0)}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function PromocaoDrawer({
  promocaoId,
  createMode  = false,
  periodo     = "30dias",
  periodoLabel = "30 dias",
  onClose,
  onPromocaoCriada,
  onPromocaoAtualizada,
  onPromocaoDeletada,
}) {
  const { promocao, desempenho, loading, erro, salvando, erroSalvar, handleToggleAtivo, handleSalvar, handleDelete } =
    usePromocaoDrawer(promocaoId, periodo, { onAtualizado: onPromocaoAtualizada, onDeletado: onPromocaoDeletada });

  const color = CAT_COLOR.PROMOCAO;

  return (
    <EntityDrawerShell
      item={promocao}
      loading={loading} erro={erro}
      salvando={salvando} erroSalvar={erroSalvar}
      handleSalvar={handleSalvar} handleDelete={handleDelete}
      createMode={createMode} onClose={onClose}
      accentColor={color}
      createTitle="Nova Promoção"
      editTitle="Editar Promoção"
      headerBadge={
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0"
          style={{ color, background: `${color}20`, border: `1px solid ${color}30` }}
        >
          Promoção
        </span>
      }
      Form={PromocaoForm}
      onCriar={(data) => promocaoService.create(data)}
      onCriado={onPromocaoCriada}
      confirmTitle="Excluir promoção"
      confirmMessage={`Tem certeza que deseja excluir "${promocao?.nome}"? A promoção será removida permanentemente.`}
      footerActions={
        promocao && (
          <Button variant="ghost" size="sm" icon={Power} onClick={handleToggleAtivo}>
            {promocao.ativo ? "Desativar" : "Ativar"}
          </Button>
        )
      }
    >
      <DetalheView promocao={promocao} desempenho={desempenho} periodoLabel={periodoLabel} />
    </EntityDrawerShell>
  );
}
