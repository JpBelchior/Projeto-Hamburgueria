export function isPrismaUniqueViolation(error: unknown): boolean {
  return (error as any)?.code === "P2002";
}
