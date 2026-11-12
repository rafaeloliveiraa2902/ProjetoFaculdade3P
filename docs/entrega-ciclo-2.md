# Entrega do ciclo 2 — mapa e análise espacial

Atualização: 01/11/2026. Escopo: fase 2 do roadmap, com atualização para o anexo dados ciclo 2.zip. Mantidos diretórios, arquitetura estática modular, layout geral, catálogo, mapa e tabela. Não foram introduzidos backend, banco relacional, autenticação ou machine learning.

## Origem dos dados e decisões de importação

- **PRODES:** o shapefile yearly_deforestation_biome_cerrado_v20261016 do novo anexo é a série consolidada utilizada. O filtro usa o atributo de estado Goiás, seguido de recorte geométrico pelo território derivado dos municípios já disponíveis.
- **Série disponível:** classes de mapeamento 2002, 2004, 2006, 2008, 2010, 2012 e períodos de 2013 a 2026. As classes antigas não são apresentadas como anos civis diretamente comparáveis. Ano/classe PRODES também não é sinônimo da data da imagem.
- **DETER:** alertas em Goiás, separados por data de detecção de 2018 a 2026. O ano mais recente informa a data máxima observada nos registros. Os alertas aparecem em camada própria, desligada inicialmente, e nunca são somados ao ranking PRODES ou classificados como queimadas.
- **Arquivos regionais 2021–2024:** inspecionados e registrados no manifesto, mas não somados à série consolidada, pois duplicariam versões do mesmo produto. O arquivo regional de 2021 também contém alguns registros atribuídos a estados vizinhos.
- **Raster PRODES 2026:** inventariado como produto complementar. Não foi convertido em uma falsa camada de vegetação atual nem acrescentado à área dos vetores. Não é necessário renderizá-lo para cumprir o mapa vetorial da fase 2; a eventual análise raster/vegetação pertence à fase 3.
- **Camadas preservadas:** queimadas de 2025 e janeiro–agosto de 2026, limites das 30 unidades, 246 municípios, infraestrutura e localidades vêm da base anterior. O novo ZIP não fornece substitutos para essas informações.

O manifesto data/generated/cycle2-manifest.json identifica os sete arquivos anexados, hashes SHA-256, decisões, contagens por produto, geometrias reparadas, recortes e exclusões. map/metadata.json vincula as camadas geradas e impact-data.js registra os indicadores e os períodos disponíveis. A fonte anterior tem hash próprio para não atribuir os dados de fogo ao novo ZIP.

## Método e interpretação

Geometrias de origem em SIRGAS 2000 são transformadas para EPSG:4326; cálculos de área usam a mesma projeção equivalente LAEA do sistema anterior. Os eventos são filtrados para Goiás e suas interseções são dissolvidas dentro de cada UC/parque. A área integral do limite fornecido da unidade continua sendo o denominador. Portanto, o indicador descreve eventos de Goiás dentro dos limites disponíveis, não todos os eventos possíveis fora do estado.

