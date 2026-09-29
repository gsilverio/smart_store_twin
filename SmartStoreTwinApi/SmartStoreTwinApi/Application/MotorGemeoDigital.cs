using SmartStoreTwinApi.Domain.Entities;
using SmartStoreTwinApi.Domain.Enums;

namespace SmartStoreTwinApi.Application;

public class MotorGemeoDigital
{
    private readonly EstadoGemeoStore _store;
    private readonly Random _random = new();

    public MotorGemeoDigital(EstadoGemeoStore store)
    {
        _store = store;
    }

    public EstadoGemeoDigital ObterEstado() => PrepararRetorno(_store.Obter());

    public EstadoGemeoDigital Reiniciar() => PrepararRetorno(_store.Reiniciar());

    public List<LeituraSensorHistorico> ObterLeiturasSensores(int take = 200)
    {
        return _store.Obter()
            .LeiturasSensores
            .OrderByDescending(x => x.CriadoEm)
            .Take(Math.Clamp(take, 1, 500))
            .ToList();
    }

    public List<ProdutoOperacional> ObterProdutosOperacionais()
    {
        return _store.Obter()
            .ProdutosOperacionais
            .OrderBy(x => x.Categoria)
            .ThenBy(x => x.Nome)
            .ToList();
    }

    public List<RotinaAutomatica> ObterRotinasAutomaticas()
    {
        return _store.Obter()
            .RotinasAutomaticas
            .OrderBy(x => x.Nome)
            .ToList();
    }

    public EstadoGemeoDigital IniciarSimulacao()
    {
        var estado = _store.Obter();
        estado.SimulacaoAtiva = true;
        estado.PerfilSimulacao = "Operação normal";
        estado.MultiplicadorFluxo = 1m;
        estado.UltimoTickEm = DateTime.UtcNow;
        estado.AtualizadoEm = DateTime.UtcNow;

        AdicionarEvento(estado, TipoEventoLinhaDoTempo.EstadoAlterado, "Operação live iniciada.", "Simulador");
        ExecutarRotinasAutomaticas(estado);

        return PrepararRetorno(estado);
    }

    public EstadoGemeoDigital PararSimulacao()
    {
        var estado = _store.Obter();
        estado.SimulacaoAtiva = false;
        estado.PerfilSimulacao = "Operação manual";
        estado.PessoasNaLoja = 0;
        estado.AtualizadoEm = DateTime.UtcNow;

        foreach (var cliente in estado.ClientesSimulados.Where(x => x.Etapa != "Finalizado"))
        {
            cliente.Etapa = "Finalizado";
            cliente.Status = "Cliente saiu da loja ao pausar a operação";
            cliente.ZonaAtualId = null;
            cliente.ZonaAtualNome = null;
            cliente.AtualizadoEm = DateTime.UtcNow;
        }

        foreach (var zona in estado.Zonas)
            zona.QuantidadePessoas = 0;

        AdicionarEvento(estado, TipoEventoLinhaDoTempo.EstadoAlterado, "Operação live pausada.", "Simulador");
        RecalcularSaudeOperacional(estado);

        return PrepararRetorno(estado);
    }

    public EstadoGemeoDigital ExecutarTickSimulacao()
    {
        var estado = _store.Obter();

        if (!estado.SimulacaoAtiva)
        {
            AdicionarEvento(estado, TipoEventoLinhaDoTempo.EstadoAlterado, "Tick manual executado com a operação pausada.", "Simulador");
            RegistrarLeiturasAutomaticas(estado);
            ExecutarRotinasAutomaticas(estado);
            AtualizarRelatorioGerencial(estado, false);
            return PrepararRetorno(estado);
        }

        estado.TickAtual++;
        estado.UltimoTickEm = DateTime.UtcNow;
        estado.AtualizadoEm = DateTime.UtcNow;

        TalvezEntrarNovoCliente(estado);
        AvancarClientes(estado);
        AtualizarFluxo(estado);
        AtualizarEnergia(estado);
        SincronizarEstoqueDasZonas(estado);
        RegistrarLeiturasAutomaticas(estado);
        ExecutarRotinasAutomaticas(estado);
        AtualizarRelatorioGerencial(estado, false);
        RecalcularSaudeOperacional(estado);
        LimitarHistoricos(estado);

        return PrepararRetorno(estado);
    }

    public EstadoGemeoDigital SimularCenario(string cenario)
    {
        var estado = _store.Obter();
        AdicionarEvento(estado, TipoEventoLinhaDoTempo.CenarioSimulado, $"Cenário aplicado: {cenario}", "Simulador");

        switch (cenario.ToLowerInvariant())
        {
            case "horario-pico":
                AplicarCenarioHorarioPico(estado);
                break;
            case "falha-geladeira":
                AplicarCenarioFalhaGeladeira(estado);
                break;
            case "checkout-fora-do-ar":
                AplicarCenarioCheckoutForaDoAr(estado);
                break;
            case "divergencia-pagamento":
                AplicarCenarioDivergenciaPagamento(estado);
                break;
            case "pico-energia":
                AplicarCenarioPicoEnergia(estado);
                break;
            case "estoque-critico":
                AplicarCenarioEstoqueCritico(estado);
                break;
            default:
                AdicionarEvento(estado, TipoEventoLinhaDoTempo.EstadoAlterado, "Cenário não reconhecido.", "Simulador");
                break;
        }

        SincronizarEstoqueDasZonas(estado);
        RegistrarLeiturasAutomaticas(estado);
        ExecutarRotinasAutomaticas(estado);
        AtualizarRelatorioGerencial(estado, false);
        RecalcularSaudeOperacional(estado);
        estado.AtualizadoEm = DateTime.UtcNow;

        return PrepararRetorno(estado);
    }

    public EstadoGemeoDigital AcionarAtuador(Guid atuadorId, string acao, string origem = "Operador")
    {
        var estado = _store.Obter();
        var atuador = estado.Atuadores.FirstOrDefault(x => x.Id == atuadorId);

        if (atuador is null)
        {
            AdicionarEvento(estado, TipoEventoLinhaDoTempo.AcaoAtuador, "Tentativa de acionar um atuador inexistente.", origem);
            return PrepararRetorno(estado);
        }

        AplicarAcaoAtuador(estado, atuador, acao);
        AdicionarEvento(estado, TipoEventoLinhaDoTempo.AcaoAtuador, $"Atuador acionado: {atuador.Nome}. Ação: {acao}.", origem);
        RecalcularSaudeOperacional(estado);
        estado.AtualizadoEm = DateTime.UtcNow;

        return PrepararRetorno(estado);
    }

