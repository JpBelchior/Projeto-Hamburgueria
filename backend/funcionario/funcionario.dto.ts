import { Role, Cargo } from "@prisma/client";

export interface CreateFuncionarioDTO {
  // dados do User
  name: string;
  cpf: string;
  email: string;
  telefone?: string
  password: string;
  roles: {id: number}[]; // array de IDs de Roles
  // dados do Funcionario
  cargo: Cargo;
  salario: number;
  dataAdmissao?: string;
}

export interface UpdateFuncionarioDTO {
  // dados do User
  name?: string;
  cpf?: string;
  email?: string;
  telefone?: string
  password?: string;
  roles?: {id: number}[];
  // dados do Funcionario
  cargo?: Cargo;
  salario?: number;
}