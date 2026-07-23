import api from "./api";

export const cardapioService = {
  baixarPDF: () => api.get("/cardapio/pdf", { responseType: "blob" }),
};
