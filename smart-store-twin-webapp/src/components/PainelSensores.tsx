import {
  Activity,
  BatteryCharging,
  CheckCircle2,
  CreditCard,
  DoorOpen,
  Package,
  Refrigerator,
  RadioTower,
  Users,
} from "lucide-react";
import type { SensorLoja, ZonaLoja } from "../types/gemeoDigital";

interface PainelSensoresProps {
  sensores: SensorLoja[];
  zonas: ZonaLoja[];
  carregando: boolean;
  onRegistrarLeitura: (
    sensorId: string,
    valor: number,
    observacao?: string,
  ) => void;
}

interface AcaoSensor {
  rotulo: string;
  valor: number;
  observacao: string;
}

function obterIconeSensor(tipo: string) {
  if (tipo === "Presenca") return <Users size={18} />;
  if (tipo === "PesoPrateleira") return <Package size={18} />;
  if (tipo === "Temperatura") return <Refrigerator size={18} />;
  if (tipo === "Energia") return <BatteryCharging size={18} />;
  if (tipo === "Checkout") return <CreditCard size={18} />;
  if (tipo === "Porta") return <DoorOpen size={18} />;

  return <RadioTower size={18} />;
}

function obterAcoesSensor(sensor: SensorLoja): AcaoSensor[] {
  if (sensor.tipo === "Presenca") {
    return [
      {
        rotulo: "Loja normal: 6 pessoas",
        valor: 6,
        observacao: "Sensor de presenca registrou fluxo normal.",
      },
      {
        rotulo: "Lotação: 18 pessoas",
        valor: 18,
        observacao: "Sensor de presenca registrou horario de pico.",
      },
    ];
  }

  if (sensor.tipo === "PesoPrateleira") {
    return [
      {
        rotulo: "Estoque normal: 30 un.",
        valor: 30,
        observacao: "Sensor de peso registrou estoque normal.",
      },
      {
        rotulo: "Estoque crítico: 5 un.",
        valor: 5,
        observacao: "Sensor de peso registrou estoque abaixo do minimo.",
      },
      {
        rotulo: "Divergência: 35 un.",
        valor: 35,
        observacao: "Sensor de peso registrou estoque fisico menor que o esperado.",
      },
    ];
  }

  if (sensor.tipo === "Temperatura") {
    return [
      {
        rotulo: "Normal: 4°C",
        valor: 4,
        observacao: "Sensor de temperatura registrou operacao normal.",
      },
      {
        rotulo: "Atenção: 8°C",
        valor: 8,
        observacao: "Sensor de temperatura registrou elevacao acima do ideal.",
      },
      {
        rotulo: "Crítica: 12°C",
        valor: 12,
        observacao: "Sensor de temperatura registrou risco de perda de pereciveis.",
      },
    ];
  }

  if (sensor.tipo === "Energia") {
    return [
      {
        rotulo: "Normal: 4.8 kWh",
        valor: 4.8,
        observacao: "Sensor de energia registrou consumo normal.",
      },
      {
        rotulo: "Pico: 9.8 kWh",
        valor: 9.8,
        observacao: "Sensor de energia registrou consumo anormal.",
      },
    ];
  }

  if (sensor.tipo === "Checkout") {
    return [
      {
        rotulo: "Normal",
        valor: 0,
        observacao: "Sensor do checkout registrou funcionamento normal.",
      },
      {
        rotulo: "Em uso",
        valor: 1,
        observacao: "Sensor do checkout registrou terminal em uso.",
      },
      {
        rotulo: "Erro",
        valor: 2,
        observacao: "Sensor do checkout registrou falha operacional.",
      },
    ];
  }

  if (sensor.tipo === "Porta") {
    return [
      {
        rotulo: "Fechada",
        valor: 0,
        observacao: "Sensor da porta registrou porta fechada.",
      },
      {
        rotulo: "Aberta",
        valor: 1,
        observacao: "Sensor da porta registrou porta aberta.",
      },
      {
        rotulo: "Bloqueada",
        valor: 2,
        observacao: "Sensor da porta registrou bloqueio de entrada.",
      },
    ];
  }

  return [
    {
      rotulo: "Leitura padrão",
      valor: 1,
      observacao: "Leitura simulada do sensor.",
    },
  ];
}

function formatarHora(data: string) {
  return new Date(data).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function PainelSensores({
  sensores,
  zonas,
  carregando,
  onRegistrarLeitura,
}: PainelSensoresProps) {
  function obterNomeZona(zonaId: string) {
    return zonas.find((zona) => zona.id === zonaId)?.nome ?? "Zona não encontrada";
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Sensores simulados</h2>
          <p className="text-sm text-slate-500">
            Leituras que atualizam o estado da loja e disparam regras do gêmeo digital.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <Activity size={14} />
          Entrada física simulada
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {sensores.map((sensor) => (
          <div
            key={sensor.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                {obterIconeSensor(sensor.tipo)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{sensor.nome}</p>
                    <p className="text-xs text-slate-500">{obterNomeZona(sensor.zonaId)}</p>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-medium text-emerald-700 shadow-sm">
                    <CheckCircle2 size={12} />
                    {sensor.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <span className="rounded-full bg-white px-2 py-1">
                    Tipo: {sensor.tipo}
                  </span>
                  <span className="rounded-full bg-white px-2 py-1">
                    Confiança: {sensor.confiabilidadePercentual}%
                  </span>
                  <span className="rounded-full bg-white px-2 py-1">
                    Última: {formatarHora(sensor.ultimaLeituraEm)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {obterAcoesSensor(sensor).map((acao) => (
                <button
                  key={`${sensor.id}-${acao.rotulo}`}
                  type="button"
                  disabled={carregando || !sensor.ativo}
                  onClick={() =>
                    onRegistrarLeitura(sensor.id, acao.valor, acao.observacao)
                  }
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-sky-200 hover:bg-sky-50 disabled:opacity-60"
                >
                  {acao.rotulo}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
