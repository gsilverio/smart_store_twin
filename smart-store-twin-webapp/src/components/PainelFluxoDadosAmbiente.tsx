import { Activity, Database, Thermometer, Zap } from "lucide-react";
import type { LeituraSensorHistorico } from "../types/gemeoDigital";

interface PainelFluxoDadosAmbienteProps {
  leituras: LeituraSensorHistorico[];
}

function formatarHora(data: string) {
  return new Date(data).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatarNumero(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(valor);
}

function obterIcone(tipo: string) {
  if (tipo === "Temperatura") return <Thermometer size={18} />;
  if (tipo === "Energia") return <Zap size={18} />;
  if (tipo === "Presenca") return <Activity size={18} />;
  return <Database size={18} />;
}

export function PainelFluxoDadosAmbiente({ leituras }: PainelFluxoDadosAmbienteProps) {
  const leiturasOrdenadas = [...leituras].sort(
    (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
  );

  const sensores = Array.from(
    leiturasOrdenadas.reduce((mapa, leitura) => {
      if (!mapa.has(leitura.sensorId)) mapa.set(leitura.sensorId, []);
      mapa.get(leitura.sensorId)!.push(leitura);
      return mapa;
    }, new Map<string, LeituraSensorHistorico[]>()),
  ).map(([sensorId, dados]) => {
    const ultimas = dados.slice(0, 12);
    const atual = dados[0];
    const media =
      ultimas.reduce((total, item) => total + item.valor, 0) / Math.max(1, ultimas.length);
    const minimo = Math.min(...ultimas.map((item) => item.valor));
    const maximo = Math.max(...ultimas.map((item) => item.valor));

    return {
      sensorId,
      atual,
      media,
      minimo,
      maximo,
      total: dados.length,
    };
  });

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Fluxo de dados do ambiente</h2>
          <p className="text-sm text-slate-500">
            Valores atuais e histórico recente persistidos no banco de dados para alimentar as decisões do gêmeo.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {leituras.length} leituras
        </span>
      </div>

      {sensores.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Nenhuma leitura registrada ainda.
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {sensores.map((sensor) => (
            <div
              key={sensor.sensorId}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                  {obterIcone(sensor.atual.tipoSensor)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {sensor.atual.sensorNome}
                  </p>
                  <p className="text-xs text-slate-500">{sensor.atual.zonaNome}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-xs text-slate-500">Atual</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {formatarNumero(sensor.atual.valor)} {sensor.atual.unidade}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-xs text-slate-500">Média recente</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {formatarNumero(sensor.media)} {sensor.atual.unidade}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-xs text-slate-500">Mín/Máx</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatarNumero(sensor.minimo)} / {formatarNumero(sensor.maximo)}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-xs text-slate-500">Última leitura</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatarHora(sensor.atual.criadoEm)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