    public EstadoGemeoDigital ResolverAlerta(Guid alertaId)
    {
        var estado = _store.Obter();
        var alerta = estado.Alertas.FirstOrDefault(x => x.Id == alertaId);

        if (alerta is null)
            return PrepararRetorno(estado);

        alerta.Status = StatusAlerta.Resolvido;
        alerta.ResolvidoEm = DateTime.UtcNow;
        AdicionarEvento(estado, TipoEventoLinhaDoTempo.AlertaResolvido, $"Alerta resolvido: {alerta.Titulo}.", "Operador");
        RecalcularSaudeOperacional(estado);

        return PrepararRetorno(estado);
    }

    public EstadoGemeoDigital RegistrarLeituraSensor(Guid sensorId, decimal valor, string observacao = "Leitura simulada")
    {
        var estado = _store.Obter();
        var sensor = estado.Sensores.FirstOrDefault(x => x.Id == sensorId);

        if (sensor is null)
        {
            AdicionarEvento(estado, TipoEventoLinhaDoTempo.LeituraSensor, "Leitura recebida de sensor inexistente.", "Sensor");
            return PrepararRetorno(estado);
        }

        var zona = estado.Zonas.FirstOrDefault(x => x.Id == sensor.ZonaId);
        if (zona is null)
            return PrepararRetorno(estado);

        sensor.UltimaLeituraEm = DateTime.UtcNow;
        estado.LeiturasSensores.Insert(0, NovaLeitura(estado, sensor, zona, valor, UnidadeSensor(sensor.Tipo), observacao));
        AplicarLeituraAoEstado(estado, sensor, zona, valor);
        AdicionarEvento(estado, TipoEventoLinhaDoTempo.LeituraSensor, $"{sensor.Nome}: {valor} {UnidadeSensor(sensor.Tipo)}.", "Sensor");

        ExecutarRotinasAutomaticas(estado);
        AtualizarRelatorioGerencial(estado, false);
        RecalcularSaudeOperacional(estado);
        LimitarHistoricos(estado);

        return PrepararRetorno(estado);
    }

    public EstadoGemeoDigital GerarRelatorioFechamentoDia()
    {
        var estado = _store.Obter();
        AtualizarRelatorioGerencial(estado, true);
        AdicionarEvento(estado, TipoEventoLinhaDoTempo.EstadoAlterado, "Relatório gerencial do dia atualizado.", "Gêmeo digital");
        return PrepararRetorno(estado);
    }

    private void TalvezEntrarNovoCliente(EstadoGemeoDigital estado)
    {
        var entrada = Zona(estado, TipoZona.Entrada);

        if (PortaEntradaBloqueada(estado))
        {
            entrada.RiscoAtual = "Entrada bloqueada pelo atuador da porta.";
            AdicionarEventoSeNaoRecente(
                estado,
                TipoEventoLinhaDoTempo.AcaoAtuador,
                "Entrada de novos clientes interrompida: porta bloqueada.",
                "Porta automática");
            return;
        }

        var ativos = ClientesAtivos(estado).Count();
        var chance = ativos < estado.CapacidadeRecomendada ? 0.72 : 0.18;

        if (PortaEntradaLimitada(estado))
            chance = Math.Min(chance, 0.16);

        if (_random.NextDouble() > chance)
            return;

        var numero = estado.TickAtual + _random.Next(10, 99);
        var cliente = new ClienteSimulado
        {
            EstadoGemeoDigitalId = estado.Id,
            Codigo = $"C{numero:000}",
            Nome = $"Cliente {numero:000}",
            Etapa = "Entrada",
            Status = PortaEntradaLimitada(estado) ? "Entrou com fluxo limitado" : "Entrou na loja",
            ZonaAtualId = entrada.Id,
            ZonaAtualNome = entrada.Nome,
            CriadoEm = DateTime.UtcNow,
            AtualizadoEm = DateTime.UtcNow
        };

        estado.ClientesSimulados.Insert(0, cliente);
        AdicionarEvento(estado, TipoEventoLinhaDoTempo.EstadoAlterado, $"{cliente.Codigo} entrou na loja.", "Sensor de presença");
    }

    private void AvancarClientes(EstadoGemeoDigital estado)
    {
        foreach (var cliente in ClientesAtivos(estado).OrderBy(x => x.CriadoEm).ToList())
        {
            switch (cliente.Etapa)
            {
                case "Entrada":
                    if (PortaEntradaBloqueada(estado))
                    {
                        cliente.Status = "Aguardando liberação da entrada";
                        cliente.AtualizadoEm = DateTime.UtcNow;
                        break;
                    }

                    MoverCliente(cliente, Zona(estado, TipoZona.Circulacao), "Circulando pela loja", "Circulação");
                    break;
                case "Circulação":
                    var destino = EscolherZonaProduto(estado);
                    MoverCliente(cliente, destino, $"Visitando {destino.Nome}", destino.Nome);
                    break;
                case "Prateleira":
                case "Geladeira":
                    RetirarProduto(estado, cliente);
                    MoverCliente(cliente, Zona(estado, TipoZona.Checkout), "Indo para o checkout", "Checkout");
                    break;
                case "Checkout":
                    FinalizarCheckout(estado, cliente);
                    break;
                case "Saindo":
                    if (PortaEntradaBloqueada(estado))
                    {
                        cliente.Status = "Aguardando liberação da saída";
                        cliente.AtualizadoEm = DateTime.UtcNow;
                        break;
                    }

                    cliente.Etapa = "Finalizado";
                    cliente.Status = "Saiu da loja";
                    cliente.ZonaAtualId = null;
                    cliente.ZonaAtualNome = null;
                    cliente.AtualizadoEm = DateTime.UtcNow;
                    break;
            }
        }
    }

    private ZonaLoja EscolherZonaProduto(EstadoGemeoDigital estado)
    {
        var roll = _random.Next(0, 100);
        if (roll < 42) return estado.Zonas.First(x => x.Nome.Contains("Bebidas"));
        if (roll < 72) return estado.Zonas.First(x => x.Nome.Contains("Snacks"));
        return Zona(estado, TipoZona.Geladeira);
    }

    private void MoverCliente(ClienteSimulado cliente, ZonaLoja zona, string status, string etapaBase)
    {
        cliente.ZonaAtualId = zona.Id;
        cliente.ZonaAtualNome = zona.Nome;
        cliente.Status = status;
        cliente.Etapa = etapaBase is "Checkout" ? "Checkout" : etapaBase is "Circulação" ? "Circulação" : zona.Tipo == TipoZona.Geladeira ? "Geladeira" : "Prateleira";
        cliente.AtualizadoEm = DateTime.UtcNow;
    }

