import { useState, useEffect, useCallback } from "react";
import { Store } from "lucide-react";
import { restauranteService } from "../services/restaurante.service";
import HeaderBar from "../components/Ui/HeaderBar";
import ErrorAlert from "../components/Ui/ErrorAlert";
import KpiSkeleton from "../components/Ui/KpiSkeleton";
import ConfiguracoesTabs from "../components/Configuracoes/ConfiguracoesTabs";
import RestauranteForm from "../components/Configuracoes/RestauranteForm";

const SECOES = [
  { value: "restaurante", label: "Dados do restaurante", icon: Store },
];

const Configuracoes = () => {
  const [restaurante, setRestaurante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [secao, setSecao] = useState("restaurante");
  const [editando, setEditando] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchRestaurante = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await restauranteService.getMe();
      setRestaurante(data);
    } catch {
      setError("Não foi possível carregar os dados do restaurante.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRestaurante(); }, [fetchRestaurante]);

  const handleSalvar = async (formData) => {
    setSaving(true);
    setError(null);
    try {
      const { data } = await restauranteService.update(formData);
      setRestaurante(data);
      setEditando(false);
      setSuccessMsg("Dados salvos com sucesso!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setError("Erro ao salvar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <HeaderBar
        title="Configurações do Chefe"
        subtitle="Gerencie as informações do seu restaurante e informe os dados para calculo de métricas"
        onRefresh={fetchRestaurante}
        refreshing={loading}
      />

      {error && <ErrorAlert message={error} />}

      {successMsg && (
        <div className="px-4 py-3 rounded-xl text-sm font-medium bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
          {successMsg}
        </div>
      )}

      {/* Seções — largura limitada */}
      <div className="flex flex-col gap-5">

      <ConfiguracoesTabs tabs={SECOES} value={secao} onChange={(v) => { setSecao(v); setEditando(false); }} />

      {/* Seção — Dados do restaurante */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Store size={18} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Dados do restaurante</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Identidade do negócio — aparece no login e no topo do painel
              </p>
            </div>
          </div>

          {!editando && !loading && (
            <button
              onClick={() => setEditando(true)}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
            >
              Editar
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            <KpiSkeleton variant="compact" />
            <KpiSkeleton variant="compact" />
          </div>
        ) : editando ? (
          <RestauranteForm
            initialData={restaurante}
            onSubmit={handleSalvar}
            onCancel={() => setEditando(false)}
            isLoading={saving}
          />
        ) : (
          <div className="flex items-start gap-6">
            {restaurante?.logo && (
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-800 shrink-0">
                <img src={restaurante.logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 flex-1">
              {[
                { label: "Nome", value: restaurante?.nome },
                { label: "CNPJ", value: restaurante?.cnpj },
                { label: "Telefone", value: restaurante?.telefone || "—" },
                { label: "E-mail", value: restaurante?.email },
                { label: "Endereço", value: restaurante?.endereco || "—", span: true },
              ].map(({ label, value, span }) => (
                <div key={label} className={span ? "col-span-2" : ""}>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-sm text-slate-200">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      </div>{/* fim max-w-2xl */}
    </div>
  );
};

export default Configuracoes;
