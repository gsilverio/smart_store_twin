using Microsoft.AspNetCore.Mvc;
using SmartStoreTwinApi.Application;
using SmartStoreTwinApi.Domain.Entities;

namespace SmartStoreTwinApi.Controllers;

[ApiController]
[Route("api/gemeo-digital")]
public class GemeoDigitalController : ControllerBase
{
    private readonly MotorGemeoDigital _motor;
    private readonly OperacaoGemeoDigitalLock _operacaoLock;

    public GemeoDigitalController(MotorGemeoDigital motor, OperacaoGemeoDigitalLock operacaoLock)
    {
        _motor = motor;
        _operacaoLock = operacaoLock;
    }

    [HttpGet("estado")]
    public ActionResult<EstadoGemeoDigital> ObterEstado()
    {
        return Ok(_motor.ObterEstado());
    }

    [HttpGet("dados/leituras-sensores")]
    public ActionResult<List<LeituraSensorHistorico>> ObterLeiturasSensores([FromQuery] int take = 200)
    {
        return Ok(_motor.ObterLeiturasSensores(take));
    }

    [HttpGet("dados/produtos")]
    public ActionResult<List<ProdutoOperacional>> ObterProdutosOperacionais()
    {
        return Ok(_motor.ObterProdutosOperacionais());
    }

    [HttpGet("dados/rotinas")]
    public ActionResult<List<RotinaAutomatica>> ObterRotinasAutomaticas()
    {
        return Ok(_motor.ObterRotinasAutomaticas());
    }

    [HttpPost("reiniciar")]
    public ActionResult<EstadoGemeoDigital> Reiniciar()
    {
        return Ok(_operacaoLock.Executar(() => _motor.Reiniciar()));
    }

    [HttpPost("cenarios/{cenario}")]
    public ActionResult<EstadoGemeoDigital> SimularCenario([FromRoute] string cenario)
    {
        return Ok(_operacaoLock.Executar(() => _motor.SimularCenario(cenario)));
    }

    [HttpPost("atuadores/{atuadorId:guid}/acoes")]
    public ActionResult<EstadoGemeoDigital> AcionarAtuador(
        [FromRoute] Guid atuadorId,
        [FromBody] AcaoAtuadorRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Acao))
            return BadRequest("A acao do atuador deve ser informada.");

        return Ok(_operacaoLock.Executar(() => _motor.AcionarAtuador(
            atuadorId,
            request.Acao,
            string.IsNullOrWhiteSpace(request.Origem) ? "Operador" : request.Origem
        )));
    }

    [HttpPost("alertas/{alertaId:guid}/resolver")]
    public ActionResult<EstadoGemeoDigital> ResolverAlerta([FromRoute] Guid alertaId)
    {
        return Ok(_operacaoLock.Executar(() => _motor.ResolverAlerta(alertaId)));
    }

    [HttpPost("sensores/leituras")]
    public ActionResult<EstadoGemeoDigital> RegistrarLeituraSensor([FromBody] LeituraSensorRequest request)
    {
        if (request.SensorId == Guid.Empty)
            return BadRequest("O sensor deve ser informado.");

        return Ok(_operacaoLock.Executar(() => _motor.RegistrarLeituraSensor(
            request.SensorId,
            request.Valor,
            string.IsNullOrWhiteSpace(request.Observacao) ? "Leitura simulada" : request.Observacao
        )));
    }

    [HttpPost("simulacao/iniciar")]
    public ActionResult<EstadoGemeoDigital> IniciarSimulacao()
    {
        return Ok(_operacaoLock.Executar(() => _motor.IniciarSimulacao()));
    }

    [HttpPost("simulacao/parar")]
    public ActionResult<EstadoGemeoDigital> PararSimulacao()
    {
        return Ok(_operacaoLock.Executar(() => _motor.PararSimulacao()));
    }

    [HttpPost("simulacao/tick")]
    public ActionResult<EstadoGemeoDigital> ExecutarTickSimulacao()
    {
        return Ok(_operacaoLock.Executar(() => _motor.ExecutarTickSimulacao()));
    }

    [HttpPost("relatorios/fechamento-dia")]
    public ActionResult<EstadoGemeoDigital> GerarRelatorioFechamentoDia()
    {
        return Ok(_operacaoLock.Executar(() => _motor.GerarRelatorioFechamentoDia()));
    }
}

public class AcaoAtuadorRequest
{
    public string Acao { get; set; } = string.Empty;

    public string? Origem { get; set; }
}

public class LeituraSensorRequest
{
    public Guid SensorId { get; set; }

    public decimal Valor { get; set; }

    public string? Observacao { get; set; }
}
