using SmartStoreTwinApi.Domain.Enums;

namespace SmartStoreTwinApi.Domain.Entities;

public class EventoLinhaDoTempo
{
    public Guid EstadoGemeoDigitalId { get; set; }

    public Guid Id { get; set; } = Guid.NewGuid();

    public TipoEventoLinhaDoTempo Tipo { get; set; }

    public string Descricao { get; set; } = string.Empty;

    public string? Origem { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
