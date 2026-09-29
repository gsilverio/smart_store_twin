using SmartStoreTwinApi.Domain.Enums;

namespace SmartStoreTwinApi.Domain.Entities;

public class LeituraSensorHistorico
{
    public Guid EstadoGemeoDigitalId { get; set; }

    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid SensorId { get; set; }

    public string SensorNome { get; set; } = string.Empty;

    public TipoSensor TipoSensor { get; set; }

    public Guid ZonaId { get; set; }

    public string ZonaNome { get; set; } = string.Empty;

    public decimal Valor { get; set; }

    public string Unidade { get; set; } = string.Empty;

    public string? Observacao { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