    private void RetirarProduto(EstadoGemeoDigital estado, ClienteSimulado cliente)
    {
        var zonaNome = cliente.ZonaAtualNome ?? string.Empty;
        var candidatos = estado.ProdutosOperacionais
            .Where(p => p.EstoqueAtual > 0 && zonaNome.Contains(p.ZonaNome.Split(' ').Last(), StringComparison.OrdinalIgnoreCase))
            .ToList();

        if (zonaNome.Contains("Bebidas"))
            candidatos = estado.ProdutosOperacionais.Where(p => p.Categoria == "Bebidas" && p.EstoqueAtual > 0).ToList();
        else if (zonaNome.Contains("Snacks"))
            candidatos = estado.ProdutosOperacionais.Where(p => p.Categoria == "Snacks" && p.EstoqueAtual > 0).ToList();
        else if (zonaNome.Contains("Geladeira"))
            candidatos = estado.ProdutosOperacionais.Where(p => p.Categoria == "Refrigerados" && p.EstoqueAtual > 0).ToList();

        if (candidatos.Count == 0)
        {
            cliente.Status = "Não encontrou produto disponível";
            return;
        }

        var produto = candidatos[_random.Next(candidatos.Count)];
        var quantidade = _random.Next(1, 3);
        quantidade = Math.Min(quantidade, produto.EstoqueAtual);

        produto.EstoqueAtual -= quantidade;
        produto.RetiradosHoje += quantidade;
        produto.AtualizadoEm = DateTime.UtcNow;

        var itemExistente = cliente.Itens.FirstOrDefault(x => x.ProdutoId == produto.Id);
        if (itemExistente is null)
        {
            cliente.Itens.Add(new ItemClienteSimulado
            {
                ClienteSimuladoId = cliente.Id,
                ProdutoId = produto.Id,
                ProdutoNome = produto.Nome,
                Categoria = produto.Categoria,
                Quantidade = quantidade,
                ValorUnitario = produto.PrecoVenda
            });
        }
        else
        {
            itemExistente.Quantidade += quantidade;
        }

        cliente.ValorCarrinho += produto.PrecoVenda * quantidade;
        cliente.BebidasSelecionadas += produto.Categoria == "Bebidas" ? quantidade : 0;
        cliente.SnacksSelecionados += produto.Categoria == "Snacks" ? quantidade : 0;
        cliente.RefrigeradosSelecionados += produto.Categoria == "Refrigerados" ? quantidade : 0;
        cliente.Status = $"Retirou {quantidade}x {produto.Nome}";
        cliente.AtualizadoEm = DateTime.UtcNow;

        AdicionarEvento(estado, TipoEventoLinhaDoTempo.EstadoAlterado, $"{cliente.Codigo} retirou {quantidade}x {produto.Nome}.", "Sensor de prateleira");
    }

    private void FinalizarCheckout(EstadoGemeoDigital estado, ClienteSimulado cliente)
    {
        var checkout = Zona(estado, TipoZona.Checkout);

        if (checkout.Status == StatusZona.Manutencao)
        {
            cliente.Status = "Aguardando checkout voltar";
            return;
        }

        var divergencia = cliente.ValorCarrinho > 0 && _random.NextDouble() < 0.08;

        if (divergencia)
        {
            cliente.PossuiDivergencia = true;
            var perda = Math.Round(cliente.ValorCarrinho, 2);
            estado.PerdaFinanceiraEstimada += perda;

            foreach (var item in cliente.Itens)
            {
                var produto = estado.ProdutosOperacionais.FirstOrDefault(p => p.Id == item.ProdutoId);
                if (produto is not null)
                    produto.PerdidosHoje += item.Quantidade;
            }

            CriarAlerta(
                estado,
                "Divergência entre retirada e pagamento",
                $"{cliente.Codigo} retirou produtos sem pagamento equivalente no checkout.",
                SeveridadeAlerta.Critica,
                checkout.Id,
                "Conferir eventos de prateleira e revisar fluxo do checkout.",
                perda);

            var painel = estado.Atuadores.FirstOrDefault(x => x.Tipo == TipoAtuador.PainelDigital);
            if (painel is not null)
                AplicarAcaoAtuador(estado, painel, "Solicitar conferência operacional");
        }
        else
        {
            foreach (var item in cliente.Itens)
            {
                var produto = estado.ProdutosOperacionais.FirstOrDefault(p => p.Id == item.ProdutoId);
                if (produto is null) continue;
                produto.VendidosHoje += item.Quantidade;
                produto.AtualizadoEm = DateTime.UtcNow;
            }

            estado.ReceitaEstimadaHoje += cliente.ValorCarrinho;
            estado.ProdutosVendidosHoje += cliente.Itens.Sum(x => x.Quantidade);
            cliente.PagamentoConcluido = true;
            AdicionarEvento(estado, TipoEventoLinhaDoTempo.EstadoAlterado, $"{cliente.Codigo} pagou R$ {cliente.ValorCarrinho:0.00} no checkout.", "Checkout");
        }

        cliente.Etapa = "Saindo";
        cliente.Status = divergencia ? "Saiu com divergência operacional" : "Pagamento aprovado";
        cliente.AtualizadoEm = DateTime.UtcNow;
    }

    private void AtualizarFluxo(EstadoGemeoDigital estado)
    {
        var ativos = ClientesAtivos(estado).ToList();
        estado.PessoasNaLoja = ativos.Count;

        foreach (var zona in estado.Zonas)
            zona.QuantidadePessoas = ativos.Count(c => c.ZonaAtualId == zona.Id);

        var entrada = Zona(estado, TipoZona.Entrada);
        if (estado.PessoasNaLoja > estado.CapacidadeRecomendada)
        {
            entrada.Status = StatusZona.Atencao;
            entrada.RiscoAtual = "Fluxo acima da capacidade recomendada.";
            CriarAlerta(estado, "Lotação acima do recomendado", "O fluxo atual está acima da capacidade operacional.", SeveridadeAlerta.Alta, entrada.Id, "Limitar entrada temporariamente.", 0);
            var porta = estado.Atuadores.FirstOrDefault(x => x.Tipo == TipoAtuador.PortaAutomatica);
            if (porta is not null) AplicarAcaoAtuador(estado, porta, "Entrada limitada");
        }
        else if (entrada.Status == StatusZona.Atencao && entrada.RiscoAtual?.Contains("Fluxo") == true)
        {
            entrada.Status = StatusZona.Normal;
            entrada.RiscoAtual = null;
        }
    }

