import { useRef, useState } from "react";
import Drawer, { DrawerHeader, DrawerGradientTitle } from "../Ui/Drawer";
import Avatar from "../Ui/Avatar";
import Button from "../Ui/Button";
import FormField from "../Ui/FormField";
import PasswordToggle from "../Ui/PasswordToggle";
import { INPUT_CLS as inputClass, ACCENT } from "../../utils/format";
import { userService } from "../../services/user.service";
import useAuthStore from "../../store/useAuthStore";

export default function PerfilDrawer({ onClose }) {
  const user    = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [novoNome, setNovoNome]           = useState("");
  const [novaSenha, setNovaSenha]         = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvando, setSalvando]           = useState(false);
  const [erro, setErro]                   = useState(null);

  const senhaRef      = useRef(null);
  const confirmarRef   = useRef(null);

  const nomeTrim        = novoNome.trim();
  const querTrocarSenha = novaSenha.length > 0 || confirmarSenha.length > 0;
  const nadaParaSalvar  = !nomeTrim && !querTrocarSenha;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);

    if (querTrocarSenha) {
      if (novaSenha.length < 6) {
        setErro("A nova senha deve ter pelo menos 6 caracteres.");
        return;
      }
      if (novaSenha !== confirmarSenha) {
        setErro("As senhas não coincidem.");
        return;
      }
    }

    setSalvando(true);
    try {
      if (nomeTrim && nomeTrim !== user?.name) {
        await userService.updateMe(nomeTrim);
      }
      if (querTrocarSenha) {
        await userService.changePassword(novaSenha);
      }
      await fetchMe();
      onClose();
    } catch (err) {
      setErro(err?.response?.data?.message ?? err?.message ?? "Erro ao salvar alterações.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Drawer onClose={onClose}>
      <DrawerHeader
        title={<DrawerGradientTitle>Meu perfil</DrawerGradientTitle>}
        onClose={onClose}
        accentColor={ACCENT.from}
      />

      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center gap-4 mb-5">
          <Avatar name={user?.name} size="lg" />
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">Olá, {user?.name}!</p>
            <p className="text-slate-500 text-xs mt-0.5">Deseja alterar seus dados?</p>
          </div>
        </div>

        <div className="h-px bg-slate-800 mb-5" />

        <form onSubmit={handleSubmit} className="space-y-5">
          {erro && <p className="text-red-400 text-xs">{erro}</p>}

          <FormField label="Novo nome">
            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder={user?.name ?? ""}
              className={inputClass}
              disabled={salvando}
            />
          </FormField>

          <FormField label="Nova senha">
            <div className="relative">
              <input
                ref={senhaRef}
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="••••••••"
                className={`${inputClass} pr-12`}
                disabled={salvando}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <PasswordToggle inputRef={senhaRef} />
              </div>
            </div>
          </FormField>

          <FormField label="Confirmar nova senha">
            <div className="relative">
              <input
                ref={confirmarRef}
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="••••••••"
                className={`${inputClass} pr-12`}
                disabled={salvando}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <PasswordToggle inputRef={confirmarRef} />
              </div>
            </div>
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={salvando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando || nadaParaSalvar}>
              {salvando ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
}
