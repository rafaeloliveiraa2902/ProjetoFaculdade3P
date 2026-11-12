# Decisões transversais e plano de execução

## Tecnologias: o que existe e o que ainda escolher

As tecnologias futuras abaixo são recomendações de implementação para este projeto. Não foram instaladas nem aprovadas automaticamente por aparecerem neste documento. A escolha final deve considerar domínio da equipe, dados, volume, hospedagem e resultados do piloto.

| Área | Já usado | Proposta de evolução | Condição para decidir |
|---|---|---|---|
| Interface | HTML, CSS, JavaScript em módulos | Manter inicialmente; TypeScript ou framework apenas se a complexidade justificar | Não reescrever o mapa sem ganho concreto de manutenção |
| Mapa | Leaflet 1.9.4 e GeoJSON local | Manter Leaflet; avaliar renderização/tiles para grandes volumes | Medir tempo, memória e quantidade de geometrias/rasters |
| Processamento vetorial | Python, Shapely e pyproj | Acrescentar pandas/GeoPandas quando simplificarem os pipelines | Contratos de dados e prova de conceito |
| Imagens e séries raster | Ainda não implementado | Rasterio/NumPy; xarray se necessário; QGIS para inspeção | Formatos, resolução, memória e tamanho do piloto |
| Banco | Arquivos gerados; sem banco relacional | PostgreSQL/PostGIS para backend geográfico; GeoPackage/Parquet como alternativa de piloto | Concorrência, consultas, infraestrutura e restauração |
| Backend | Não existe API própria | Python com FastAPI e contratos validados | Introduzir quando consultas/volume/atualização exigirem |
| ML inicial | Não há modelos treinados | scikit-learn, regressões e árvores/boosting | Comparar referências simples antes de escolher o modelo |
| Deep learning | Não utilizado | PyTorch e segmentação/redes temporais apenas se necessário | Rótulos, hardware e ganho demonstrável fora do treino |
| Artefatos e experimentos | Git para código; hashes de origem | Manifestos e versões; MLflow/DVC se houver necessidade | Garantir rastreabilidade sem multiplicar ferramentas |
| Testes | node:test e unittest; verificação de navegador separada | Roteiro de navegador versionado e CI; pytest é opção | Preservar os testes úteis existentes |
| Hospedagem | Pasta estática dist/ e prévia local | Frontend estático + API/worker de processamento + armazenamento conforme escolha | Orçamento, público, atualização e tamanho dos dados |
| Processamento agendado | Scripts manuais | Jobs em lote e agendamento; fila apenas se necessário | Treino/geração não devem bloquear consultas |