    private void AtualizarEnergia(EstadoGemeoDigital estado)
    {
        var fluxo = estado.PessoasNaLoja;
        var geladeira = Zona(estado, TipoZona.Geladeira);
        var circulacao = Zona(estado, TipoZona.Circulacao);
        var iluminacao = estado.Atuadores.FirstOrDefault(x => x.Tipo == TipoAtuador.Iluminacao);
        var refrigeracao = estado.Atuadores.FirstOrDefault(x => x.Tipo == TipoAtuador.Refrigeracao);

        var energiaBase = 3.9m + fluxo * 0.11m;
        var acrescimoGeladeira = Math.Max(0, (geladeira.TemperaturaCelsius ?? 4m) - 5m) * 0.25m;

        if (AcaoContem(iluminacao?.Status, "econ"))
        {
            energiaBase = Math.Max(2.4m, energiaBase - 0.45m);
            estado.EconomiaEnergiaEstimadaKwh += 0.03m;
        }

        if (AcaoContem(refrigeracao?.Status, "econ"))
        {
            acrescimoGeladeira = Math.Max(0, acrescimoGeladeira - 0.20m);
            geladeira.TemperaturaCelsius = Math.Round((geladeira.TemperaturaCelsius ?? 4m) + 0.08m, 2);
            estado.EconomiaEnergiaEstimadaKwh += 0.02m;
        }
        else if (AcaoContem(refrigeracao?.Status, "maxima") || AcaoContem(refrigeracao?.Status, "máxima"))
        {
            acrescimoGeladeira += 0.35m;
            geladeira.TemperaturaCelsius = Math.Max(3.5m, Math.Round((geladeira.TemperaturaCelsius ?? 8m) - 0.25m, 2));
        }

        estado.ConsumoEnergiaTotalKwh = Math.Round(energiaBase + acrescimoGeladeira, 2);
        circulacao.ConsumoEnergiaKwh = estado.ConsumoEnergiaTotalKwh;
        geladeira.ConsumoEnergiaKwh = Math.Round(2.1m + acrescimoGeladeira, 2);
        estado.CustoEnergiaEstimadoHoje = Math.Round(estado.ConsumoEnergiaTotalKwh * 0.70m, 2);
    }

    private void RegistrarLeiturasAutomaticas(EstadoGemeoDigital estado)
    {
        foreach (var sensor in estado.Sensores.Where(x => x.Ativo))
        {
            var zona = estado.Zonas.FirstOrDefault(x => x.Id == sensor.ZonaId);
            if (zona is null) continue;

            decimal valor = sensor.Tipo switch
            {
                TipoSensor.Presenca => estado.PessoasNaLoja,
                TipoSensor.Temperatura => zona.TemperaturaCelsius ?? 4m,
                TipoSensor.Energia => estado.ConsumoEnergiaTotalKwh,
                TipoSensor.PesoPrateleira => zona.EstoqueFisico ?? 0,
                TipoSensor.Checkout => zona.Status == StatusZona.Manutencao ? 2 : zona.QuantidadePessoas > 0 ? 1 : 0,
                TipoSensor.Porta => zona.Status == StatusZona.Bloqueado ? 2 : 1,
                _ => 0
            };

            sensor.UltimaLeituraEm = DateTime.UtcNow;
            estado.LeiturasSensores.Insert(0, NovaLeitura(estado, sensor, zona, valor, UnidadeSensor(sensor.Tipo), "Leitura automática do gêmeo"));
        }
    }

    private void ExecutarRotinasAutomaticas(EstadoGemeoDigital estado)
    {
        RotinaEnergia(estado);
        RotinaRupturaEstoque(estado);
        RotinaCompra(estado);
        RotinaTemperatura(estado);
        RotinaConciliacao(estado);
    }

    private void RotinaEnergia(EstadoGemeoDigital estado)
    {
        var rotina = estado.RotinasAutomaticas.FirstOrDefault(x => x.Nome.Contains("energética"));
        if (rotina is null) return;

        var iluminacao = estado.Atuadores.FirstOrDefault(x => x.Tipo == TipoAtuador.Iluminacao);
        if (estado.PessoasNaLoja <= 2 && estado.SimulacaoAtiva)
        {
            if (iluminacao is not null) AplicarAcaoAtuador(estado, iluminacao, "Modo econômico");
            estado.EconomiaEnergiaEstimadaKwh += 0.08m;
            rotina.Status = "Executada";
            rotina.Resultado = "Baixo fluxo detectado. Iluminação ajustada para economia.";
            rotina.AcaoExecutada = "Iluminação em modo econômico";
            rotina.EconomiaEnergiaEstimadaKwh += 0.08m;
        }
        else
        {
            rotina.Status = "Monitorando";
            rotina.Resultado = "Fluxo dentro do padrão. Economia energética monitorada.";
        }
        rotina.UltimaExecucaoEm = DateTime.UtcNow;
    }

    private void RotinaRupturaEstoque(EstadoGemeoDigital estado)
    {
        var rotina = estado.RotinasAutomaticas.FirstOrDefault(x => x.Nome.Contains("ruptura"));
        if (rotina is null) return;

        foreach (var produto in estado.ProdutosOperacionais)
        {
            var saida = Math.Max(1, produto.VendidosHoje + produto.PerdidosHoje + produto.RetiradosHoje / 2);
            produto.PrevisaoRupturaHoras = produto.EstoqueAtual <= 0 ? 0 : Math.Round(produto.EstoqueAtual / (decimal)saida * 6m, 1);
            produto.AtualizadoEm = DateTime.UtcNow;
        }

        var criticos = estado.ProdutosOperacionais.Count(x => x.EstoqueAtual <= x.EstoqueMinimo || x.PrevisaoRupturaHoras <= 4);
        rotina.Status = criticos > 0 ? "Atenção" : "Normal";
        rotina.Resultado = criticos > 0 ? $"{criticos} produto(s) com risco de ruptura." : "Nenhum risco relevante de ruptura.";
        rotina.UltimaExecucaoEm = DateTime.UtcNow;
    }

