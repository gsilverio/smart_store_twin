import { RadioTower } from "lucide-react";
import type { LeituraSensorHistorico } from "../types/gemeoDigital";

interface PainelLeiturasSensoresProps {
  leituras: LeituraSensorHistorico[];
}

function formatarHora(data: string) {
  return new Date(data).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function PainelLeiturasSensores({ leituras }: PainelLeiturasSensoresProps) {
  const ultimasLeituras = leituras.slice(0, 12);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
          <RadioTower size={22} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Fluxo de dados dos sensores</h2>
          <p className="text-sm text-slate-500">
            Leituras recentes que alimentam o estado virtual da loja.
          </p>
        </div>
      </div>

      {ultimasLeituras.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Nenhuma leitura registrada ainda. Inicie a operação live ou use o painel de sensores.
        </div>
      ) : (
        <div className="max-h-[390px] overflow-auto rounded-2xl border border-slate-200">
          <div className="grid grid-cols-[0.7fr_1.2fr_1fr_0.7fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Hora</span>
            <span>Sensor</span>
            <span>Zona</span>
            <span>Valor</span>
          </div>

          <div className="divide-y divide-slate-100">
            {ultimasLeituras.map((leitura) => (
              <div
                key={leitura.id}
                className="grid grid-cols-[0.7fr_1.2fr_1fr_0.7fr] items-center gap-2 px-4 py-3 text-sm"
              >
                <span className="text-xs text-slate-500">{formatarHora(leitura.criadoEm)}</span>
                <div>
                  <p className="font-medium text-slate-800">{leitura.sensorNome}</p>
                  <p className="text-xs text-slate-400">{leitura.tipoSensor}</p>
                </div>
                <span className="text-slate-600">{leitura.zonaNome}</span>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  {leitura.valor} {leitura.unidade}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
