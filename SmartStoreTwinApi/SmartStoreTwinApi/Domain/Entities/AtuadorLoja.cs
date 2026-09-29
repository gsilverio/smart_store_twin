using SmartStoreTwinApi.Domain.Enums;

namespace SmartStoreTwinApi.Domain.Entities;

public class AtuadorLoja
{
    public Guid EstadoGemeoDigitalId { get; set; }

    public Guid Id { get; set; } = Guid.NewGuid();

    public string Nome { get; set; } = string.Empty;

    public TipoAtuador Tipo { get; set; }

    public Guid ZonaId { get; set; }

    public string Status { get; set; } = "Normal";

    public string? UltimaAcao { get; set; }

    public DateTime? UltimaAcaoEm { get; set; }
}
