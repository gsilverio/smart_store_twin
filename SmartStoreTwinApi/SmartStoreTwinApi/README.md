# SmartStoreTwinApi

Backend do gêmeo digital de loja autônoma usado para o MVP da apresentação.

Esta versão roda em memória para garantir estabilidade durante a demonstração, mantendo todos os recursos principais do gêmeo digital:

- loja 2D viva alimentada pelo estado da API;
- sensores simulados com histórico de leituras;
- clientes simulados entrando, circulando, retirando produtos e passando no checkout;
- estoque inteligente por produto;
- rotinas automáticas de energia, estoque, compra, temperatura e conciliação físico x digital;
- atuadores simulados;
- alertas e recomendações;
- relatório gerencial de fechamento do dia.

## Rodar

```bash
dotnet run
```

Swagger em ambiente de desenvolvimento:

```txt
/swagger
```

## Observação

O foco do projeto é demonstrar a atuação do gêmeo digital. Esta versão não depende de PostgreSQL para evitar instabilidade no fluxo live da apresentação.
