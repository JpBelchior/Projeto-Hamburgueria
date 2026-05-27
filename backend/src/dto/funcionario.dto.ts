import { Cargo } from "@prisma/client";

export interface CreateFuncionarioDTO {
  name: string;
  cpf: string;
  email: string;
  telefone?: string;
  password: string;
  roles: { id: number }[];
  cargo: Cargo;
  salario: number;
  dataAdmissao?: string;
}

export interface UpdateFuncionarioDTO {
  name?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  password?: string;
  roles?: { id: number }[];
  cargo?: Cargo;
  salario?: number;
}
