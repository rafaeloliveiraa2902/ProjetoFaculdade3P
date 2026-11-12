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