Simplificação é utilizada apenas na exibição. O ranking trabalha com as geometrias não simplificadas. O percentual continua entre 0 e 100 e as sobreposições não são contadas duas vezes. A soma dos polígonos não equivale à taxa oficial publicada pelo INPE. A camada DETER é um produto de alertas, distinto do PRODES; ver [INPE/TerraBrasilis](https://terrabrasilis.dpi.inpe.br/faq/).

As métricas combinadas de fogo e desmatamento da base anterior foram anuladas, pois não foram recalculadas para a nova série. A interface do ciclo 2 apresenta os indicadores separados. Ausência de registro não comprova ausência de impacto.

## Roteiro da demonstração

1. Abrir o painel em Monitoramento e apresentar Goiás, UCs/parques e a legenda.
2. Mostrar queimadas de janeiro–agosto de 2026 e PRODES 2026, deixando explícitos os diferentes produtos/períodos.
3. Selecionar PRODES 2021, 2024 e 2026 para demonstrar a atualização da camada.
4. Selecionar “Desmatamento” no ranking e conferir que o período da tabela acompanha o seletor PRODES.
5. Alternar a ordenação entre hectares e percentual; explicar a diferença entre os dois.
6. Clicar no nome de uma UC/parque e conferir localização, destaque e indicadores na janela do mapa.
7. Ativar DETER, selecionar um ano e explicar por que alertas não entram no ranking PRODES.
8. Retornar ao mapa de Goiás; demonstrar municípios e camadas independentes.
9. Navegar no catálogo anterior, aplicar uma busca e abrir os detalhes.
10. Mostrar a metodologia e o manifesto de fontes. Encerrar indicando que previsão e vegetação futura são fase 3, ainda não implementadas.

## Execução

```sh
npm ci
npm run build
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Acessar http://127.0.0.1:8000. No Windows, usar o comando Python disponível na instalação, por exemplo py. O dist entregue já contém Leaflet e dados processados; pode ser servido diretamente sem instalação npm. Internet é necessária apenas para instalar dependências, não para consultar os arquivos locais depois do build.

## Reprodução da importação

São necessários o ZIP anterior e o novo ZIP. Preparar primeiro uma base intermediária com os scripts existentes e gerar a atualização em outro diretório. A rotina de ativação verifica hashes, camadas, IDs e limites dos indicadores antes da cópia, e preserva os dados substituídos em .venv/.

```sh
python -m pip install -r requirements.txt
python scripts/prepare_data.py --source "caminho/files (1).zip" --output-dir .venv/base-ciclo1
python scripts/compute_impact.py --source "caminho/files (1).zip" --output-dir .venv/base-ciclo1
python scripts/prepare_map.py --source "caminho/files (1).zip" --output-dir .venv/base-ciclo1
python scripts/import_cycle2.py --source "caminho/dados ciclo 2.zip" --baseline-source "caminho/files (1).zip" --baseline-dir .venv/base-ciclo1 --output-dir .venv/ciclo2-output
node scripts/activate_cycle2.mjs .venv/ciclo2-output
npm test
python -m unittest discover -s tests -p "test_*.py"
npm run build
```

Usar um diretório de trabalho novo com --work-dir quando mudar o arquivo de origem. A leitura do shapefile consolidado do Cerrado envolve milhões de registros e arquivos de vários gigabytes; a primeira importação pode demorar. Os dados publicados são divididos por período e carregados sob demanda; as classes históricas mais volumosas podem demorar mais no navegador.

## Critérios da fase 2

- Preservar a arquitetura e a navegação existentes.
- Disponibilizar geometrias reais de Goiás com camadas e períodos identificados.
- Apresentar tabela das 30 unidades com cálculo de área e percentual sem dupla contagem.
- Integrar seleção de unidade entre tabela e mapa.
- Separar alertas de observações PRODES e bases novas de bases preservadas.
- Manter consulta tabular em caso de falha do mapa e funcionamento em tela pequena.
- Entregar instruções, fontes e resultado dos testes; o aceite acadêmico é da equipe/professor.

O inventário de 29/10/2026 no roadmap é um registro histórico, anterior a esta atualização. Este documento e o manifesto descrevem a base da entrega atual.

## Resultado da verificação desta entrega

- 6 testes JavaScript e 8 testes Python aprovados; build concluído.
- 370.257 registros PRODES distribuídos em 20 classes/períodos e 12.787 alertas DETER em nove anos, após o filtro e recorte para o território disponível.
- Último período PRODES: 3.395 registros exibidos em 2026. DETER 2026: 1.343 alertas, com data máxima de detecção em 22/10/2026.
- 34.553 registros de queimadas desenhados nos dois períodos. Indicadores de fogo conferidos como idênticos aos anteriores para as 30 unidades.
- Navegador: carregamento de PRODES 2021/2026, ativação DETER, ranking por período, ordenação, seleção tabela–mapa e busca do catálogo conferidos; nenhum erro de console observado.
- Largura móvel de 390 px conferida sem transbordamento horizontal da página. Tabelas mantêm sua rolagem própria.
- A publicação contém aproximadamente 531 MiB, principalmente geometrias históricas. Períodos antigos volumosos exigem mais memória e tempo de carregamento; não foi realizado teste de carga em todos os dispositivos.

O arquivo entrega-ciclo-2.zip, na raiz do projeto, contém a publicação em dist/, este guia, o manifesto e um LEIA-ME.txt de execução. É o pacote de demonstração; o código-fonte e as rotinas de processamento permanecem no projeto. O ZIP bruto anexado e os arquivos temporários não estão nesse pacote.
