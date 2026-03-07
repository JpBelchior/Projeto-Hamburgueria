/**
 * Utilitários de data
 */

/**
 * Calcula há quanto tempo uma pessoa está na empresa
 * a partir da dataAdmissao.
 */
export const tempoNaEmpresa = (dataAdmissao) => {
  const inicio = new Date(dataAdmissao);
  const hoje   = new Date();

  let anos  = hoje.getFullYear() - inicio.getFullYear();
  let meses = hoje.getMonth()    - inicio.getMonth();

  if (meses < 0) {
    anos  -= 1;
    meses += 12;
  }

  if (anos === 0 && meses === 0) return "Recém admitido";
  if (anos === 0) return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  if (meses === 0) return `${anos} ${anos === 1 ? "ano" : "anos"}`;

  return `${anos} ${anos === 1 ? "ano" : "anos"} e ${meses} ${meses === 1 ? "mês" : "meses"}`;
};

/**
 * Formata uma data para o padrão brasileiro
 */
export const formatData = (data) =>
  new Date(data).toLocaleDateString("pt-BR");

/**
 * Formata um valor para moeda brasileira
 */
export const formatMoeda = (valor) =>
  new Intl.NumberFormat("pt-BR", {
    style:    "currency",
    currency: "BRL",
  }).format(valor);

/**
 * Formata um telefone para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export const formatTelefone = (value) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
};