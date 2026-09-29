using SmartStoreTwinApi.Domain.Enums;

namespace SmartStoreTwinApi.Domain.Entities;

public class ZonaLoja
{
    public Guid EstadoGemeoDigitalId { get; set; }

    public Guid Id { get; set; } = Guid.NewGuid();

    public string Nome { get; set; } = string.Empty;

    public TipoZona Tipo { get; set; }

    public StatusZona Status { get; set; } = StatusZona.Normal;

    public int? EstoqueEsperado { get; set; }

    public int? EstoqueFisico { get; set; }

    public decimal? TemperaturaCelsius { get; set; }

    public decimal? ConsumoEnergiaKwh { get; set; }

    public int QuantidadePessoas { get; set; }

    public string? RiscoAtual { get; set; }

    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
}