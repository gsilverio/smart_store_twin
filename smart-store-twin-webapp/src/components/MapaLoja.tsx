import clsx from "clsx";
import {
  DoorOpen,
  Refrigerator,
  ShoppingBasket,
  CreditCard,
  Monitor,
  Users,
} from "lucide-react";
import type { ZonaLoja } from "../types/gemeoDigital";

interface MapaLojaProps {
  zonas: ZonaLoja[];
}

function obterEstiloStatus(status: string) {
  if (status === "Critico") return "border-red-300 bg-red-50 text-red-800";
  if (status === "Atencao")
    return "border-amber-300 bg-amber-50 text-amber-800";
  if (status === "Manutencao")
    return "border-purple-300 bg-purple-50 text-purple-800";
  if (status === "Bloqueado")
    return "border-slate-400 bg-slate-100 text-slate-800";
  if (status === "ModoEconomico")
    return "border-emerald-300 bg-emerald-50 text-emerald-800";

  return "border-slate-200 bg-white text-slate-800";
}

function obterIcone(tipo: string) {
  if (tipo === "Entrada") return <DoorOpen size={22} />;
  if (tipo === "Geladeira") return <Refrigerator size={22} />;
  if (tipo === "Checkout") return <CreditCard size={22} />;
  if (tipo === "PainelDigital") return <Monitor size={22} />;
  if (tipo === "Circulacao") return <Users size={22} />;

  return <ShoppingBasket size={22} />;
}

function formatarDetalheZona(zona: ZonaLoja) {
  if (zona.tipo === "Geladeira") {
    return `${zona.temperaturaCelsius ?? "-"}°C`;
  }

  if (zona.tipo === "Prateleira") {
    return `${zona.estoqueFisico ?? "-"} / ${zona.estoqueEsperado ?? "-"} un.`;
  }

  if (zona.tipo === "Circulacao") {
    return `${zona.quantidadePessoas} pessoas`;
  }

  if (zona.consumoEnergiaKwh) {
    return `${zona.consumoEnergiaKwh} kWh`;
  }

  return zona.status;
}

export function MapaLoja({ zonas }: MapaLojaProps) {
  const entrada = zonas.find((z) => z.tipo === "Entrada");
  const bebidas = zonas.find((z) => z.nome.includes("Bebidas"));
  const snacks = zonas.find((z) => z.nome.includes("Snacks"));
  const geladeira = zonas.find((z) => z.tipo === "Geladeira");
  const checkout = zonas.find((z) => z.tipo === "Checkout");
  const circulacao = zonas.find((z) => z.tipo === "Circulacao");
  const painel = zonas.find((z) => z.tipo === "PainelDigital");

  const ordem = [
    entrada,
    bebidas,
    snacks,
    geladeira,
    circulacao,
    checkout,
    painel,
  ].filter(Boolean) as ZonaLoja[];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Planta digital da loja
          </h2>
          <p className="text-sm text-slate-500">
            Representação visual das zonas físicas monitoradas.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          Gêmeo em tempo real
        </span>
      </div>

      <div className="grid min-h-[420px] grid-cols-3 gap-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
        {ordem.map((zona) => (
          <div
            key={zona.id}
            className={clsx(
              "relative rounded-2xl border p-4 shadow-sm transition-all",
              obterEstiloStatus(zona.status),
              zona.tipo === "Circulacao" && "col-span-2",
              zona.tipo === "Entrada" && "col-span-1",
              zona.tipo === "PainelDigital" && "col-span-1",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{zona.nome}</p>
                <p className="mt-1 text-xs opacity-80">
                  {formatarDetalheZona(zona)}
                </p>
              </div>

              <div className="rounded-xl bg-white/80 p-2 shadow-sm">
                {obterIcone(zona.tipo)}
              </div>
            </div>

            <div className="mt-3 inline-flex rounded-full bg-white/70 px-2 py-1 text-[11px] font-medium">
              {zona.status}
            </div>

            {zona.riscoAtual && (
              <p className="mt-3 rounded-xl bg-white/70 p-2 text-xs leading-relaxed">
                {zona.riscoAtual}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
