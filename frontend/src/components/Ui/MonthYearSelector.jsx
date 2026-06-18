import { MESES, ANOS, SELECT_CLASS } from "../../constants";

export default function MonthYearSelector({ mes, ano, onMesChange, onAnoChange, showMes = true }) {
  return (
    <>
      {showMes && (
        <select
          value={mes}
          onChange={(e) => onMesChange(Number(e.target.value))}
          className={SELECT_CLASS}
        >
          {MESES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      )}
      <select
        value={ano}
        onChange={(e) => onAnoChange(Number(e.target.value))}
        className={SELECT_CLASS}
      >
        {ANOS.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>
    </>
  );
}
