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
