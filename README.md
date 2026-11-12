<<<<<<< HEAD
# ProjetoFaculdade3P
=======
# Cerrado em Lista — ConservaGO

Painel acadêmico de dados ambientais de Goiás. A entrega do ciclo 2 mantém a aplicação estática modular, com catálogo, mapa interativo e ranking das 30 unidades de conservação/parques por área e percentual atingido.

## Executar

Requisitos para gerar a publicação: Node.js 20+ e Python 3.10+ para o servidor local.

```sh
npm ci
npm run build
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Acesse http://127.0.0.1:8000. No Windows, use `py` caso esse seja o comando Python instalado. Não abra o HTML diretamente por file://. O diretório dist já gerado pode ser servido sem npm; dados e Leaflet estão incluídos e a consulta não depende de internet.

## Entrega do ciclo 2

Consulte o [guia de entrega](docs/entrega-ciclo-2.md) para fontes, demonstração, critérios de validação e reprodução da importação.

- Mapa de Goiás, limites das 30 unidades e dos 246 municípios.
- PRODES do novo anexo: 20 classes/períodos entre 2002 e 2026, selecionáveis no mapa e no ranking. Classes antigas não equivalem a anos civis comparáveis.
- Alertas DETER de 2018 a 2026, em camada própria, inicialmente desligada; não entram no ranking PRODES.
- Queimadas preservadas da base anterior: 2025 e janeiro–agosto de 2026. O novo anexo não contém uma substituição para fogo ou limites das unidades.
- Ranking por hectares ou percentual, integrado à seleção da unidade no mapa.
- Catálogo com busca, filtros, ordenação, paginação e detalhes dos registros.

O vetor consolidado PRODES substitui a versão anterior. As versões regionais 2021–2024 e o raster são inventariados, sem duplicar as áreas. O raster não é uma camada de previsão ou vegetação atual. A origem, os hashes, recortes e exclusões estão em `data/generated/cycle2-manifest.json` e `data/generated/map/metadata.json`.

## Estrutura mantida

```text
src/
  index.html             Página e navegação
  styles/                Estilos
  js/
    main.js              Inicialização
    config/              Configuração do catálogo
    data/                Adaptação dos dados
    features/            Catálogo, monitoramento e mapa
    shared/              Utilitários
data/generated/         Dados processados para publicação
scripts/                Processamento geoespacial e build
tests/                  Testes JavaScript e Python
docs/                   Arquitetura, roadmap e entrega
dist/                   Publicação gerada
apresentacao/           Apresentações acadêmicas
```

Edite src/ e gere dist/ com `npm run build`. A arquitetura continua descrita em [architecture.md](docs/architecture.md): interface estática com processamento geoespacial offline em Python, sem API, banco relacional ou atualização automática.

O [roadmap em colunas](docs/roadmap.html), sua [versão Markdown](docs/roadmap.md) e a [versão TXT](docs/roadmap.txt) registram as três fases. A fase 2 corresponde ao mapa e à análise espacial; a fase 3 prevê aprendizado de máquina para fogo e vegetação futura, ainda não implementado. O inventário original do roadmap é histórico; o guia de entrega documenta a atualização de novembro de 2026.

## Atualizar a base

As dependências Python são necessárias para recalcular os dados, não para consultar o painel. A importação do ciclo 2 usa o novo ZIP e o ZIP anterior, pois preserva fogo, unidades e demais cadastros. Siga os comandos completos no [guia de entrega](docs/entrega-ciclo-2.md#reprodução-da-importação).

O processamento ocorre em diretório intermediário. `scripts/activate_cycle2.mjs` valida a consistência antes da ativação e preserva a base substituída em .venv/. Os ZIPs de origem não são incluídos na publicação. Os arquivos históricos maiores são carregados por período e podem demorar mais para aparecer.

## Verificação

```sh
python -m pip install -r requirements.txt
npm test
python -m unittest discover -s tests -p "test_*.py"
npm run build
```

Os testes cobrem seleção independente dos períodos, catálogo, filtragem da origem, cálculos de área, sobreposições e consistência entre manifesto e indicadores publicados.

## Método e limites

A área atingida corresponde à união das interseções dos eventos com o limite da unidade. A área integral do limite fornecido é o denominador do percentual. Os cálculos usam projeção equivalente LAEA centrada em latitude -15 e longitude -49 e não contam sobreposições duas vezes. O PRODES novo é filtrado e recortado para Goiás; portanto, não descreve eventos fora do estado em unidades que ultrapassem esse território.

As geometrias são simplificadas apenas para exibição. O contorno de Goiás vem da união dos municípios fornecidos. Leaflet 1.9.4 está incluído com sua licença; não há imagens de satélite ou mapa externo de ruas.

PRODES, alertas DETER e queimadas têm metodologias e períodos distintos. Os números do painel não são taxas oficiais do INPE. Zero significa ausência de interseção na base utilizada, não prova ausência de impacto. Queimadas não implicam perda permanente de vegetação. As métricas combinadas antigas foram anuladas por não terem sido recalculadas para a nova série; a interface apresenta os indicadores separados.
>>>>>>> d486181 (Primeira versao do projeto para o git)
