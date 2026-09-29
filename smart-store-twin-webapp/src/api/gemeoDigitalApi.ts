import axios from "axios";
import type { EstadoGemeoDigital } from "../types/gemeoDigital";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "https://localhost:7195",
});

export async function obterEstadoGemeo(): Promise<EstadoGemeoDigital> {
  const response = await api.get<EstadoGemeoDigital>(
    "/api/gemeo-digital/estado",
  );
  return response.data;
}

export async function reiniciarGemeo(): Promise<EstadoGemeoDigital> {
  const response = await api.post<EstadoGemeoDigital>(
    "/api/gemeo-digital/reiniciar",
  );
  return response.data;
}

export async function simularCenario(
  cenario: string,
): Promise<EstadoGemeoDigital> {
  const response = await api.post<EstadoGemeoDigital>(
    `/api/gemeo-digital/cenarios/${cenario}`,
  );

  return response.data;
}

export async function acionarAtuador(
  atuadorId: string,
  acao: string,
): Promise<EstadoGemeoDigital> {
  const response = await api.post<EstadoGemeoDigital>(
    `/api/gemeo-digital/atuadores/${atuadorId}/acoes`,
    {
      acao,
      origem: "Operador",
    },
  );

  return response.data;
}

export async function resolverAlerta(
  alertaId: string,
): Promise<EstadoGemeoDigital> {
  const response = await api.post<EstadoGemeoDigital>(
    `/api/gemeo-digital/alertas/${alertaId}/resolver`,
  );

  return response.data;
}

export async function registrarLeituraSensor(
  sensorId: string,
  valor: number,
  observacao?: string,
): Promise<EstadoGemeoDigital> {
  const response = await api.post<EstadoGemeoDigital>(
    "/api/gemeo-digital/sensores/leituras",
    {
      sensorId,
      valor,
      observacao,
    },
  );

  return response.data;
}

export async function iniciarSimulacao(): Promise<EstadoGemeoDigital> {
  const response = await api.post<EstadoGemeoDigital>(
    "/api/gemeo-digital/simulacao/iniciar",
  );

  return response.data;
}

export async function pararSimulacao(): Promise<EstadoGemeoDigital> {
  const response = await api.post<EstadoGemeoDigital>(
    "/api/gemeo-digital/simulacao/parar",
  );

  return response.data;
}

export async function executarTickSimulacao(): Promise<EstadoGemeoDigital> {
  const response = await api.post<EstadoGemeoDigital>(
    "/api/gemeo-digital/simulacao/tick",
  );

  return response.data;
}

export async function gerarRelatorioFechamentoDia(): Promise<EstadoGemeoDigital> {
  const response = await api.post<EstadoGemeoDigital>(
    "/api/gemeo-digital/relatorios/fechamento-dia",
  );

  return response.data;
}