    private void RotinaCompra(EstadoGemeoDigital estado)
    {
        var rotina = estado.RotinasAutomaticas.FirstOrDefault(x => x.Nome.Contains("compra"));
        if (rotina is null) return;

        foreach (var produto in estado.ProdutosOperacionais)
        {
            var precisaRepor = produto.EstoqueAtual <= produto.EstoqueMinimo || produto.PrevisaoRupturaHoras <= 4;
            produto.SugestaoCompra = precisaRepor ? Math.Max(0, produto.EstoqueMaximo - produto.EstoqueAtual) : 0;
            produto.MotivoSugestao = precisaRepor
                ? "Estoque baixo ou previsão de ruptura próxima."
                : "Sem reposição prioritária.";
        }

        var sugestoes = estado.ProdutosOperacionais.Count(x => x.SugestaoCompra > 0);
        rotina.Status = sugestoes > 0 ? "Recomendação gerada" : "Normal";
        rotina.Resultado = sugestoes > 0 ? $"{sugestoes} produto(s) com compra sugerida." : "Estoque dentro dos parâmetros.";
        rotina.UltimaExecucaoEm = DateTime.UtcNow;
    }

    private void RotinaTemperatura(EstadoGemeoDigital estado)
    {
        var rotina = estado.RotinasAutomaticas.FirstOrDefault(x => x.Nome.Contains("térmico"));
        if (rotina is null) return;

        var geladeira = Zona(estado, TipoZona.Geladeira);
        var atuador = estado.Atuadores.FirstOrDefault(x => x.Tipo == TipoAtuador.Refrigeracao);
        var temp = geladeira.TemperaturaCelsius ?? 4m;

        if (temp >= 8m)
        {
            if (atuador is not null) AplicarAcaoAtuador(estado, atuador, "Refrigeração máxima");
            CriarAlerta(estado, "Temperatura elevada na geladeira", "A temperatura está acima do ideal para produtos perecíveis.", SeveridadeAlerta.Alta, geladeira.Id, "Acionar refrigeração máxima e verificar porta.", 180);
            rotina.Status = "Correção automática";
            rotina.Resultado = "Temperatura elevada. Refrigeração máxima acionada.";
            rotina.AcaoExecutada = "Refrigeração máxima";
        }
        else
        {
            rotina.Status = "Normal";
            rotina.Resultado = "Temperatura dentro do intervalo esperado.";
        }

        rotina.UltimaExecucaoEm = DateTime.UtcNow;
    }

    private void RotinaConciliacao(EstadoGemeoDigital estado)
    {
        var rotina = estado.RotinasAutomaticas.FirstOrDefault(x => x.Nome.Contains("Conciliação"));
        if (rotina is null) return;

        var divergencias = estado.Zonas
            .Where(x => x.EstoqueFisico.HasValue && x.EstoqueEsperado.HasValue)
            .Where(x => Math.Abs(x.EstoqueEsperado!.Value - x.EstoqueFisico!.Value) >= 2)
            .ToList();

        rotina.Status = divergencias.Count > 0 ? "Divergência" : "Normal";
        rotina.Resultado = divergencias.Count > 0
            ? $"{divergencias.Count} zona(s) com divergência físico x digital."
            : "Estoque físico e digital conciliados.";
        rotina.UltimaExecucaoEm = DateTime.UtcNow;
    }

    private void AplicarLeituraAoEstado(EstadoGemeoDigital estado, SensorLoja sensor, ZonaLoja zona, decimal valor)
    {
        switch (sensor.Tipo)
        {
            case TipoSensor.Presenca:
                estado.PessoasNaLoja = Math.Max(0, (int)valor);
                zona.QuantidadePessoas = estado.PessoasNaLoja;
                break;
            case TipoSensor.PesoPrateleira:
                zona.EstoqueFisico = Math.Max(0, (int)valor);
                if (zona.EstoqueFisico <= 6)
                    CriarAlerta(estado, $"Estoque crítico em {zona.Nome}", "Sensor indicou estoque abaixo do mínimo operacional.", SeveridadeAlerta.Media, zona.Id, "Programar reposição da prateleira.", 0);
                break;
            case TipoSensor.Temperatura:
                zona.TemperaturaCelsius = valor;
                zona.Status = valor >= 10 ? StatusZona.Critico : valor >= 7 ? StatusZona.Atencao : StatusZona.Normal;
                break;
            case TipoSensor.Energia:
                estado.ConsumoEnergiaTotalKwh = valor;
                zona.ConsumoEnergiaKwh = valor;
                break;
            case TipoSensor.Checkout:
                zona.Status = valor >= 2 ? StatusZona.Manutencao : valor >= 1 ? StatusZona.Atencao : StatusZona.Normal;
                var checkout = estado.Atuadores.FirstOrDefault(x => x.Tipo == TipoAtuador.Checkout);
                if (checkout is not null)
                {
                    checkout.Status = valor >= 2 ? "Modo manutencao" : valor >= 1 ? "Reiniciar terminal" : "Operacional";
                    checkout.UltimaAcao = checkout.Status;
                    checkout.UltimaAcaoEm = DateTime.UtcNow;
                }
                break;
            case TipoSensor.Porta:
                zona.Status = valor >= 2 ? StatusZona.Bloqueado : StatusZona.Normal;
                zona.RiscoAtual = valor >= 2 ? "Entrada bloqueada pelo sensor da porta." : null;
                var porta = estado.Atuadores.FirstOrDefault(x => x.Tipo == TipoAtuador.PortaAutomatica);
                if (porta is not null)
                {
                    porta.Status = valor >= 2 ? "Bloqueada" : "Liberada";
                    porta.UltimaAcao = porta.Status;
                    porta.UltimaAcaoEm = DateTime.UtcNow;
                }
                break;
        }
    }

    private void AplicarCenarioHorarioPico(EstadoGemeoDigital estado)
    {
        estado.PessoasNaLoja = 18;
        var entrada = Zona(estado, TipoZona.Entrada);
        var circulacao = Zona(estado, TipoZona.Circulacao);
        entrada.Status = StatusZona.Atencao;
        circulacao.Status = StatusZona.Atencao;
        entrada.RiscoAtual = "Entrada com fluxo elevado.";
        circulacao.RiscoAtual = "Circulação acima do recomendado.";
        CriarAlerta(estado, "Horário de pico", "Fluxo acima da capacidade recomendada.", SeveridadeAlerta.Alta, entrada.Id, "Limitar entrada e priorizar checkout.", 0);
        var porta = estado.Atuadores.FirstOrDefault(x => x.Tipo == TipoAtuador.PortaAutomatica);
        if (porta is not null) AplicarAcaoAtuador(estado, porta, "Entrada limitada");
    }

