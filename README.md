# Benchmark Front-End: Comparativo de Geração de Código por IAs - Disciplina: Desenvolvimento de Interfaces 

Estudo prático e comparativo para analisar a qualidade, estrutura e eficiência do código HTML, CSS e JavaScript gerado por diferentes modelos de Inteligência Artificial para uma mesma especificação de página web.
O objetivo deste estudo é avaliar o comportamento, as escolhas arquiteturais, a acessibilidade e a fidelidade visual de **3 diferentes IAs** ao receberem exatamente a mesma especificação (*prompt*) de interface front-end.

## IAs Avaliadas

| IA | Modelo / Versão | Código Fonte | Live Demo |
|---|---|---|---|
| **ChatGPT** | GPT-4o | [`/src/chatgpt`](./src/chatgpt) 
| **Claude** | Claude 3.5 Sonnet | [`/src/claude`](./src/claude)
| **Gemini** | Gemini 1.5 Pro | [`/src/gemini`](./src/gemini) 

---

##  Critérios de Análise

A comparação do código gerado considerou os seguintes pilares:

- **Semântica HTML:** Uso correto de tags estruturais (`<header>`, `<main>`, `<article>`, `<nav>`, `<section>`).
- **Responsividade & Layout:** Uso de Media Queries, CSS Grid/Flexbox e comportamento em telas móbiles.
- **Acessibilidade (a11y):** Atributos `aria-*`, contraste de cores, hierarquia de cabeçalhos e navegação via teclado.
- **Qualidade do CSS:** Variáveis CSS, organização das regras e ausência de código redundante.
- **Interatividade & JavaScript:** Manipulação limpa do DOM, tratamento de eventos e estabilidade.
- **Fidelidade e Estética:** Resultado estético do primeiro resultado entregue sem intervenções manuais.

