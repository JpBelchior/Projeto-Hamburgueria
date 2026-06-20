export interface OnboardingDTO {
  restaurante: {
    nome: string;
    cnpj: string;
    email: string;
    telefone?: string;
    endereco?: string;
  };
  gerente: {
    name: string;
    cpf: string;
    email: string;
    password: string;
    telefone?: string;
  };
}

export interface UpdateRestauranteDTO {
  nome?: string;
  telefone?: string;
  endereco?: string;
  logo?: string;
}