    private void AplicarCenarioFalhaGeladeira(EstadoGemeoDigital estado)
    {
        var geladeira = Zona(estado, TipoZona.Geladeira);
        geladeira.TemperaturaCelsius = 12;
        geladeira.Status = StatusZona.Critico;
        geladeira.RiscoAtual = "Risco de perda de produtos perecíveis.";
        estado.PerdaFinanceiraEstimada += 240;
        CriarAlerta(estado, "Temperatura crítica na geladeira", "Temperatura ultrapassou o limite seguro.", SeveridadeAlerta.Critica, geladeira.Id, "Ativar refrigeração máxima e bloquear venda refrigerada.", 240);
        var refrigeracao = estado.Atuadores.FirstOrDefault(x => x.Tipo == TipoAtuador.Refrigeracao);
        if (refrigeracao is not null) AplicarAcaoAtuador(estado, refrigeracao, "Refrigeração máxima");
    }

    private void AplicarCenarioCheckoutForaDoAr(EstadoGemeoDigital estado)
    {
        var checkout = Zona(estado, TipoZona.Checkout);
        checkout.Status = StatusZona.Manutencao;
        checkout.RiscoAtual = "Terminal indisponível.";
        estado.PerdaFinanceiraEstimada += 80;
        CriarAlerta(estado, "Checkout fora do ar", "Terminal de autoatendimento indisponível.", SeveridadeAlerta.Alta, checkout.Id, "Colocar terminal em manutenção e limitar entrada.", 80);
        var porta = estado.Atuadores.FirstOrDefault(x => x.Tipo == TipoAtuador.PortaAutomatica);
        if (porta is not null) AplicarAcaoAtuador(estado, porta, "Entrada limitada");
    }

    private void AplicarCenarioDivergenciaPagamento(EstadoGemeoDigital estado)
    {
        var produto = estado.ProdutosOperacionais.First(x => x.Categoria == "Bebidas");
        produto.EstoqueAtual = Math.Max(0, produto.EstoqueAtual - 2);
        produto.PerdidosHoje += 2;
        estado.PerdaFinanceiraEstimada += produto.PrecoVenda * 2;
        var bebidas = estado.Zonas.First(x => x.Nome.Contains("Bebidas"));
        bebidas.EstoqueFisico = (bebidas.EstoqueFisico ?? 0) - 2;
        bebidas.Status = StatusZona.Critico;
        bebidas.RiscoAtual = "Divergência entre retirada e pagamento.";
        CriarAlerta(estado, "Divergência operacional em bebidas", "Produto retirado sem pagamento equivalente.", SeveridadeAlerta.Critica, bebidas.Id, "Conferir eventos de prateleira e checkout.", produto.PrecoVenda * 2);
    }

    private void AplicarCenarioPicoEnergia(EstadoGemeoDigital estado)
    {
        var circulacao = Zona(estado, TipoZona.Circulacao);
        estado.ConsumoEnergiaTotalKwh = 9.8m;
        circulacao.ConsumoEnergiaKwh = 9.8m;
        circulacao.Status = StatusZona.Atencao;
        circulacao.RiscoAtual = "Consumo acima do padrão.";
        CriarAlerta(estado, "Consumo energético anormal", "Consumo acima do comportamento esperado.", SeveridadeAlerta.Media, circulacao.Id, "Ativar modo econômico e verificar equipamentos.", 35);
        var iluminacao = estado.Atuadores.FirstOrDefault(x => x.Tipo == TipoAtuador.Iluminacao);
        if (iluminacao is not null) AplicarAcaoAtuador(estado, iluminacao, "Modo econômico");
    }

    private void AplicarCenarioEstoqueCritico(EstadoGemeoDigital estado)
    {
        var produto = estado.ProdutosOperacionais.First(x => x.Nome.Contains("Água"));
        produto.EstoqueAtual = Math.Min(produto.EstoqueAtual, 5);
        produto.SugestaoCompra = produto.EstoqueMaximo - produto.EstoqueAtual;
        produto.MotivoSugestao = "Estoque crítico forçado pelo cenário.";
        var bebidas = estado.Zonas.First(x => x.Nome.Contains("Bebidas"));
        bebidas.Status = StatusZona.Atencao;
        CriarAlerta(estado, "Estoque crítico de água", "Água mineral abaixo do nível mínimo.", SeveridadeAlerta.Media, bebidas.Id, "Repor água mineral antes do próximo pico.", 0);
    }

    private void AplicarAcaoAtuador(EstadoGemeoDigital estado, AtuadorLoja atuador, string acao)
    {
        atuador.Status = acao;
        atuador.UltimaAcao = acao;
        atuador.UltimaAcaoEm = DateTime.UtcNow;
        var zona = estado.Zonas.FirstOrDefault(x => x.Id == atuador.ZonaId);
        if (zona is null) return;

        switch (atuador.Tipo)
        {
            case TipoAtuador.PortaAutomatica:
                if (AcaoContem(acao, "liber") || AcaoContem(acao, "desbloque"))
                {
                    zona.Status = StatusZona.Normal;
                    zona.RiscoAtual = null;
                }
                else if (AcaoContem(acao, "bloque"))
                {
                    zona.Status = StatusZona.Bloqueado;
                    zona.RiscoAtual = "Porta bloqueada. Novas entradas e saídas ficam retidas.";
                }
                else if (AcaoContem(acao, "limit"))
                {
                    zona.Status = StatusZona.Atencao;
                    zona.RiscoAtual = "Entrada limitada. O fluxo de novos clientes foi reduzido.";
                }
                else
                {
                    zona.Status = StatusZona.Normal;
                    zona.RiscoAtual = null;
                }
                break;
            case TipoAtuador.Refrigeracao:
                if (AcaoContem(acao, "máxima") || AcaoContem(acao, "maxima"))
                {
                    zona.TemperaturaCelsius = Math.Max(4, (zona.TemperaturaCelsius ?? 9) - 3);
                    zona.Status = zona.TemperaturaCelsius > 8 ? StatusZona.Atencao : StatusZona.Normal;
                    zona.RiscoAtual = zona.Status == StatusZona.Normal ? null : "Refrigeração em correção.";
                }
                else if (AcaoContem(acao, "econ"))
                {
                    zona.Status = StatusZona.ModoEconomico;
                    zona.RiscoAtual = "Refrigeração operando em modo econômico.";
                }
                else
                {
                    zona.Status = StatusZona.Normal;
                    zona.RiscoAtual = null;
                }
                break;
            case TipoAtuador.Iluminacao:
                zona.Status = AcaoContem(acao, "econ") ? StatusZona.ModoEconomico : AcaoContem(acao, "alerta") ? StatusZona.Atencao : StatusZona.Normal;
                zona.RiscoAtual = zona.Status == StatusZona.Normal ? null : acao;
                break;
            case TipoAtuador.Checkout:
                zona.Status = AcaoContem(acao, "manut") ? StatusZona.Manutencao : AcaoContem(acao, "reiniciar") ? StatusZona.Atencao : StatusZona.Normal;
                zona.RiscoAtual = zona.Status == StatusZona.Manutencao ? "Checkout indisponível. Clientes ficam aguardando pagamento." : zona.Status == StatusZona.Atencao ? "Terminal em reinicialização." : null;
                break;
            case TipoAtuador.PainelDigital:
                zona.Status = AcaoContem(acao, "indispon") ? StatusZona.Critico : AcaoContem(acao, "confer") ? StatusZona.Atencao : StatusZona.Normal;
                zona.RiscoAtual = zona.Status == StatusZona.Normal ? null : acao;
                break;
        }
        zona.AtualizadoEm = DateTime.UtcNow;
    }

