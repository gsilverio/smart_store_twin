using SmartStoreTwinApi.Domain.Entities;
using SmartStoreTwinApi.Domain.Enums;

namespace SmartStoreTwinApi.Application;

public class EstadoGemeoStore
{
    private EstadoGemeoDigital _estado;

    public EstadoGemeoStore()
    {
        _estado = CriarEstadoInicial();
    }

    public EstadoGemeoDigital Obter()
    {
        return _estado;
    }

    public EstadoGemeoDigital ObterSnapshot()
    {
        return _estado;
    }

    public EstadoGemeoDigital Reiniciar()
    {
        _estado = CriarEstadoInicial();
        return _estado;
    }

    public void Aplicar(EstadoGemeoDigital estado)
    {
        _estado = estado;
    }

    public void Salvar()
    {
        // Estado em memoria. Mantido por compatibilidade com o motor.
    }

    private static EstadoGemeoDigital CriarEstadoInicial()
    {
        var estado = new EstadoGemeoDigital
        {
            NomeLoja = "Gêmeo Digital de Loja Autônoma",
            SaudeOperacional = 96,
            PessoasNaLoja = 0,
            CapacidadeRecomendada = 14,
            ConsumoEnergiaTotalKwh = 4.8m,
            CustoEnergiaEstimadoHoje = 3.36m,
            PerdaFinanceiraEstimada = 0,
            ReceitaEstimadaHoje = 0,
            ProdutosVendidosHoje = 0,
            EconomiaEnergiaEstimadaKwh = 0,
            SimulacaoAtiva = false,
            PerfilSimulacao = "Operação normal",
            MultiplicadorFluxo = 1m,
            TickAtual = 0,
            AtualizadoEm = DateTime.UtcNow
        };

        var entrada = new ZonaLoja
        {
            EstadoGemeoDigitalId = estado.Id,
            Nome = "Entrada / Saída",
            Tipo = TipoZona.Entrada,
            Status = StatusZona.Normal
        };

        var bebidas = new ZonaLoja
        {
            EstadoGemeoDigitalId = estado.Id,
            Nome = "Prateleira de Bebidas",
            Tipo = TipoZona.Prateleira,
            Status = StatusZona.Normal,
            EstoqueEsperado = 72,
            EstoqueFisico = 72
        };

        var snacks = new ZonaLoja
        {
            EstadoGemeoDigitalId = estado.Id,
            Nome = "Prateleira de Snacks",
            Tipo = TipoZona.Prateleira,
            Status = StatusZona.Normal,
            EstoqueEsperado = 63,
            EstoqueFisico = 63
        };

        var geladeira = new ZonaLoja
        {
            EstadoGemeoDigitalId = estado.Id,
            Nome = "Geladeira / Freezer",
            Tipo = TipoZona.Geladeira,
            Status = StatusZona.Normal,
            EstoqueEsperado = 43,
            EstoqueFisico = 43,
            TemperaturaCelsius = 4.2m,
            ConsumoEnergiaKwh = 2.2m
        };

        var checkout = new ZonaLoja
        {
            EstadoGemeoDigitalId = estado.Id,
            Nome = "Checkout Autoatendimento",
            Tipo = TipoZona.Checkout,
            Status = StatusZona.Normal
        };

        var circulacao = new ZonaLoja
        {
            EstadoGemeoDigitalId = estado.Id,
            Nome = "Área de Circulação",
            Tipo = TipoZona.Circulacao,
            Status = StatusZona.Normal,
            ConsumoEnergiaKwh = 2.6m
        };

        var painel = new ZonaLoja
        {
            EstadoGemeoDigitalId = estado.Id,
            Nome = "Painel Digital",
            Tipo = TipoZona.PainelDigital,
            Status = StatusZona.Normal
        };

        estado.Zonas = new List<ZonaLoja>
        {
            entrada,
            bebidas,
            snacks,
            geladeira,
            checkout,
            circulacao,
            painel
        };

        estado.Sensores = new List<SensorLoja>
        {
            NovoSensor(estado.Id, "Sensor de Presença - Entrada", TipoSensor.Presenca, entrada.Id, 97),
            NovoSensor(estado.Id, "Sensor de Porta - Entrada", TipoSensor.Porta, entrada.Id, 95),
            NovoSensor(estado.Id, "Sensor de Peso - Bebidas", TipoSensor.PesoPrateleira, bebidas.Id, 96),
            NovoSensor(estado.Id, "Sensor de Peso - Snacks", TipoSensor.PesoPrateleira, snacks.Id, 96),
            NovoSensor(estado.Id, "Sensor de Temperatura - Geladeira", TipoSensor.Temperatura, geladeira.Id, 98),
            NovoSensor(estado.Id, "Sensor de Energia Geral", TipoSensor.Energia, circulacao.Id, 94),
            NovoSensor(estado.Id, "Sensor de Status - Checkout", TipoSensor.Checkout, checkout.Id, 99)
        };

        estado.Atuadores = new List<AtuadorLoja>
        {
            NovoAtuador(estado.Id, "Porta Automática", TipoAtuador.PortaAutomatica, entrada.Id, "Liberada"),
            NovoAtuador(estado.Id, "Refrigeração Inteligente", TipoAtuador.Refrigeracao, geladeira.Id, "Normal"),
            NovoAtuador(estado.Id, "Iluminação Ambiente", TipoAtuador.Iluminacao, circulacao.Id, "Normal"),
            NovoAtuador(estado.Id, "Terminal de Checkout", TipoAtuador.Checkout, checkout.Id, "Operacional"),
            NovoAtuador(estado.Id, "Painel de Orientação", TipoAtuador.PainelDigital, painel.Id, "Mensagem padrão")
        };

        estado.ProdutosOperacionais = new List<ProdutoOperacional>
        {
            NovoProduto(estado.Id, "Água mineral 500ml", "Bebidas", bebidas, 34, 18, 72, 3.50m, 1.60m),
            NovoProduto(estado.Id, "Refrigerante lata", "Bebidas", bebidas, 26, 16, 60, 6.00m, 3.10m),
            NovoProduto(estado.Id, "Energético", "Bebidas", bebidas, 12, 10, 36, 10.00m, 5.80m),
            NovoProduto(estado.Id, "Salgadinho pacote", "Snacks", snacks, 31, 15, 63, 7.50m, 3.80m),
            NovoProduto(estado.Id, "Barra de chocolate", "Snacks", snacks, 24, 12, 48, 5.00m, 2.30m),
            NovoProduto(estado.Id, "Sanduíche natural", "Refrigerados", geladeira, 18, 8, 30, 13.90m, 7.10m),
            NovoProduto(estado.Id, "Iogurte proteico", "Refrigerados", geladeira, 25, 10, 36, 8.50m, 4.50m)
        };

        estado.RotinasAutomaticas = new List<RotinaAutomatica>
        {
            NovaRotina(estado.Id, "Otimização energética por fluxo", "Ajusta iluminação e refrigeração conforme movimento e temperatura."),
            NovaRotina(estado.Id, "Previsão de ruptura de estoque", "Calcula risco de faltar produto com base no consumo simulado."),
            NovaRotina(estado.Id, "Recomendação de compra", "Gera sugestão de reposição para o gerente."),
            NovaRotina(estado.Id, "Controle térmico inteligente", "Monitora a geladeira e aciona refrigeração quando necessário."),
            NovaRotina(estado.Id, "Conciliação físico x digital", "Compara estoque esperado com leitura física simulada.")
        };

        estado.RelatorioGerencial = new RelatorioGerencialDia
        {
            EstadoGemeoDigitalId = estado.Id,
            Diagnostico = "Operação inicial saudável. A simulação ainda não acumulou dados do dia.",
            GeradoEm = DateTime.UtcNow
        };

        estado.LinhaDoTempo.Add(new EventoLinhaDoTempo
        {
            EstadoGemeoDigitalId = estado.Id,
            Tipo = TipoEventoLinhaDoTempo.EstadoAlterado,
            Descricao = "Gêmeo digital inicializado com sensores, estoque, atuadores e rotinas automáticas.",
            Origem = "Sistema",
            CriadoEm = DateTime.UtcNow
        });

        CriarHistoricoInicial(estado);
        AtualizarResumoInicial(estado);

        return estado;
    }

