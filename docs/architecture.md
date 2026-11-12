# Arquitetura

## Componentes e dependências

O sistema tem duas partes: processamento offline em Python e interface estática em JavaScript nativo. A geração usa Node.js apenas para copiar os fontes e os dados para dist/, sem empacotador. O mapa utiliza a dependência npm Leaflet, copiada com sua licença pelo build.

Fluxo: ZIP original → scripts Python → data/generated/ → build → dist/ → navegador.

main.js recebe window.DATA e window.IMPACT, inicializa o catálogo e fornece explicitamente sua função navigate ao monitoramento. Esses dois objetos globais são o contrato dos arquivos de dados; as funções da aplicação ficam isoladas em módulos ES. Não existe dependência implícita de funções globais entre telas.

- config/: metadados das bases e nomes dos campos, sem acesso ao DOM.
- data/records.js: transforma linhas compactadas em registros; recebe a base e o tipo como argumentos, sem depender da tela ativa.
- shared/format.js: utilitários de formatação e seleção de elementos.
- features/catalog.js: estado da consulta, filtros, paginação, detalhes e eventos do catálogo.
- features/monitoring.js: seleção de indicador e renderização do ranking.
- scripts/source_data.py: argumentos e destinos comuns dos comandos de processamento.

## Contratos de dados

DATA contém bases indexadas por chave, cada uma com fields (nomes das colunas) e rows (linhas em arrays na mesma ordem). A interface reconstrói os objetos e mantém os campos originais para os detalhes.

IMPACT contém units e method. Cada unidade contém identificação, áreas e periods; cada período contém indicadores com areaHa e percent. Um indicador null significa indisponibilidade, enquanto percent igual a zero representa ausência de interseção. method registra projeção, fórmula, hash SHA-256 da origem e reparos geométricos.

## Manutenção

Para adicionar uma base, declare seus metadados em config/datasets.js e sua adaptação em data/records.js. Para mudar indicadores ou períodos, ajuste features/monitoring.js junto ao cálculo Python e à explicação exibida em index.html.

Os estilos existentes foram preservados em dois arquivos para manter a aparência. As apresentações ficam fora da publicação. dist/ permanece versionado para compatibilidade com a hospedagem existente; sempre execute o build antes de publicar ou entregar alterações. O build sobrescreve os arquivos correspondentes, mas não apaga arquivos extras da pasta.

A arquitetura mantém o tamanho e as necessidades atuais do projeto. Um servidor de aplicação só será necessário se surgirem requisitos como autenticação, edição compartilhada ou atualização remota dos dados.

## Mapa interativo (29/10/2026)

features/map.js carrega GeoJSON local sob demanda e administra as camadas Leaflet. features/monitoring.js apresenta a tabela; data/monitoring.js centraliza os períodos e a ordenação. A seleção é comunicada pelo evento unit:select com identificador e origem, sem depender de funções globais entre módulos. Os dados de impacto continuam injetados pela inicialização.

prepare_map.py gera limites, ocorrências e metadados de origem em data/generated/map/. Geometrias simplificadas servem somente ao desenho; os indicadores de impacto continuam usando o processamento original. O build copia a dependência Leaflet e sua licença para permitir consulta sem CDN. Ainda não existe backend, banco ou machine learning.
