import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import FormField from "../Ui/FormField";
import Button from "../Ui/Button";
import { INPUT_CLS } from "../../utils/format";
import { formatTelefone } from "../../utils/Date.utils";

const RestauranteForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    nome: initialData?.nome ?? "",
    telefone: initialData?.telefone ?? "",
    endereco: initialData?.endereco ?? "",
    logo: initialData?.logo ?? "",
  });

  const handleChange = (field) => (e) => {
    const value = field === "telefone" ? formatTelefone(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm((prev) => ({ ...prev, logo: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Logo */}
      <div>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">
          Logotipo
        </p>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/50 flex items-center justify-center shrink-0">
            {form.logo ? (
              <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Camera size={22} className="text-slate-600" />
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
            >
              Enviar nova imagem
            </button>
            <p className="text-xs text-slate-500 mt-0.5">PNG, JPG ou WEBP</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* Campos editáveis */}
      <div>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">
          Dados do Restaurante
        </p>
        <div className="grid grid-cols-2 gap-4">

          <div className="col-span-2">
            <FormField label="Nome do restaurante" required>
              <input
                type="text"
                value={form.nome}
                onChange={handleChange("nome")}
                placeholder="Ex: Burger House"
                className={INPUT_CLS}
                disabled={isLoading}
                required
              />
            </FormField>
          </div>

          <FormField label="Telefone / WhatsApp">
            <input
              type="tel"
              value={form.telefone}
              onChange={handleChange("telefone")}
              placeholder="(11) 99999-9999"
              className={INPUT_CLS}
              disabled={isLoading}
            />
          </FormField>

          <FormField label="CNPJ">
            <input
              type="text"
              value={initialData?.cnpj ?? ""}
              readOnly
              className={`${INPUT_CLS} cursor-not-allowed opacity-50`}
            />
          </FormField>

          <div className="col-span-2">
            <FormField label="Endereço">
              <input
                type="text"
                value={form.endereco}
                onChange={handleChange("endereco")}
                placeholder="Av. Paulista, 1000 — São Paulo, SP"
                className={INPUT_CLS}
                disabled={isLoading}
              />
            </FormField>
          </div>

          <div className="col-span-2">
            <FormField label="E-mail">
              <input
                type="email"
                value={initialData?.email ?? ""}
                readOnly
                className={`${INPUT_CLS} cursor-not-allowed opacity-50`}
              />
            </FormField>
          </div>

        </div>
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
};

export default RestauranteForm;