    private void AplicarAcaoAtuador(EstadoGemeoDigital estado, AtuadorLoja atuador, string acao, string? motivo)
    {
        AplicarAcaoAtuador(estado, atuador, acao);
        if (motivo is not null)
            AdicionarEvento(estado, TipoEventoLinhaDoTempo.AcaoAtuador, $"{atuador.Nome}: {acao}. {motivo}", "Gêmeo digital");
    }

    private void CriarAlerta(EstadoGemeoDigital estado, string titulo, string descricao, SeveridadeAlerta severidade, Guid? zonaId, string recomendacao, decimal impacto)
    {
        var existente = estado.Alertas.FirstOrDefault(x => x.Titulo == titulo && x.Status == StatusAlerta.Aberto);
        if (existente is not null)
            return;

        estado.Alertas.Insert(0, new AlertaLoja
        {
            EstadoGemeoDigitalId = estado.Id,
            Titulo = titulo,
            Descricao = descricao,
            Severidade = severidade,
            ZonaId = zonaId,
            Recomendacao = recomendacao,
            ImpactoFinanceiroEstimado = impacto,
            CriadoEm = DateTime.UtcNow
        });

        AdicionarEvento(estado, TipoEventoLinhaDoTempo.AlertaCriado, $"Alerta: {titulo} ({severidade}).", "Motor de regras");
        AdicionarEvento(estado, TipoEventoLinhaDoTempo.RecomendacaoGerada, recomendacao, "Motor de regras");
    }

    private void AtualizarRelatorioGerencial(EstadoGemeoDigital estado, bool fechamento)
    {
        estado.RelatorioGerencial ??= new RelatorioGerencialDia { EstadoGemeoDigitalId = estado.Id };
        var relatorio = estado.RelatorioGerencial;
        relatorio.GeradoEm = DateTime.UtcNow;
        relatorio.ProdutosVendidos = estado.ProdutosOperacionais.Sum(x => x.VendidosHoje);
        relatorio.ProdutosRetirados = estado.ProdutosOperacionais.Sum(x => x.RetiradosHoje);
        relatorio.ProdutosPerdidos = estado.ProdutosOperacionais.Sum(x => x.PerdidosHoje);
        relatorio.ReceitaEstimada = estado.ProdutosOperacionais.Sum(x => x.ReceitaHoje);
        relatorio.PerdaEstimada = estado.ProdutosOperacionais.Sum(x => x.PerdaHoje) + estado.PerdaFinanceiraEstimada;
        relatorio.ConsumoEnergiaKwh = estado.ConsumoEnergiaTotalKwh;
        relatorio.CustoEnergiaEstimado = estado.CustoEnergiaEstimadoHoje;
        relatorio.EconomiaEnergiaEstimadaKwh = estado.EconomiaEnergiaEstimadaKwh;
        relatorio.AlertasAbertos = estado.Alertas.Count(x => x.Status == StatusAlerta.Aberto);
        relatorio.AlertasCriticos = estado.Alertas.Count(x => x.Status == StatusAlerta.Aberto && x.Severidade == SeveridadeAlerta.Critica);
        relatorio.Diagnostico = MontarDiagnostico(estado, fechamento);

        relatorio.RecomendacoesCompra.Clear();
        foreach (var produto in estado.ProdutosOperacionais.Where(x => x.SugestaoCompra > 0).OrderByDescending(x => x.SugestaoCompra))
        {
            relatorio.RecomendacoesCompra.Add(new RecomendacaoCompra
            {
                RelatorioGerencialDiaId = relatorio.Id,
                Produto = produto.Nome,
                Categoria = produto.Categoria,
                EstoqueAtual = produto.EstoqueAtual,
                EstoqueMinimo = produto.EstoqueMinimo,
                QuantidadeSugerida = produto.SugestaoCompra,
                Motivo = produto.MotivoSugestao ?? "Reposição recomendada pelo gêmeo digital.",
                CustoEstimado = produto.SugestaoCompra * produto.CustoReposicao
            });
        }
    }

    private string MontarDiagnostico(EstadoGemeoDigital estado, bool fechamento)
    {
        var criticos = estado.Alertas.Count(x => x.Status == StatusAlerta.Aberto && x.Severidade == SeveridadeAlerta.Critica);
        var compras = estado.ProdutosOperacionais.Count(x => x.SugestaoCompra > 0);

        if (fechamento)
            return criticos > 0
                ? $"Fechamento com {criticos} alerta(s) crítico(s). Priorizar manutenção e conferência operacional."
                : compras > 0
                    ? $"Fechamento estável, com {compras} recomendação(ões) de compra para evitar ruptura."
                    : "Fechamento saudável. Estoque, energia e operação dentro dos parâmetros.";

        return criticos > 0
            ? "Operação crítica. O gêmeo digital recomenda intervenção imediata."
            : estado.SaudeOperacional < 75
                ? "Operação em atenção. Há riscos operacionais que exigem acompanhamento."
                : "Operação estável. Rotinas automáticas monitorando energia, estoque e fluxo.";
    }

