# Projeto1# Catálogo de Produtos - DummyJSON API

Uma aplicação web simples e responsiva que consome a API pública [DummyJSON](https://dummyjson.com/) para exibir um catálogo de produtos com funcionalidade de busca em tempo real.

## Tecnologias Utilizadas

* **HTML5:** Estrutura semântica da página.
* **CSS3:** Estilização customizada, truncamento de texto e animações de hover nos cards.
* **Bootstrap 5.3:** Sistema de grid responsivo, componentes de interface (Navbar, Cards, Spinners, Alerts) e utilitários.
* **JavaScript (ES6+):** Consumo assíncrono de API REST com `fetch` e `async/await`, manipulação dinâmica do DOM e tratamento de eventos.

## Estrutura de Arquivos

```text
├── index.html      # Estrutura principal e importação do Bootstrap
├── style.css       # Estilos complementares e ajustes visuais
├── script.js       # Lógica de requisição na API e renderização dos produtos
└── README.md       # Documentação do projeto