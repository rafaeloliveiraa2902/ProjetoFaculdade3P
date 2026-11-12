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
