import { Power } from "lucide-react";
import { Clock, TrendingDown, TrendingUp } from "lucide-react";
import { DrawerSection } from "../Ui/Drawer";
import Button from "../Ui/Button";
import { fmtBRL, CAT_COLOR, calcComboDesconto, calcComboSomaPrecosVenda, calcComboMargem, margemStyle } from "../../utils/format";
import { useComboDrawer } from "../../hooks/useComboDrawer";
import { comboService } from "../../services/combo.service";
import EntityDrawerShell from "../Ui/EntityDrawerShell";
import ComboForm from "./ComboForm";

// ── Vista de detalhes ─────────────────────────────────────────────────────────

function DetalheView({ combo, desempenho, periodoLabel }) {
  const color    = CAT_COLOR.COMBO;
  const desconto = calcComboDesconto(combo);
  const soma     = calcComboSomaPrecosVenda(combo);
  const margem   = calcComboMargem(combo);
  const custo    = (combo.produtos ?? []).reduce(
    (s, cp) => s + cp.quantidade * (cp.produto.precoProducao ?? 0), 0
  );

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

      {/* Info geral */}
      <div className="flex flex-col gap-2">
        {combo.descricao && (
          <p className="text-slate-400 text-sm leading-relaxed">{combo.descricao}</p>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          {combo.tempoPreparo && (
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-slate-500" />
              <span className="text-slate-500 text-xs">{combo.tempoPreparo} min</span>
            </div>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${
            combo.ativo
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
              : "bg-slate-700/40 text-slate-500 border-slate-600/30"
          }`}>
            {combo.ativo ? "Ativo no cardápio" : "Inativo"}
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
            <p className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">Preço do Combo</p>
            <p className="text-base font-bold tabular-nums" style={{ color }}>
              {fmtBRL(combo.preco)}
            </p>
            <p className="text-slate-600 text-[10px] mt-0.5">valor de cardápio</p>
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

      {/* Produtos do combo */}
      {combo.produtos?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <DrawerSection>Produtos Incluídos</DrawerSection>
            <span className="text-slate-600 text-[10px] -mt-3">
              {combo.produtos.length} {combo.produtos.length === 1 ? "item" : "itens"}
            </span>
          </div>

          <div className="flex flex-col">
            {combo.produtos.map((cp, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums"
                    style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
                  >
                    ×{cp.quantidade}
                  </span>
                  <span className="text-white text-xs">{cp.produto.nome}</span>
                </div>
                <span className="text-slate-500 text-xs tabular-nums">
                  {fmtBRL(cp.produto.precoVenda)}
                </span>
              </div>
            ))}
          </div>

          {soma > 0 && (
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-700/50">
              <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold">Total individual</span>
              <span className="text-white text-sm font-bold tabular-nums">{fmtBRL(soma)}</span>
            </div>
          )}

          {desconto != null && (
            <div className="mt-3 bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <TrendingDown size={13} className="text-fuchsia-400 shrink-0" />
                <div>
                  <p className="text-slate-400 text-xs">Desconto ao comprar no combo</p>
                  <p className="text-slate-600 text-[10px]">economia vs. comprar os itens separado</p>
                </div>
              </div>
              <span className="text-fuchsia-400 text-sm font-semibold tabular-nums shrink-0">
                {desconto.toFixed(1)}% off
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

export default function ComboDrawer({
  comboId,
  createMode  = false,
  periodo     = "30dias",
  periodoLabel = "30 dias",
  onClose,
  onComboCriado,
  onComboAtualizado,
  onComboDeletado,
}) {
  const { combo, desempenho, loading, erro, salvando, erroSalvar, handleToggleAtivo, handleSalvar, handleDelete } =
    useComboDrawer(comboId, periodo, { onAtualizado: onComboAtualizado, onDeletado: onComboDeletado });

  const color = CAT_COLOR.COMBO;

  return (
    <EntityDrawerShell
      item={combo}
      loading={loading} erro={erro}
      salvando={salvando} erroSalvar={erroSalvar}
      handleSalvar={handleSalvar} handleDelete={handleDelete}
      createMode={createMode} onClose={onClose}
      accentColor={color}
      createTitle="Novo Combo"
      editTitle="Editar Combo"
      headerBadge={
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0"
          style={{ color, background: `${color}20`, border: `1px solid ${color}30` }}
        >
          Combo
        </span>
      }
      Form={ComboForm}
      onCriar={(data) => comboService.create(data)}
      onCriado={onComboCriado}
      confirmTitle="Excluir combo"
      confirmMessage={`Tem certeza que deseja excluir "${combo?.nome}"? O combo será removido do cardápio.`}
      footerActions={
        combo && (
          <Button variant="ghost" size="sm" icon={Power} onClick={handleToggleAtivo}>
            {combo.ativo ? "Desativar" : "Ativar"}
          </Button>
        )
      }
    >
      <DetalheView combo={combo} desempenho={desempenho} periodoLabel={periodoLabel} />
    </EntityDrawerShell>
  );
}