FastAPI é uma opção de framework Python para uma API, e PostGIS é a referência proposta para o componente espacial de um banco PostgreSQL. Consultar a documentação oficial antes de fixar versões ou detalhes de implantação: [FastAPI](https://fastapi.tiangolo.com/) e [PostGIS](https://postgis.net/documentation/).

## Arquitetura-alvo proposta

Monólito modular organizado em camadas, acompanhado de pipelines de dados e ML. As camadas definem responsabilidades; não exigem um servidor para cada camada.

- **Apresentação:** mapa, catálogo, gráficos, comparadores e relatórios.
- **Aplicação:** coordenação das consultas e casos de uso de histórico/previsões.
- **Domínio:** unidade, ocorrência, cobertura, mudança, horizonte e regras ambientais.
- **Infraestrutura:** banco, armazenamento de arquivos, fontes externas e leitura dos modelos.
- **Pipelines:** ingestão, qualidade, geoprocessamento, treinamento, avaliação e geração de previsões em lote.

Estrutura futura indicativa, sem mover o código atual apenas para antecipar pastas:

```text
frontend/src/             interface, mapas e visualização
backend/app/api/          contratos HTTP, se houver API
backend/app/application/  casos de uso
backend/app/domain/       regras e conceitos ambientais
backend/app/infrastructure/ banco, arquivos e integrações
pipelines/ingestao/       dados brutos e qualidade
pipelines/geoprocessamento/ histórico e mudanças
pipelines/treinamento/    experimentos e avaliação
pipelines/previsao/       geração de produtos
tests/                   regras, integração e interface
docs/                    métodos, arquitetura e operação
```

O modelo treina fora da requisição do usuário. A interface consulta produtos prontos; geração sob demanda, se necessária, roda como trabalho separado. Microsserviços, Kubernetes, aplicativo móvel nativo e login público não são requisitos deste escopo.

## Entidades mínimas do banco e dos artefatos

| Entidade | Campos/conteúdo a definir | Relação principal |
|---|---|---|
| Unidade | ID estável, código oficial, nome, esfera, situação | Possui versões de limite e indicadores |
| Limite da unidade | Geometria, CRS, vigência, fonte, versão | Mantém comparações históricas auditáveis |
| Fonte/importação | Produtor, licença, versão, hash, obtenção, cobertura, validação | Origem de cada produto |
| Ocorrência | Tipo, ID da fonte, data/período, geometria, qualidade | Relacionada espacialmente às unidades |
| Cobertura observada | Célula/grade, data, classe, validade, versão | Base das transições e modelos |
| Indicador | Unidade, período, métrica, valor, denominador, método | Alimenta tabela e gráficos |
| Modelo/execução | Alvo, horizonte, código, dados de treino, parâmetros, métricas | Produz previsões versionadas |
| Previsão | Data de emissão, data-alvo, local, probabilidade/valor, cenário, modelo | Exibida separadamente do observado |
| Artefato raster | Caminho/URL controlado, extensão, CRS, resolução, checksum | Armazena imagens/camadas grandes fora de JSON |

## Ordem de execução e dependências

1. Encerrar aceite do mapa e definir piloto, equipe e critérios (2.8 → 3.1).
2. Inventariar/ampliar dados e construir qualidade/IDs estáveis (3.2 → 3.3).
3. Definir armazenamento e organizar camadas (3.4–3.5); construir histórico de vegetação em paralelo quando os dados estiverem prontos (3.6).
4. Decidir se é necessário classificador próprio de imagens (3.7) e fixar protocolo experimental (3.8).
5. Treinar vegetação quantitativa/espacial (3.9–3.10) e fogo (3.11) com validação independente; essas frentes podem avançar em paralelo se houver equipe.
6. Consolidar horizontes/cenários (3.12), acesso aos produtos (3.13) e interface final (3.14).
7. Executar versionamento e qualidade ao longo do trabalho (3.15–3.16), não apenas no último dia.
8. Finalizar relatórios, apresentações, homologação e expansão validada (3.17–3.18).

**Caminho crítico:** histórico compatível → qualidade → mapas históricos → protocolo experimental → previsão espacial avaliada → integração final. Ter a interface pronta não elimina a dependência de dados e validação científica.

## Pacotes de entrega sugeridos, sem datas inventadas

| Pacote | Resultado demonstrável | Subetapas |
|---|---|---|
| A — Piloto definido | Unidade escolhida, requisitos, fontes e critérios | 3.1–3.2 |
| B — Dados confiáveis | Importação reproduzível, IDs e relatório de qualidade | 3.3–3.4 |
| C — Passado visível | Mapas por ano, perda/ganho e hectares conferidos | 3.5–3.7 |
| D — Experimentos honestos | Cortes temporais/espaciais e referências simples | 3.8 |
| E — Vegetação futura | Previsão de quantidade e mapa de transições avaliados | 3.9–3.10 |
| F — Fogo futuro | Risco de ocorrência avaliado por período/local | 3.11 |
| G — Produto integrado | Cenários suportados, consultas e dashboard final | 3.12–3.14 |
| H — Entrega reproduzível | Modelos versionados, testes, relatório e homologação | 3.15–3.18 |

Cada pacote deve passar por implementar → verificar → demonstrar → registrar pendências. Os pacotes não têm a mesma duração. Datas e número de ciclos dependem do calendário, carga horária e acesso aos dados; não há estimativa confiável desses fatores no histórico disponível.

## Critérios de validação dos modelos

| Produto | Comparação mínima | Métricas propostas | Erro que precisamos evitar |
|---|---|---|---|
| Vegetação em hectares | Último valor e tendência simples | MAE/RMSE, viés, erro por unidade e horizonte | Acertar média geral e errar unidades importantes |
| Vegetação espacial futura | Persistência do último mapa | IoU/F1 de perda/ganho, precisão/recall, calibração e área agregada | Acertar hectares e colocar a perda no lugar errado |
| Risco de fogo | Frequência histórica/sazonal | PR-AUC, precisão, recall, Brier/calibração e falsos alarmes | Alta acurácia obtida prevendo “sem fogo” em quase tudo |
| Classificador de imagens, se usado | Produto de referência e amostras independentes | Matriz de confusão, IoU/F1 por classe e erro de área | Treinar e validar com o mesmo rótulo automático sem conferir seus erros |

Valores-alvo serão definidos em 3.1 com justificativa e revistos apenas de modo transparente. Nenhuma taxa de acerto é prometida. A avaliação deve respeitar tempo e espaço; consultar a referência de [validação do scikit-learn](https://scikit-learn.org/stable/modules/cross_validation.html). Para dados de múltiplas células por data, os cortes serão definidos por período global e grupos espaciais, não por divisão aleatória de pixels vizinhos.

## Riscos concretos e respostas planejadas

| Risco | Consequência | Resposta / etapa |
|---|---|---|
| Poucos anos comparáveis | Modelo aprende variação pontual sem generalizar | Ampliar histórico e reduzir complexidade/horizonte; 3.2 e 3.8 |
| Comparar ano parcial com completo | Conclusão falsa de aumento ou redução | Períodos equivalentes e cobertura explícita; 3.2–3.6 |
| Mudança de coleção, sensor ou fronteira | Alteração aparente sem mudança ambiental | Harmonização e versões dos limites; 3.3–3.6 |
| Nuvens ou dados ausentes viram “sem vegetação” | Perda artificial | Máscara de validade e avaliação da cobertura; 3.6 |
| Vazamento temporal/espacial | Métricas artificialmente altas | Testes futuros reservados e blocos espaciais; 3.8 |
| Supor diminuição obrigatória | Modelo ignora recuperação e estabilidade | Alvos de perda/ganho/permanência; 3.6–3.10 |
| Poucas amostras independentes | Rede complexa memoriza dados | Baselines, modelos simples e análise de dependência; 3.8–3.11 |
| GeoJSON/imagens muito grandes | Navegador lento ou travado | Recorte, níveis de detalhe, tiles/rasters apropriados; 3.13 e 3.16 |
| Entradas futuras desconhecidas | Cenário apresentado como certeza | Hipóteses explícitas e horizontes avaliados; 3.12 |
| Mudança no regime de fogo/uso do solo | Modelo perde qualidade com o tempo | Monitorar desempenho, versão e reavaliação; 3.15 |
| Escopo maior que o prazo acadêmico | Entrega incompleta | Validar primeiro o piloto e negociar expansão sem esconder pendências; 3.1 e 3.18 |

## Checklist final de conclusão da fase 3

- [ ] Requisitos, piloto, horizonte, grade e fontes definidos e documentados.
- [ ] Dados históricos ampliados, rastreáveis e com controles de qualidade.
- [ ] IDs estáveis e armazenamento escolhido; backup/recuperação quando aplicável.
- [ ] Responsabilidades de apresentação, aplicação, domínio e infraestrutura separadas.
- [ ] Mapas históricos de vegetação e perdas/ganhos conferidos.
- [ ] Modelo de vegetação futura avaliado em quantidade e localização.
- [ ] Modelo de risco de fogo avaliado e comparado a referência simples.
- [ ] Ausência de vazamento entre treino/validação/teste demonstrada pelo protocolo.
- [ ] Incertezas, qualidade, versões e períodos identificados na interface.
- [ ] Mapas, tabelas, gráficos e relatórios coerentes entre si.
- [ ] Fluxo reproduzível, testes de regressão e limites de desempenho registrados.
- [ ] Documentação, apresentação acadêmica e aceite final concluídos.
- [ ] Expansão além do piloto condicionada à cobertura e validação, sem previsões inventadas para áreas sem suporte.

## Evidências internas utilizadas

- README.md, docs/architecture.md e o roadmap anterior, confrontados com o histórico da conversa.
- src/index.html e os módulos catalog.js, monitoring.js e map.js.
- src/js/data/records.js e monitoring.js; configurações e utilitários compartilhados.
- scripts/prepare_data.py, compute_impact.py, prepare_map.py, source_data.py e build.mjs.
- data/generated/data.js, impact-data.js e map/metadata.json; contagens verificadas nesta revisão.
- tests/records.test.js, monitoring.test.js, test_impact.py e test_map.py.
- package.json, requirements.txt e estrutura de apresentações existente.
- Registro no chat das verificações de navegador e resultados dos testes durante a implementação do mapa; não substitui uma nova execução em uma futura versão.

## Fontes externas consultadas para orientar as propostas

- [MapBiomas — metodologia e produtos](https://brasil.mapbiomas.org/iniciativas-e-produtos/metodologia-mapbiomas/visao-geral/): mapas anuais de cobertura/uso e materiais de método/validação para avaliar como fonte histórica. Os dados ainda precisam ser selecionados e integrados.
- [INPE — dados abertos](https://www.terrabrasilis.dpi.inpe.br/queimadas/portal/pages/secao_downloads/dados-abertos/index.html): produtos de fogo e meteorologia para avaliar na ampliação do histórico. Frequências e horizontes de cada produto devem ser respeitados.
- [scikit-learn — validação de modelos](https://scikit-learn.org/stable/modules/cross_validation.html): referência técnica para a avaliação; o protocolo espaço-temporal será específico do projeto.
- [FastAPI — documentação](https://fastapi.tiangolo.com/): opção para implementar a API Python, ainda não adotada.
- [PostGIS — documentação](https://postgis.net/documentation/): opção para consultas e persistência geoespacial, ainda não adotada.
- [Leaflet — referência](https://leafletjs.com/reference.html): biblioteca já utilizada no mapa atual.

## Próximas decisões, sem impedir este planejamento

Definir prazo acadêmico e disponibilidade da equipe; escolher unidade piloto; confirmar acesso às novas fontes; escolher a grade e os horizontes; fixar limites de erro e critérios de sucesso; decidir armazenamento/hospedagem e orçamento; unificar nome público do projeto. Essas decisões devem ser resolvidas no início da fase 3, com os dados disponíveis, e não por promessa de precisão ou prazo sem evidência.