    private void RecalcularSaudeOperacional(EstadoGemeoDigital estado)
    {
        var score = 100;
        foreach (var alerta in estado.Alertas.Where(x => x.Status == StatusAlerta.Aberto))
        {
            score -= alerta.Severidade switch
            {
                SeveridadeAlerta.Baixa => 4,
                SeveridadeAlerta.Media => 8,
                SeveridadeAlerta.Alta => 15,
                SeveridadeAlerta.Critica => 25,
                _ => 0
            };
        }

        if (estado.PessoasNaLoja > estado.CapacidadeRecomendada) score -= 8;
        if (estado.ConsumoEnergiaTotalKwh > 8) score -= 6;
        if (estado.ProdutosOperacionais.Any(x => x.EstoqueAtual <= x.EstoqueMinimo)) score -= 6;
        estado.SaudeOperacional = Math.Clamp(score, 0, 100);
    }

    private void SincronizarEstoqueDasZonas(EstadoGemeoDigital estado)
    {
        foreach (var zona in estado.Zonas.Where(x => x.Tipo is TipoZona.Prateleira or TipoZona.Geladeira))
        {
            var produtos = estado.ProdutosOperacionais.Where(x => x.ZonaId == zona.Id).ToList();
            if (produtos.Count == 0) continue;
            zona.EstoqueFisico = produtos.Sum(x => x.EstoqueAtual);
            zona.EstoqueEsperado = produtos.Sum(x => x.EstoqueAtual + x.PerdidosHoje);
            zona.Status = produtos.Any(x => x.EstoqueAtual <= x.EstoqueMinimo) ? StatusZona.Atencao : zona.Status == StatusZona.Critico ? StatusZona.Critico : StatusZona.Normal;
            zona.AtualizadoEm = DateTime.UtcNow;
        }
    }

    private void AdicionarEvento(EstadoGemeoDigital estado, TipoEventoLinhaDoTempo tipo, string descricao, string origem)
    {
        estado.LinhaDoTempo.Insert(0, new EventoLinhaDoTempo
        {
            EstadoGemeoDigitalId = estado.Id,
            Tipo = tipo,
            Descricao = descricao,
            Origem = origem,
            CriadoEm = DateTime.UtcNow
        });
    }

    private void AdicionarEventoSeNaoRecente(EstadoGemeoDigital estado, TipoEventoLinhaDoTempo tipo, string descricao, string origem, int janelaSegundos = 20)
    {
        var limite = DateTime.UtcNow.AddSeconds(-janelaSegundos);
        var jaRegistrado = estado.LinhaDoTempo.Any(x =>
            x.Tipo == tipo &&
            x.Descricao == descricao &&
            x.Origem == origem &&
            x.CriadoEm >= limite);

        if (!jaRegistrado)
            AdicionarEvento(estado, tipo, descricao, origem);
    }

    private LeituraSensorHistorico NovaLeitura(EstadoGemeoDigital estado, SensorLoja sensor, ZonaLoja zona, decimal valor, string unidade, string observacao)
    {
        return new LeituraSensorHistorico
        {
            EstadoGemeoDigitalId = estado.Id,
            SensorId = sensor.Id,
            SensorNome = sensor.Nome,
            TipoSensor = sensor.Tipo,
            ZonaId = zona.Id,
            ZonaNome = zona.Nome,
            Valor = Math.Round(valor, 2),
            Unidade = unidade,
            Observacao = observacao,
            CriadoEm = DateTime.UtcNow
        };
    }

    private void LimitarHistoricos(EstadoGemeoDigital estado)
    {
        estado.LeiturasSensores = estado.LeiturasSensores.OrderByDescending(x => x.CriadoEm).Take(450).ToList();
        estado.LinhaDoTempo = estado.LinhaDoTempo.OrderByDescending(x => x.CriadoEm).Take(180).ToList();
        estado.Alertas = estado.Alertas.OrderByDescending(x => x.CriadoEm).Take(90).ToList();
        estado.ClientesSimulados = estado.ClientesSimulados.OrderByDescending(x => x.CriadoEm).Take(35).ToList();
    }

    private EstadoGemeoDigital PrepararRetorno(EstadoGemeoDigital estado)
    {
        LimitarHistoricos(estado);
        estado.AtualizadoEm = DateTime.UtcNow;
        estado.LeiturasSensores = estado.LeiturasSensores.OrderByDescending(x => x.CriadoEm).ToList();
        estado.LinhaDoTempo = estado.LinhaDoTempo.OrderByDescending(x => x.CriadoEm).ToList();
        estado.Alertas = estado.Alertas.OrderByDescending(x => x.CriadoEm).ToList();
        estado.ProdutosOperacionais = estado.ProdutosOperacionais.OrderBy(x => x.Categoria).ThenBy(x => x.Nome).ToList();
        return estado;
    }

    private IEnumerable<ClienteSimulado> ClientesAtivos(EstadoGemeoDigital estado)
    {
        return estado.ClientesSimulados.Where(x => x.Etapa != "Finalizado");
    }

    private bool PortaEntradaBloqueada(EstadoGemeoDigital estado)
    {
        var entrada = Zona(estado, TipoZona.Entrada);
        var porta = estado.Atuadores.FirstOrDefault(x => x.Tipo == TipoAtuador.PortaAutomatica);
        var statusPorta = porta?.Status;

        if (AcaoContem(statusPorta, "liber") || AcaoContem(statusPorta, "desbloque"))
            return false;

        return entrada.Status == StatusZona.Bloqueado || AcaoContem(statusPorta, "bloque");
    }

    private bool PortaEntradaLimitada(EstadoGemeoDigital estado)
    {
        var entrada = Zona(estado, TipoZona.Entrada);
        var porta = estado.Atuadores.FirstOrDefault(x => x.Tipo == TipoAtuador.PortaAutomatica);

        return !PortaEntradaBloqueada(estado) && (entrada.Status == StatusZona.Atencao || AcaoContem(porta?.Status, "limit"));
    }

    private static bool AcaoContem(string? texto, string trecho)
    {
        return !string.IsNullOrWhiteSpace(texto) && texto.Contains(trecho, StringComparison.OrdinalIgnoreCase);
    }

    private ZonaLoja Zona(EstadoGemeoDigital estado, TipoZona tipo)
    {
        return estado.Zonas.First(x => x.Tipo == tipo);
    }

    private static string UnidadeSensor(TipoSensor tipo)
    {
        return tipo switch
        {
            TipoSensor.Presenca => "pessoas",
            TipoSensor.PesoPrateleira => "un",
            TipoSensor.Temperatura => "°C",
            TipoSensor.Energia => "kWh",
            TipoSensor.Checkout => "status",
            TipoSensor.Porta => "status",
            _ => string.Empty
        };
    }
}
