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
