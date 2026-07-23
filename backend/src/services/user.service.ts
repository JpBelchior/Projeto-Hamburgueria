import bcrypt from "bcryptjs";
import prisma from "../config/prisma";
import { UpdateMeDTO } from "../dto/user.dto";

export const updateMe = async (userId: number, data: UpdateMeDTO) => {
  return prisma.user.update({
    where: { id: userId },
    data: { name: data.name },
    select: { id: true, name: true },
  });
};

export const changePassword = async (userId: number, novaSenha: string) => {
  const senhaHash = await bcrypt.hash(novaSenha, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: senhaHash } });
};