    private static SensorLoja NovoSensor(Guid estadoId, string nome, TipoSensor tipo, Guid zonaId, decimal confiabilidade)
    {
        return new SensorLoja
        {
            EstadoGemeoDigitalId = estadoId,
            Nome = nome,
            Tipo = tipo,
            ZonaId = zonaId,
            ConfiabilidadePercentual = confiabilidade,
            UltimaLeituraEm = DateTime.UtcNow.AddMinutes(-5)
        };
    }

    private static AtuadorLoja NovoAtuador(Guid estadoId, string nome, TipoAtuador tipo, Guid zonaId, string status)
    {
        return new AtuadorLoja
        {
            EstadoGemeoDigitalId = estadoId,
            Nome = nome,
            Tipo = tipo,
            ZonaId = zonaId,
            Status = status
        };
    }

    private static ProdutoOperacional NovoProduto(Guid estadoId, string nome, string categoria, ZonaLoja zona, int estoque, int minimo, int maximo, decimal preco, decimal custo)
    {
        return new ProdutoOperacional
        {
            EstadoGemeoDigitalId = estadoId,
            Nome = nome,
            Categoria = categoria,
            ZonaId = zona.Id,
            ZonaNome = zona.Nome,
            EstoqueAtual = estoque,
            EstoqueMinimo = minimo,
            EstoqueMaximo = maximo,
            PrecoVenda = preco,
            CustoReposicao = custo,
            AtualizadoEm = DateTime.UtcNow
        };
    }

    private static RotinaAutomatica NovaRotina(Guid estadoId, string nome, string descricao)
    {
        return new RotinaAutomatica
        {
            EstadoGemeoDigitalId = estadoId,
            Nome = nome,
            Descricao = descricao,
            Status = "Aguardando dados",
            Resultado = "Rotina pronta para processar leituras do ambiente."
        };
    }

