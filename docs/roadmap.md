<!-- Gerado por scripts/build-roadmap.mjs; editar docs/planejamento/*.md. -->

# Roadmap completo — ConservaGO / Cerrado em Lista

Planejamento revisado em 29/10/2026, com base no histórico deste chat, no código, nos testes, nas bases geradas e na documentação do projeto. Os status descrevem o que existe no repositório e as verificações relatadas na implementação; não são uma nova certificação de todos os testes nesta revisão.

**Onde estamos:** fase 2, com o marco do mapa interativo entregue. A fase 1 estabeleceu os dados e o dashboard. A fase 3 será a evolução até o sistema completo: base histórica ampliada, arquitetura em camadas, análise temporal e machine learning para previsão de fogo e da distribuição futura da vegetação.

**Mudança de escopo aprovada nesta conversa:** a previsão espacial da vegetação futura passa a ser obrigatória na fase 3. Identificar vegetação nas imagens é uma etapa de preparação; não substitui prever onde ela poderá permanecer, diminuir ou se recuperar.

**Leitura dos status:** “Entregue” significa implementado ou documentado; “Planejado” significa trabalho futuro; “Decisão pendente” significa proposta ainda não escolhida. A divisão entre fases 1 e 2 é retrospectiva e organiza o trabalho já feito, não estabelece datas fictícias para cada tarefa. Não há percentual global de conclusão, prazo de entrega ou equipe definidos.

## Visão em três colunas

| Fase 1 — Dados e dashboard | Fase 2 — Mapa e análise espacial | Fase 3 — Sistema completo e previsões |
|---|---|---|
| Entregue: acervo inicial, preparação de dados, consulta, filtros, detalhes, indicadores e organização modular. | Marco entregue: mapa de Goiás, ocorrências, limites, seleção de períodos e ranking conectado ao mapa. Estamos aqui. | Planejado: ampliar histórico, estruturar banco e backend conforme necessidade, analisar vegetação e validar as duas previsões com ML. |
| Pergunta respondida: o que existe nas bases e quanto cada unidade foi atingida? | Pergunta respondida: onde estão os eventos e quais unidades têm mais área atingida? | Pergunta a responder: como a vegetação poderá mudar e qual o risco de fogo em períodos futuros? |
| Resultado: painel consultável e processamento reproduzível. | Resultado: painel geográfico com mapa e tabela integrados. | Resultado: plataforma que distingue observações, estimativas e cenários futuros, com desempenho e limitações documentados. |

## Inventário real de partida

| Base atual | Registros tabulares | Cobertura / uso |
|---|---|---|
| Unidades estaduais | 27 | Cadastro, limites e indicadores |
| Parques nacionais federais | 3 | Cadastro, limites e indicadores |
| Limites municipais | 246 | Municípios e contorno estadual derivado |
| Infraestrutura de UCs | 67 | Consulta tabular; não é uma camada de polígonos utilizável no mapa atual |
| Sedes e localidades | 663 | Consulta tabular; não é uma camada de polígonos utilizável no mapa atual |
| Queimadas de 2025 | 24.226 | Ano completo informado; 24.225 registros desenhados no mapa |
| Queimadas de 2026 | 10.328 | Janeiro a agosto, período incompleto |
| Desmatamento PRODES de 2025 | 3.804 | Único período de desmatamento atualmente disponível |

O registro de queimadas de 2025 com fid 15384 não forma área após reparo e foi excluído apenas do desenho. O mapa tem 30 unidades no conjunto fornecido; isso não significa todas as áreas protegidas existentes em Goiás. O contorno de Goiás é derivado da união dos municípios fornecidos. A origem imediata é o ZIP entregue ao projeto; a documentação dos produtores originais ainda deve ser aprofundada.

Hoje não existe banco relacional: “base de dados” significa arquivos CSV processados em JavaScript e GeoJSON. Também não existem API própria, atualização automática, modelo treinado, mapa de vegetação histórica, previsão ou autenticação de usuários. As apresentações ConservaGO_Ciclo_1.pptx e ConservaGO_Ciclo_1_com_Oslo.pptx existem em apresentacao/; sua presença é registrada, sem presumir que seu conteúdo prove requisitos ou entregas adicionais.

## Resultado final esperado pelo usuário

Selecionar uma UC/parque → consultar os eventos e a vegetação observada por ano → comparar perda, ganho e permanência → escolher um horizonte futuro suportado → visualizar probabilidades e cenário de cobertura vegetal → consultar risco de fogo → abrir um relatório com dados, versão do modelo, desempenho e incertezas.

A área legal da unidade permanece separada da vegetação dentro dela. O sistema deverá permitir observar redução, estabilidade ou recuperação, sem assumir que toda vegetação necessariamente diminui. Um mapa previsto é uma estimativa avaliada, não uma prova do futuro.


---

# Fase 1 — Conseguir os dados e construir o dashboard

**Status: entregue no escopo inicial.** Objetivo: transformar os arquivos recebidos em um painel de consulta compreensível e funcional. A ampliação histórica fica na fase 3.

## 1.1 — Delimitação do problema

**Status:** entregue como direção do projeto.

- Focar dados ambientais de Goiás e impactos em unidades de conservação e parques nacionais.
- Organizar a consulta de queimadas, desmatamento, território e cadastros.
- Definir hectares e percentual atingido como indicadores distintos.
- Registrar que queimadas não equivalem automaticamente a perda permanente de vegetação.
- Manter a identidade ConservaGO nos materiais do projeto e Cerrado em Lista na interface atual; unificar o nome público continua uma decisão de produto.

**Entrega:** escopo inicial de consulta ambiental. **Evidência:** README, textos metodológicos e interface. **Limite:** o problema preditivo ainda não foi implementado.

## 1.2 — Recebimento e inventário do acervo

**Status:** entregue para o arquivo original.

- Ler o ZIP externo contendo csv_banco_de_dados.zip.
- Identificar oito bases, seus campos, quantidades e períodos.
- Reconhecer 27 unidades estaduais e três parques federais disponíveis.
- Identificar polígonos WKT e coordenadas no sistema EPSG:4326.
- Separar bases cadastrais, territoriais e de eventos.
- Distinguir dados de 2025 de queimadas de janeiro a agosto de 2026.

**Entrega:** inventário utilizado no painel. **Evidência:** data/generated/data.js e scripts/prepare_data.py. **Pendência transferida:** catalogar fonte oficial, licença, resolução e histórico de cada produto ao ampliar o acervo.

## 1.3 — Preparação dos dados tabulares

**Status:** entregue.

- Ler CSVs com suporte a arquivos grandes e codificação UTF-8 com BOM.
- Aplicar tentativa de correção de caracteres em textos com problemas de codificação.
- Retirar poligono_wkt do conjunto usado pelas listagens para não repetir geometrias grandes.
- Compactar registros em fields e rows, preservando os campos originais para os detalhes.
- Gerar data.js e escapar caracteres necessários ao conteúdo incorporado em JavaScript.
- Receber caminhos de origem e saída por argumentos, removendo dependência do diretório pessoal do desenvolvedor.

**Entrega:** comando reproduzível de preparação. **Evidência:** scripts/prepare_data.py e scripts/source_data.py. **Tecnologia usada:** Python e biblioteca padrão. **Limite:** isso não substitui um pipeline completo de qualidade dos dados.

## 1.4 — Dashboard e navegação

**Status:** entregue.

- Criar navegação entre monitoramento, unidades estaduais, parques, infraestrutura, municípios e localidades.
- Exibir títulos, descrições e identificação da base consultada.
- Mostrar totais de registros e indicadores contextuais nas consultas tabulares.
- Exibir campos adequados ao tipo de base: área, população, classificação, localização e período.
- Manter layout responsivo, navegação por teclado, rótulos e link para pular ao conteúdo.
- Informar que os dados são estáticos e não têm atualização automática.

**Entrega:** painel funcional no navegador. **Evidência:** src/index.html, features/catalog.js e styles/. **Tecnologias usadas:** HTML, CSS e JavaScript nativo.

## 1.5 — Busca, filtros e detalhes

**Status:** entregue.

- Buscar textos sem diferenciar maiúsculas/minúsculas e acentos.
- Filtrar por município, região, unidade ou grupo, conforme a base.
- Ordenar por nome, área, população ou período quando aplicável.
- Paginar os resultados e permitir alterar a quantidade por página.
- Exibir estado vazio e opção para limpar filtros.
- Abrir detalhes com rótulos legíveis para campos originais.
- Escapar conteúdo dinâmico antes de inseri-lo no HTML.
- Manter integração opcional de ferramentas de consulta via document.modelContext nos navegadores que a suportam.

**Entrega:** exploração tabular utilizável. **Evidência:** features/catalog.js, data/records.js e config/field-labels.js. **Critério atendido:** fluxos de consulta verificados no navegador no histórico da implementação.

## 1.6 — Cálculo de impacto ambiental

**Status:** entregue.

- Ler polígonos dos eventos e limites das unidades.
- Reparar geometrias inválidas quando possível.
- Projetar para LAEA equivalente, centrada em latitude -15 e longitude -49, para calcular áreas.
- Usar índice espacial para localizar candidatos à interseção.
- Recortar eventos no limite da unidade e unir sobreposições para evitar dupla contagem.
- Calcular hectares atingidos e percentual sobre a área geográfica da unidade.
- Produzir resultados de queimadas para 2025 e 2026, e desmatamento para 2025.
- Calcular também a união de fogo e desmatamento de 2025 no processamento, sem confundir esse resultado com a simples soma dos dois.
- Guardar fórmula, projeção, reparos e hash SHA-256 da origem no produto gerado.

**Entrega:** impact-data.js e ranking inicial. **Tecnologias usadas:** Shapely e pyproj. **Evidência:** scripts/compute_impact.py. **Critério:** casos sintéticos verificam sobreposições, recorte, ausência de interseção, cobertura completa e união dos indicadores.

## 1.7 — Organização modular e processo de build

**Status:** entregue como primeira organização arquitetural.

- Separar código editável em src/, dados gerados em data/generated/ e publicação em dist/.
- Isolar configurações, adaptação de registros, funcionalidades e utilitários.
- Inicializar módulos explicitamente em main.js, evitando dependências implícitas entre funções globais.
- Centralizar nomes das bases e rótulos dos campos.
- Criar package.json, comandos de build/testes e requirements.txt.
- Manter código Python de processamento fora da interface.
- Preservar alterações existentes durante a reorganização.
- Documentar que dist/ é gerado e não deve ser editado manualmente.

**Entrega:** aplicação estática modular; não é ainda o backend em camadas. **Evidência:** src/js/, scripts/build.mjs e docs/architecture.md. **Tecnologia usada:** Node.js para copiar/organizar os arquivos de publicação.

## 1.8 — Documentação, validação e marco de encerramento

**Status:** entregue no escopo inicial.

- Criar README com execução, preparação dos dados, testes e limitações.
- Documentar arquitetura e metodologia dos indicadores.
- Criar testes de adaptação de registros, normalização da busca e escape de conteúdo.
- Manter testes geoespaciais e verificar a geração de dist/.
- Conferir navegação, busca, detalhes e monitoramento no navegador.
- Preservar apresentações acadêmicas existentes e iniciar o planejamento evolutivo.

**Marco F1:** outra pessoa consegue servir o painel por HTTP e consultar os dados fornecidos seguindo a documentação. **Não implica:** banco histórico, mapa temporal ou modelo de ML. **Passagem para F2:** usar as geometrias reais para transformar a consulta em exploração espacial.


---

# Fase 2 — Construir o mapa e conectar a análise espacial

**Status: marco funcional entregue; fase atual do projeto.** O mapa solicitado e a tabela estão implementados. A ampliação de dados e as previsões pertencem à fase 3; não estão ocultas no status desta fase.

## 2.1 — Confirmar a viabilidade do mapa

**Status:** entregue.

- Verificar que os arquivos publicados anteriormente não continham os polígonos para desenhar todas as áreas.
- Recuperar o ZIP original e inspecionar os campos poligono_wkt.
- Confirmar limites de 246 municípios, 30 unidades e polígonos dos três conjuntos de eventos.
- Identificar bases com geometrias vazias, sem inventar localizações para infraestrutura ou localidades.
- Escolher usar arquivos locais, preservando a operação sem um serviço externo de mapa-base.

**Entrega:** comprovação de que o acervo atual permite o mapa. **Dependência:** dados e indicadores de F1. **Limite:** não existem imagens de satélite ou vegetação histórica integradas.

## 2.2 — Gerar as camadas geográficas

**Status:** entregue.

- Criar scripts/prepare_map.py com argumentos de origem e destino.
- Exportar GeoJSON de municípios, unidades, queimadas e desmatamento.
- Derivar o contorno de Goiás pela união dos municípios do conjunto fornecido.
- Simplificar somente a geometria de exibição: 0,0001 grau para eventos/unidades e 0,0004 grau para municípios/estado.
- Preservar o processamento original de área usado na tabela.
- Manter IDs compatíveis entre os polígonos e os indicadores.
- Gravar contagens, hash de origem, tolerâncias e exclusões em metadata.json.

**Entrega:** arquivos em data/generated/map/. **Tecnologias usadas:** Python, Shapely e GeoJSON. **Limite conhecido:** os IDs atuais incluem a posição da linha e precisam ser substituídos por IDs estáveis antes de novas importações independentes.

## 2.3 — Implementar o mapa de Goiás

**Status:** entregue.

- Integrar Leaflet 1.9.4 como dependência local.
- Copiar biblioteca e licença para dist/vendor/leaflet/ no build.
- Exibir contorno estadual, unidades e ocorrências com cores e legenda.
- Permitir zoom, arraste, escala e retorno ao enquadramento de Goiás.
- Oferecer camadas independentes de queimadas, desmatamento, unidades e municípios.
- Exibir informações do evento ou unidade em uma janela ao clicar.
- Carregar arquivos sob demanda e reutilizar dados já carregados na sessão.

**Entrega:** mapa vetorial interativo. **Evidência:** features/map.js e styles/map.css. **Limite:** não é mapa de ruas, imagem de satélite ou previsão.

## 2.4 — Controlar períodos e evitar comparações incorretas

**Status:** entregue.

- Selecionar queimadas de 2025 ou janeiro a agosto de 2026.
- Manter desmatamento explicitamente identificado como PRODES 2025.
- Atualizar mapa e indicador de fogo ao mudar o ano selecionado.
- Informar que ano completo e período parcial não são diretamente comparáveis.
- Informar contagens de registros das camadas carregadas.
- Distinguir os controles das camadas visíveis do indicador selecionado para ordenar a tabela.

**Entrega:** exploração dos períodos existentes sem simular disponibilidade de 2026 para desmatamento. **Pendência de F3:** criar séries compatíveis e filtros temporais mais amplos com a expansão do histórico.

## 2.5 — Integrar mapa e tabela das unidades

**Status:** entregue.

- Apresentar as 30 unidades com posição, nome, esfera, hectares atingidos, percentual e área total.
- Ordenar por hectares atingidos ou percentual, de forma decrescente e com desempate pelo nome.
- Diferenciar “maior área atingida” de “maior proporção atingida”.
- Permitir clicar no nome para aproximar o mapa e destacar o limite da unidade.
- Destacar a linha correspondente quando a unidade é selecionada no mapa.
- Mostrar, na janela da unidade, indicadores dos períodos disponíveis.
- Manter todas as unidades na tabela, sem filtrá-las pelo enquadramento ou pelas camadas ocultas.
- Comunicar seleção por evento unit:select e centralizar ordenação em data/monitoring.js.

**Entrega:** leitura conjunta do ranking e da localização espacial. **Critério:** seleção, destaque e retorno ao estado inteiro verificados no navegador.

## 2.6 — Corrigir geometrias e representações enganosas

**Status:** entregue para os casos encontrados.

- Identificar pontos e linhas que surgiram do reparo de polígonos inválidos.
- Remover esses fragmentos do desenho para evitar alfinetes azuis automáticos sem significado ambiental.
- Excluir do desenho o registro de 2025 fid 15384, sem área de polígono válida.
- Registrar 24.225 polígonos desenhados em 2025, 10.328 em 2026 e 3.804 de desmatamento.
- Explicar a exclusão e a simplificação na documentação e na interface.
- Manter distintas as contagens tabulares de origem e as contagens de geometrias desenhadas.

**Entrega:** camadas sem os marcadores espúrios identificados. **Critério:** teste impede que componentes colapsados virem marcadores e preserva pequenos polígonos válidos. **Não significa:** todos os dados estarem livres de erros cartográficos de origem.

## 2.7 — Testar integração, falhas e uso em celular

**Status:** entregue no conjunto de verificações executado.

- Conferir que mapa e indicadores compartilham o mesmo hash de origem e os mesmos IDs de unidade.
- Testar hectares versus percentual, troca de ano, ausência de indicador e desempates.
- Verificar ligar/desligar camadas, seleção de unidade, retorno ao estado e navegação de outras telas.
- Corrigir enquadramento ao redimensionar a página para celular.
- Verificar ausência de rolagem horizontal da página; a tabela larga tem sua própria rolagem acessível.
- Testar falha no carregamento dos arquivos do mapa sem impedir a consulta da tabela.
- Conferir ausência de erros de execução nos fluxos exercitados no navegador.

**Entrega:** quatro testes JavaScript e cinco testes Python no total atual, aprovados na entrega anterior; verificações de navegador adicionais foram executadas separadamente. **Limite:** o roteiro de navegador não está integrado ao comando npm test nem a uma rotina de CI.

## 2.8 — Consolidar a entrega e passar para a fase 3

**Status:** implementação e documentação entregues; aceite acadêmico/equipe ainda não registrado.

- Gerar dist/ com os arquivos locais e abrir a prévia HTTP do projeto.
- Atualizar README, arquitetura e roadmap com o mapa implementado.
- Registrar que a interface ainda é estática e não executa ML.
- Manter o código atual como base da evolução, sem reescrever o mapa apenas para trocar de arquitetura.
- Revisar com a equipe/professor a legenda, períodos, ranking e significado dos indicadores.
- Selecionar a primeira unidade piloto e aprovar os critérios de escolha antes da fase 3.

**Marco F2:** demonstrar mapa de Goiás, camadas reais, consulta por período e seleção integrada à tabela. **Aceite pendente:** validação externa da entrega e definição de calendário, responsáveis e piloto. **Próxima tarefa técnica:** inventário histórico e contrato dos dados ampliados em 3.1–3.2.


---

# Fase 3 — Ampliar a base e concluir o sistema com machine learning

**Status: planejada.** Esta fase contém subetapas porque concentra a maior parte do trabalho futuro. Seu encerramento exige as duas frentes preditivas integradas e avaliadas: fogo e distribuição futura da vegetação. Um classificador de imagens ou um gráfico de tendência isolado não cumpre todo esse objetivo.

## 3.1 — Fixar requisitos, piloto e critérios de sucesso

**Prioridade:** obrigatória; começar aqui. **Depende:** marco F2.

- Escolher uma UC/parque piloto pela qualidade do histórico, disponibilidade de imagens, eventos registrados e viabilidade de validação; não apenas por notoriedade.
- Definir usuários, perguntas prioritárias e roteiro de demonstração acadêmica.
- Fixar a área de estudo, resolução geográfica, frequência temporal e período histórico.
- Definir “área verde”: preferir cobertura vegetal nativa com classes explícitas, distinguindo floresta, savana, campo, plantação e pastagem quando os dados permitirem.
- Fixar um horizonte inicial suportável: proposta de um ano à frente para vegetação e um mês à frente para fogo, sujeitos à disponibilidade e avaliação dos dados.
- Definir o que será observado, estimado e previsto em cada tela.
- Acordar limites de erro, desempenho mínimo, custos e tempo de resposta antes de olhar o teste final.
- Definir responsáveis por dados, geoprocessamento, ML, backend, interface e validação; uma pessoa pode acumular papéis.

**Entrega:** especificação do piloto e critérios mensuráveis de aceite. **Pronto quando:** objetivos, recorte, alvos, horizontes e avaliadores estiverem registrados. **Tecnologia:** documento e decisões arquiteturais; não depende de instalar uma ferramenta nova.

## 3.2 — Ampliar e catalogar o histórico

**Prioridade:** obrigatória. **Depende:** 3.1.

- Buscar vários anos de queimadas, áreas queimadas e desmatamento; documentar a diferença entre foco de calor, cicatriz queimada e polígono de desmatamento.
- Obter séries anuais comparáveis de cobertura/uso da terra para medir vegetação e suas transições.
- Avaliar imagens de satélite para conferência e, se necessário, classificação própria.
- Avaliar chuva, temperatura, umidade e seca; acrescentar relevo, solo ou proximidade de acessos somente quando houver justificativa e disponibilidade.
- Verificar dados oficiais dos limites das unidades, identificadores, datas de vigência e alterações de fronteira.
- Registrar produtor, endereço, coleção/versão, licença, período, resolução, CRS, data de obtenção e restrições.
- Criar uma matriz ano × unidade × produto para visualizar lacunas.
- Definir um intervalo histórico comum; meta inicial de pesquisa de dez ou mais anos quando disponível, sem tratar esse número como garantia de suficiência.
- Separar ano parcial de ano completo e recusar a combinação silenciosa de produtos metodologicamente incompatíveis.

**Entrega:** catálogo de fontes e acervo bruto versionado por referência/hash. **Pronto quando:** existirem períodos suficientes para treino, validação e teste temporal, além de dados de referência para o piloto. **Fontes candidatas:** MapBiomas, INPE/PRODES, meteorologia e limites oficiais; nenhuma nova fonte está integrada apenas por constar neste plano.

## 3.3 — Criar o pipeline de qualidade e importação

**Prioridade:** obrigatória. **Depende:** 3.2.

- Separar dados brutos imutáveis, dados tratados e produtos prontos para o sistema.
- Definir esquema por produto: tipos, campos obrigatórios, unidades de medida, datas e valores ausentes.
- Criar IDs estáveis, substituindo a dependência da ordem das linhas; usar códigos oficiais quando confiáveis e manter uma tabela de correspondência.
- Validar geometrias, coordenadas, áreas, datas, duplicatas e vínculos com municípios/unidades.
- Registrar reparos e colocar registros inválidos em quarentena, sem descartes silenciosos.
- Diferenciar zero observado de dado ausente, nuvem, cobertura incompleta e não detecção.
- Construir importação idempotente: importar a mesma versão novamente não pode duplicar registros.
- Rastrear cada produto até a versão do dado bruto, parâmetros e código que o geraram.
- Testar pequenas amostras antes de processar Goiás inteiro; medir duração, memória e tamanho dos arquivos.

**Entrega:** pipeline de importação com relatório de qualidade. **Pronto quando:** uma importação puder ser repetida e auditada, com falhas e exclusões identificadas. **Tecnologias sugeridas:** Python, pandas/GeoPandas, Shapely e pyproj; avaliar Rasterio para imagens.

## 3.4 — Estruturar persistência e modelo de dados

**Prioridade:** obrigatória para definir o armazenamento; servidor de banco conforme volume e uso. **Depende:** 3.2–3.3.

- Modelar unidades, versões de limites, municípios, fontes, importações, eventos e indicadores por período.
- Modelar observações de cobertura vegetal por célula/data e referências aos rasters de origem.
- Modelar execuções de treinamento, versões dos modelos, previsões, horizonte, cenário e métricas.
- Usar chaves, restrições e índices para impedir associações e datas inválidas.
- Evitar armazenar grandes imagens como JSON; guardar arquivos raster e metadados de localização/acesso.
- Definir retenção, backups, restauração, ambiente de desenvolvimento e migrações de esquema.
- Comparar PostgreSQL/PostGIS para consultas geográficas multiusuário com GeoPackage/Parquet no piloto local.
- Se escolher banco, medir consultas de interseção, período e unidade com a carga esperada antes de confirmar a decisão.

**Entrega:** modelo entidade-relacionamento, dicionário e decisão de armazenamento. **Pronto quando:** um registro puder ser rastreado e consultado sem ambiguidade, e houver procedimento testado de recuperação. **Decisão pendente:** PostgreSQL/PostGIS é a recomendação para a aplicação com backend, não uma dependência já instalada.

## 3.5 — Evoluir para monólito modular em camadas

**Prioridade:** obrigatória para organizar a evolução; evitar reescrita sem necessidade. **Depende:** 3.1; contratos amadurecem em 3.3–3.4.

- Manter apresentação: mapa, filtros, tabelas, gráficos e ações do usuário.
- Criar aplicação: casos de uso como consultar histórico, comparar cobertura e recuperar uma previsão.
- Criar domínio: conceitos e regras ambientais independentes do banco e da interface.
- Criar infraestrutura: leitores de fontes, repositórios, banco, arquivos e carregamento dos modelos.
- Separar módulos de catálogo, ocorrências, vegetação e previsões dentro dessa organização.
- Definir contratos de entrada/saída, tratamento de erros e valores indisponíveis.
- Preservar testes e compatibilidade dos indicadores durante a migração.
- Manter ingestão, treinamento e geração em lote fora do processo de renderização do navegador.

**Entrega:** estrutura evolutiva com responsabilidades e dependências documentadas. **Pronto quando:** trocar a forma de armazenamento não exigir reescrever as regras ambientais. **Não exige:** vários servidores ou microsserviços.

## 3.6 — Construir o histórico real da vegetação

**Prioridade:** obrigatória antes da previsão. **Depende:** 3.2–3.3.

- Selecionar classes de cobertura adequadas ao Cerrado e uma coleção compatível ao longo dos anos.
- Alinhar projeção, grade, resolução, extensão e calendário; usar reamostragem adequada a classes categóricas.
- Tratar nuvens, sombras, ausência de dados, diferenças sazonais e mudanças de sensor/produto.
- Adotar limites fixos para uma comparação principal e explicar mudanças legais separadamente.
- Calcular hectares e percentuais por classe, ano e unidade, com área válida observada como parte dos metadados.
- Produzir mapas de perda, ganho e permanência e matrizes de transição entre classes.
- Calcular recorrência de fogo e mudanças de vegetação como fenômenos separados; correlação não demonstra causalidade.
- Inspecionar visualmente amostras de mudanças e conferir resultados com produtos de referência.

**Entrega:** série histórica de vegetação e mapas de mudança observada. **Pronto quando:** diferenças reais puderem ser distinguidas de lacunas e artefatos de processamento. **Tecnologias sugeridas:** Rasterio/NumPy, GeoPandas, Shapely e QGIS para inspeção.

## 3.7 — Classificar vegetação em imagens, quando necessário

**Prioridade:** condicional; a previsão futura é obrigatória, um classificador próprio de imagens depende da necessidade. **Depende:** 3.6.

- Verificar se produtos de cobertura existentes atendem ao objetivo; evitar treinar outro classificador apenas para dizer que há IA.
- Se não atenderem, definir classes, imagens, bandas e índices espectrais justificáveis.
- Selecionar amostras rotuladas e separar regiões/datas para treino e avaliação.
- Se usar mapas automáticos como rótulos, registrar seus erros e reservar amostras revisadas independentemente.
- Começar com um classificador de pixels por árvores; avaliar segmentação com rede neural somente se houver volume de rótulos, hardware e ganho demonstrável.
- Medir matriz de confusão, IoU/F1 por classe e erro de área em hectares.
- Propagar ou comunicar o erro de classificação ao interpretar mudanças e alimentar previsões.

**Entrega:** cobertura observada estimada, validada e versionada, ou decisão documentada de usar um produto externo validado. **Pronto quando:** a qualidade do histórico for suficiente para o objetivo e seus limites forem conhecidos. **Tecnologias candidatas:** scikit-learn; PyTorch apenas em experimento justificado.

## 3.8 — Preparar os experimentos sem vazamento de informação

**Prioridade:** obrigatória para os dois modelos. **Depende:** 3.3 e 3.6.

- Definir a unidade amostral: célula × ano para vegetação e célula × mês para fogo como ponto de partida.
- Escolher a grade a partir da resolução confiável dos dados, não da aparência desejada do mapa.
- Separar períodos antigos para treino, intermediários para validação e finais para teste reservado.
- Fazer cortes por datas globais, mantendo todas as células do mesmo período no lado correto do corte; aplicar um divisor temporal genérico sobre linhas misturadas não é suficiente.
- Avaliar blocos espaciais separados e regiões de amortecimento quando a dependência entre vizinhos puder inflar o resultado.
- Ajustar normalização, preenchimento, seleção de variáveis e hiperparâmetros apenas no treino/validação.
- Documentar o que seria conhecido na data de cada previsão; impedir uso de chuva futura observada, mapas posteriores ou revisões indevidas como entrada antecipada.
- Executar retroprevisões com várias datas de corte e controlar sementes, versões, parâmetros e recursos usados.
- Reservar o teste final para avaliação; novas escolhas após vê-lo exigem um novo período de avaliação ou a declaração da limitação.

**Entrega:** protocolo experimental reproduzível. **Pronto quando:** cada resultado tiver recorte temporal e espacial verificável. **Base metodológica:** validação temporal e espacial planejada para este conjunto; consultar a documentação de validação do scikit-learn nas referências.

## 3.9 — ML para prever a quantidade de vegetação futura

**Prioridade:** obrigatória, mas insuficiente sozinha para a entrega espacial. **Depende:** 3.6 e 3.8.

- Definir alvo numérico: hectares de vegetação ou variação de hectares em um horizonte fixo.
- Usar histórico de cobertura, perdas, ganhos, recorrência de fogo e variáveis adicionais disponíveis antes da previsão.
- Não restringir o aprendizado a perdas: incluir estabilidade e recuperação.
- Criar referências simples: manter o último valor e extrapolar uma tendência histórica calculada só no treino.
- Comparar regressão regularizada e modelos de árvores/boosting; escolher pelo desempenho fora do treino e viabilidade de manutenção.
- Evitar treinar um modelo complexo com apenas 30 totais de unidades; avaliar séries/células e dependência entre amostras.
- Medir MAE/RMSE em hectares, erro por unidade, viés e desempenho por horizonte; evitar percentual de erro que explode perto de zero.
- Verificar limites físicos: área prevista entre zero e a área válida da unidade.
- Estimar intervalos com método apropriado e testar sua cobertura; não desenhar margens arbitrárias.

**Entrega:** previsão numérica por unidade/horizonte com comparação às referências. **Pronto quando:** qualidade e incerteza atendam aos limites definidos em 3.1 em dados reservados. **Se falhar:** revisar dados/modelo; não declarar uma previsão confiável apenas porque o código executa.

## 3.10 — ML para prever onde a vegetação poderá mudar

**Prioridade:** obrigatória para o mapa futuro solicitado. **Depende:** 3.6 e 3.8; reconciliar com 3.9.

- Definir transições por célula: vegetação que permanece, vegetação perdida, recuperação e permanência sem vegetação; usar classes mais detalhadas somente se suportadas.
- Preparar pares passado → futuro com horizonte fixo e entradas disponíveis no momento de origem.
- Usar cobertura anterior, vizinhança, trajetória de mudança, histórico de fogo e variáveis geográficas justificadas.
- Treinar um modelo de probabilidades de transição; começar com árvores/boosting antes de redes espaço-temporais.
- Tratar desbalanceamento: a permanência tende a dominar; alta acurácia global pode esconder falha em prever perda e recuperação.
- Criar baseline de persistência espacial e comparar com ele em datas e áreas reservadas.
- Gerar raster de probabilidades e, separadamente, um cenário classificado com regra/limiar documentado.
- Agregar probabilidades para hectares esperados respeitando a área de cada célula; comparar com os totais do modelo numérico, sem forçar concordância artificial.
- Medir IoU/F1 das mudanças, precisão/recall de perda e recuperação, calibração e erro agregado de área.
- Validar mapas de erro e locais onde o modelo confunde perda com recuperação.
- Não “encolher” o polígono legal da UC nem pintar uma redução arbitrária a partir de um número agregado.

**Entrega:** mapa futuro de cobertura/probabilidade com horizonte, versão e incerteza. **Pronto quando:** a avaliação espacial demonstrar utilidade além de simplesmente repetir o último mapa. **Atenção:** acertar o total de hectares não prova que o modelo acertou a localização.

## 3.11 — ML para prever fogo

**Prioridade:** obrigatória. **Depende:** 3.2–3.3 e 3.8.

- Fixar o alvo: probabilidade de área queimada na célula/período, ou foco detectado se esse for o produto escolhido; não alternar os dois sem mudar a interpretação.
- Construir histórico regular incluindo períodos observados sem eventos e identificando falhas de cobertura.
- Calcular atributos de sazonalidade, tempo desde último fogo, recorrência, chuva/temperatura/umidade anteriores e vegetação disponível.
- Caso use previsão meteorológica, manter a versão que estaria disponível na data da emissão; não substituí-la pelo clima realmente observado depois.
- Criar baseline de frequência histórica/sazonal por região.
- Comparar regressão logística e modelos de árvores/boosting, controlando o desbalanceamento no treinamento.
- Avaliar precisão, revocação, PR-AUC, Brier/calibração e falsos alarmes por região/período; não depender apenas de acurácia.
- Escolher limiares de categorias de risco na validação, com consequências dos falsos positivos e negativos descritas.
- Mostrar probabilidade, período futuro, data de geração e faixa de aplicação conhecida.
- Se houver dados e requisito aprovado, acrescentar um alvo separado de extensão/área queimada; risco de ocorrência não fornece automaticamente hectares nem trajetória de propagação.

**Entrega:** mapa de probabilidade de fogo para horizonte definido. **Pronto quando:** superar a referência nas condições acordadas ou ter suas limitações explicitamente reconhecidas; a meta de qualidade não pode ser prometida antes da avaliação.

## 3.12 — Definir cenários, horizontes e relação entre os modelos

**Prioridade:** obrigatória para apresentar previsões com significado. **Depende:** 3.9–3.11.

- Disponibilizar apenas horizontes realmente testados; começar curto antes de projetar muitos anos.
- Distinguir previsão baseada nas condições disponíveis de cenário condicionado a hipóteses futuras.
- Se criar cenários de continuidade, recuperação ou maior pressão, definir hipóteses e entradas quantitativas; não aplicar percentuais inventados apenas para gerar imagens diferentes.
- Se usar projeções repetidas ano a ano, avaliar propagação e acúmulo de erro por horizonte.
- Manter os modelos inicialmente independentes para avaliar cada um com clareza.
- Se o risco previsto de fogo alimentar a previsão de vegetação, gerar essa entrada fora da amostra de treino e avaliar o conjunto sem vazamento.
- Mostrar discordância e incerteza; suspender previsões quando faltarem entradas essenciais ou o local estiver fora do domínio validado.

**Entrega:** contrato de cenários e horizontes. **Pronto quando:** o usuário souber quais condições sustentam cada mapa. **Não é requisito implícito:** simulação física de propagação de incêndio ou demonstração causal do efeito do fogo.

## 3.13 — Criar API e servir produtos geográficos

**Prioridade:** implementar quando o volume/atualização justificar; contratos são obrigatórios. **Depende:** 3.4–3.5; pode começar antes dos modelos finais.

- Definir consultas de unidades, períodos disponíveis, indicadores, histórico, camadas, previsões e métricas.
- Propor endpoints como /units, /observations, /predictions e /models, com parâmetros validados, paginação e limites.
- Separar o pedido de consulta do processamento pesado; a interface consome previsões prontas.
- Caso haja geração sob demanda, retornar estado de processamento e impedir trabalhos duplicados.
- Selecionar formato por volume: GeoJSON para conjuntos pequenos; tiles vetoriais/raster ou COG para conjuntos maiores, conforme prova de conceito.
- Configurar cache por versão do produto, compressão e níveis de detalhe para não carregar toda a base em cada tela.
- Implementar mensagens claras para produto indisponível, período inexistente e falha temporária.
- Se não houver necessidade de API no piloto, publicar produtos em lote com os mesmos contratos e documentar essa decisão.

**Entrega:** acesso consistente aos produtos no frontend. **Tecnologias sugeridas:** FastAPI no backend e PostgreSQL/PostGIS se escolhidos; backend e banco não são pré-requisitos para treinar os primeiros modelos offline.

## 3.14 — Completar a experiência do dashboard e do mapa

**Prioridade:** obrigatória. **Depende:** 3.6 e produtos de 3.9–3.13.

- Criar modos claramente identificados: observado, mudança histórica e previsão/cenário.
- Permitir selecionar unidade, intervalo, indicador e horizonte permitido.
- Adicionar comparação antes/depois e controle de ano com cores consistentes por classe.
- Exibir gráficos de hectares e percentuais, separando trecho observado de trecho previsto e mostrando intervalos quando disponíveis.
- Mostrar perda, ganho, permanência, área válida observada e diferenças entre as datas.
- Adicionar camada de probabilidade de fogo com legenda e data de geração.
- Adicionar mapa futuro de vegetação com probabilidades, classes previstas e indicação de incerteza.
- Exibir detalhes da célula/região: fonte, data, horizonte, resultado e limites da estimativa.
- Manter ranking atual e adicionar comparações históricas sem confundir hectares com percentual.
- Preservar acessibilidade: contraste, teclado, foco, descrição das camadas, alternativa tabular e mensagens de carregamento/erro.

**Entrega:** fluxo completo do passado ao cenário futuro. **Pronto quando:** uma pessoa conseguir distinguir o que aconteceu do que o modelo estima que poderá acontecer, no computador e no celular.

## 3.15 — Versionar, automatizar e acompanhar os modelos

**Prioridade:** obrigatória para reprodutibilidade; automação gradual. **Depende:** primeiros experimentos de 3.8–3.11.

- Registrar conjunto de treino, data de corte, variáveis, parâmetros, seed, dependências e duração de cada execução.
- Salvar artefato do modelo, transformações, contrato das entradas, métricas e versão.
- Separar modelo candidato de versão aprovada; permitir voltar a uma versão anterior.
- Versionar também previsões por data, horizonte e cenário para comparar depois com o observado.
- Criar tarefas de importação, atualização de indicadores e geração em lote com logs e falhas rastreáveis.
- Definir frequência de atualização conforme a publicação das fontes; não prometer atualização diária para um produto anual.
- Acompanhar mudanças na distribuição das entradas e degradação de desempenho quando chegarem dados novos.
- Definir condições para reavaliar/retraining, com revisão antes de promover novo modelo.

**Entrega:** histórico auditável e procedimento de atualização. **Tecnologias candidatas:** manifestos JSON e arquivos versionados no início; MLflow/DVC ou equivalente apenas se ajudarem a equipe. **Pronto quando:** outra pessoa conseguir reproduzir uma execução e identificar o modelo usado em um mapa.

## 3.16 — Qualidade, desempenho e operação

**Prioridade:** obrigatória; trabalhar ao longo da fase. **Depende:** cada módulo à medida que for entregue.

- Ampliar testes unitários para regras, áreas, períodos, valores ausentes e limites físicos.
- Criar testes de integração de importação, persistência, API e geração de produtos.
- Versionar o roteiro de navegador e executá-lo de forma automatizada, incluindo falhas de dados e uso em celular.
- Testar consistência entre área no relatório, tabela e camada correspondente.
- Medir tempo de importação, tamanho de mapas, memória, latência de consulta e carregamento em conexão limitada.
- Definir metas de desempenho no piloto e registrar o equipamento/volume dos testes.
- Evitar que URLs de dados remotos e entradas inválidas causem acesso indevido ou sobrecarga no backend.
- Manter segredos fora do repositório; se houver área administrativa, controlar escrita e autenticação. Login público não é requisito confirmado.
- Testar backup/restauração e documentar procedimento de falha, recuperação e rollback.

**Entrega:** relatório de qualidade e operação. **Pronto quando:** fluxos críticos, recuperação e limites acordados forem demonstrados, e falhas conhecidas estiverem registradas.

## 3.17 — Relatórios, documentação e entrega acadêmica

**Prioridade:** obrigatória. **Depende:** resultados validados e interface integrada.

- Permitir exportar resultados tabulares e um relatório de análise com unidade, datas, métricas e fontes.
- Registrar método de área, projeção, regras de recorte, qualidade e cobertura dos dados.
- Criar ficha de cada modelo: objetivo, entradas, saída, treino, validação, métricas, limitações e uso pretendido.
- Documentar baselines, experimentos que não funcionaram e motivos de escolha do modelo final.
- Explicar que previsão não é prova, que perda pode coexistir com recuperação e que associação com fogo não comprova causa.
- Atualizar README, arquitetura, dicionário, instruções de ambiente e manual do usuário.
- Atualizar apresentações existentes com resultados reais, capturas dos mapas e indicadores de validação.
- Demonstrar importação → histórico → modelos → produtos → mapa/relatório sem etapas manuais não documentadas.

**Entrega:** pacote acadêmico e técnico reproduzível. **Pronto quando:** uma pessoa fora da implementação conseguir entender, executar e avaliar o sistema com os materiais entregues.

## 3.18 — Homologar o piloto, ampliar cobertura e concluir

**Prioridade:** obrigatória para encerrar o projeto. **Depende:** 3.1–3.17, respeitando itens condicionais.

- Demonstrar as duas previsões no piloto e revisar resultados com a equipe/professor e, se possível, alguém com conhecimento ambiental.
- Aprovar os critérios definidos antes do teste final ou documentar formalmente os objetivos que não foram atingidos.
- Expandir para outras unidades apenas após verificar cobertura dos dados e generalização; não replicar uma previsão local como se validasse Goiás inteiro.
- Marcar unidades/períodos não suportados como indisponíveis, com motivo.
- Consolidar pacote de implantação, instruções, versões, backups e responsabilidades de manutenção.
- Definir destino de hospedagem e custos de armazenamento/processamento; não há provedor contratado neste plano.
- Fazer revisão final dos fluxos, metodologia, métricas e consistência dos artefatos.

**Marco F3:** sistema com dados históricos rastreáveis, análise visual de mudanças, previsão espacial de vegetação e risco de fogo avaliados e integrados, relatórios e operação documentada. **Se a qualidade preditiva não for suficiente:** o projeto pode entregar uma pesquisa/protótipo com resultado negativo, mas não declarar atingido o objetivo de uma previsão operacional confiável.


---

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

