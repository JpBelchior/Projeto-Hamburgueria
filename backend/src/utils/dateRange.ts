export interface DateRange { inicio: Date; fim: Date }

export type Periodo = "hoje" | "7dias" | "30dias" | "anual";

const ms = (d: number) => d * 86_400_000;

export function getRanges(periodo: Periodo): { atual: DateRange; anterior: DateRange } {
  const now  = new Date();
  const hoje = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (periodo) {
    case "hoje":
      return {
        atual:    { inicio: hoje,                              fim: now  },
        anterior: { inicio: new Date(hoje.getTime() - ms(1)), fim: hoje },
      };
    case "7dias":
      return {
        atual:    { inicio: new Date(hoje.getTime() - ms(7)),  fim: now },
        anterior: { inicio: new Date(hoje.getTime() - ms(14)), fim: new Date(hoje.getTime() - ms(7)) },
      };
    case "30dias":
      return {
        atual:    { inicio: new Date(hoje.getTime() - ms(30)), fim: now },
        anterior: { inicio: new Date(hoje.getTime() - ms(60)), fim: new Date(hoje.getTime() - ms(30)) },
      };
    case "anual":
      return {
        atual:    { inicio: new Date(now.getFullYear(), 0, 1),     fim: now },
        anterior: { inicio: new Date(now.getFullYear() - 1, 0, 1), fim: new Date(now.getFullYear(), 0, 1) },
      };
  }
}