    private static void CriarHistoricoInicial(EstadoGemeoDigital estado)
    {
        var agora = DateTime.UtcNow;
        var random = new Random(42);

        var sensorPresenca = estado.Sensores.First(x => x.Tipo == TipoSensor.Presenca);
        var sensorTemperatura = estado.Sensores.First(x => x.Tipo == TipoSensor.Temperatura);
        var sensorEnergia = estado.Sensores.First(x => x.Tipo == TipoSensor.Energia);
        var sensorBebidas = estado.Sensores.First(x => x.Nome.Contains("Bebidas"));
        var sensorSnacks = estado.Sensores.First(x => x.Nome.Contains("Snacks"));
        var sensorCheckout = estado.Sensores.First(x => x.Tipo == TipoSensor.Checkout);

        for (var i = 48; i >= 1; i--)
        {
            var instante = agora.AddMinutes(-i * 10);
            var horaLocal = instante.Hour;
            var pico = horaLocal is >= 17 and <= 21;
            var pessoas = pico ? random.Next(8, 18) : random.Next(1, 8);
            var temperatura = pico ? 4.6m + (decimal)random.NextDouble() * 1.2m : 3.8m + (decimal)random.NextDouble() * 0.8m;
            var energia = pico ? 5.8m + (decimal)random.NextDouble() * 2m : 3.4m + (decimal)random.NextDouble() * 1.2m;
            var estoqueBebidas = 72 - random.Next(0, 18);
            var estoqueSnacks = 63 - random.Next(0, 15);

            estado.LeiturasSensores.Add(NovaLeitura(estado.Id, sensorPresenca, estado.Zonas.First(z => z.Id == sensorPresenca.ZonaId), pessoas, "pessoas", "Histórico de fluxo" , instante));
            estado.LeiturasSensores.Add(NovaLeitura(estado.Id, sensorTemperatura, estado.Zonas.First(z => z.Id == sensorTemperatura.ZonaId), Math.Round(temperatura, 1), "°C", "Histórico térmico", instante));
            estado.LeiturasSensores.Add(NovaLeitura(estado.Id, sensorEnergia, estado.Zonas.First(z => z.Id == sensorEnergia.ZonaId), Math.Round(energia, 1), "kWh", "Histórico energético", instante));
            estado.LeiturasSensores.Add(NovaLeitura(estado.Id, sensorBebidas, estado.Zonas.First(z => z.Id == sensorBebidas.ZonaId), estoqueBebidas, "un", "Histórico de estoque físico", instante));
            estado.LeiturasSensores.Add(NovaLeitura(estado.Id, sensorSnacks, estado.Zonas.First(z => z.Id == sensorSnacks.ZonaId), estoqueSnacks, "un", "Histórico de estoque físico", instante));
            estado.LeiturasSensores.Add(NovaLeitura(estado.Id, sensorCheckout, estado.Zonas.First(z => z.Id == sensorCheckout.ZonaId), 0, "status", "Checkout operacional", instante));
        }

        estado.LeiturasSensores = estado.LeiturasSensores
            .OrderByDescending(x => x.CriadoEm)
            .Take(300)
            .ToList();
    }

    private static LeituraSensorHistorico NovaLeitura(Guid estadoId, SensorLoja sensor, ZonaLoja zona, decimal valor, string unidade, string observacao, DateTime? criadoEm = null)
    {
        return new LeituraSensorHistorico
        {
            EstadoGemeoDigitalId = estadoId,
            SensorId = sensor.Id,
            SensorNome = sensor.Nome,
            TipoSensor = sensor.Tipo,
            ZonaId = zona.Id,
            ZonaNome = zona.Nome,
            Valor = valor,
            Unidade = unidade,
            Observacao = observacao,
            CriadoEm = criadoEm ?? DateTime.UtcNow
        };
    }

    private static void AtualizarResumoInicial(EstadoGemeoDigital estado)
    {
        var bebidas = estado.Zonas.First(x => x.Nome.Contains("Bebidas"));
        bebidas.EstoqueFisico = estado.ProdutosOperacionais.Where(x => x.Categoria == "Bebidas").Sum(x => x.EstoqueAtual);
        bebidas.EstoqueEsperado = bebidas.EstoqueFisico;

        var snacks = estado.Zonas.First(x => x.Nome.Contains("Snacks"));
        snacks.EstoqueFisico = estado.ProdutosOperacionais.Where(x => x.Categoria == "Snacks").Sum(x => x.EstoqueAtual);
        snacks.EstoqueEsperado = snacks.EstoqueFisico;

        var geladeira = estado.Zonas.First(x => x.Tipo == TipoZona.Geladeira);
        geladeira.EstoqueFisico = estado.ProdutosOperacionais.Where(x => x.Categoria == "Refrigerados").Sum(x => x.EstoqueAtual);
        geladeira.EstoqueEsperado = geladeira.EstoqueFisico;
    }
}
