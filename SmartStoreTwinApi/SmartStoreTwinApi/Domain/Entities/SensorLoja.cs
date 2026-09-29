using SmartStoreTwinApi.Domain.Enums;

namespace SmartStoreTwinApi.Domain.Entities;

public class SensorLoja
{
    public Guid EstadoGemeoDigitalId { get; set; }

    public Guid Id { get; set; } = Guid.NewGuid();

    public string Nome { get; set; } = string.Empty;

    public TipoSensor Tipo { get; set; }

    public Guid ZonaId { get; set; }

    public bool Ativo { get; set; } = true;

    public decimal ConfiabilidadePercentual { get; set; } = 98;

    public DateTime UltimaLeituraEm { get; set; } = DateTime.UtcNow;
}