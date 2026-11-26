// =========================================================================
// 1. REFERÊNCIAS AOS ELEMENTOS DO DOM
// =========================================================================
const listaProdutos = document.getElementById('lista-produtos');
const loading = document.getElementById('loading');
const erroMsg = document.getElementById('erro-msg');
const campoBusca = document.getElementById('campo-busca');
const btnBuscar = document.getElementById('btn-buscar');
const btnRecarregar = document.getElementById('btn-recarregar');
const filtroCategoria = document.getElementById('filtro-categoria');
const logoHome = document.getElementById('logo-home');

// Elementos do Carrinho
const contadorCarrinho = document.getElementById('contador-carrinho');
const itensCarrinhoEl = document.getElementById('itens-carrinho');
const totalCarrinhoEl = document.getElementById('total-carrinho');
const btnPagarPix = document.getElementById('btn-pagar-pix');
const btnLimparCarrinho = document.getElementById('btn-limpar-carrinho');

// Elementos do Modal Pix
const modalPix = new bootstrap.Modal(document.getElementById('modalPix'));
const pixQrCodeImg = document.getElementById('pix-qrcode');
const pixValorEl = document.getElementById('pix-valor');
const pixCopiaColaInput = document.getElementById('pix-copia-cola');
const btnCopiarPix = document.getElementById('btn-copiar-pix');
const btnConfirmarPix = document.getElementById('btn-confirmar-pix');

// =========================================================================
// 2. CONFIGURAÇÕES E ESTADO DA APLICAÇÃO
// =========================================================================
const API_PRODUTOS = 'https://dummyjson.com/products';
const API_QRCODE = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=';

// Guarda os produtos já carregados por ID para evitar perder dados ao pesquisar
let catalogoCache = {};

// Carrega o carrinho guardado no navegador ou inicia vazio
let carrinho = JSON.parse(localStorage.getItem('lojinha_carrinho')) || [];

// =========================================================================
// 3. CONSUMO DA API E RENDERIZAÇÃO DO CATÁLOGO
// =========================================================================

/**
 * Busca produtos na API DummyJSON e exibe na tela.
 * @param {string} url - Endpoint da API a consultar
 */
async function carregarProdutos(url = `${API_PRODUTOS}?limit=12`) {
    listaProdutos.innerHTML = '';
    erroMsg.classList.add('d-none');
    loading.classList.remove('d-none');

    try {
        const resposta = await fetch(url);
        if (!resposta.ok) {
            throw new Error(`Falha na comunicação com o servidor (Status: ${resposta.status})`);
        }

        const dados = await resposta.json();
        const produtos = dados.products || [];

        // Armazena cada produto no cache indexado pelo ID
        produtos.forEach(produto => {
            catalogoCache[produto.id] = produto;
        });

        renderizarProdutos(produtos);
    } catch (erro) {
        erroMsg.textContent = `Não foi possível carregar os produtos. ${erro.message}`;
        erroMsg.classList.remove('d-none');
    } finally {
        loading.classList.add('d-none');
    }
}

/**
 * Cria os cards Bootstrap no DOM para cada produto recebido.
 * @param {Array} produtos - Lista de objetos de produto
 */
function renderizarProdutos(produtos) {
    if (!produtos.length) {
        listaProdutos.innerHTML = `
            <div class="col-12 text-center text-muted my-5">
                <h5>Nenhum produto encontrado.</h5>
                <p class="small">Tente pesquisar por outro termo ou volte ao início.</p>
            </div>`;
        return;
    }

    produtos.forEach(produto => {
        const col = document.createElement('div');
        col.className = 'col';

        col.innerHTML = `
            <div class="card h-100 shadow-sm border-0 card-produto">
                <img src="${produto.thumbnail}" class="card-img-top" alt="${produto.title}">
                <div class="card-body d-flex flex-column">
                    <span class="badge bg-secondary align-self-start mb-2 text-capitalize">${produto.category}</span>
                    <h5 class="card-title fs-6 fw-bold">${produto.title}</h5>
                    <p class="card-text text-muted small descricao-curta">${produto.description}</p>
                    
                    <div class="mt-auto pt-2">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="fs-5 fw-bold text-success">$ ${produto.price.toFixed(2)}</span>
                            <small class="text-warning fw-semibold">★ ${produto.rating}</small>
                        </div>
                        <button class="btn btn-primary btn-sm w-100 fw-semibold" onclick="adicionarAoCarrinho(${produto.id}, this)">
                            + Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            </div>
        `;
        listaProdutos.appendChild(col);
    });
}

// =========================================================================
// 4. LÓGICA DO CARRINHO DE COMPRAS
// =========================================================================

/**
 * Grava o carrinho no localStorage e atualiza a interface.
 */
function salvarCarrinho() {
    localStorage.setItem('lojinha_carrinho', JSON.stringify(carrinho));
    atualizarCarrinho();
}

/**
 * Adiciona 1 unidade do produto ao carrinho e dá feedback visual no botão.
 * @param {number} id - ID do produto
 * @param {HTMLElement} botao - Botão clicado (opcional)
 */
function adicionarAoCarrinho(id, botao = null) {
    const itemExistente = carrinho.find(item => item.id === id);

    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        const produto = catalogoCache[id];
        if (!produto) return;

        carrinho.push({
            id: produto.id,
            title: produto.title,
            price: produto.price,
            thumbnail: produto.thumbnail,
            quantidade: 1
        });
    }

    salvarCarrinho();

    // Feedback visual temporário no botão
    if (botao) {
        const textoOriginal = botao.textContent;
        botao.textContent = '✓ Adicionado!';
        botao.classList.replace('btn-primary', 'btn-success');
        setTimeout(() => {
            botao.textContent = textoOriginal;
            botao.classList.replace('btn-success', 'btn-primary');
        }, 900);
    }
}

/**
 * Aumenta ou diminui a quantidade de um item no carrinho.
 * @param {number} id - ID do produto
 * @param {number} delta - +1 para somar, -1 para subtrair
 */
function alterarQtd(id, delta) {
    const item = carrinho.find(i => i.id === id);
    if (!item) return;

    item.quantidade += delta;

    // Remove o item se a quantidade chegar a zero
    if (item.quantidade <= 0) {
        removerItem(id);
    } else {
        salvarCarrinho();
    }
}

/**
 * Remove completamente um produto do carrinho.
 * @param {number} id - ID do produto
 */
function removerItem(id) {
    carrinho = carrinho.filter(item => item.id !== id);
    salvarCarrinho();
}

/**
 * Atualiza o contador do topo, a lista lateral e o valor total.
 */
function atualizarCarrinho() {
    const totalQtd = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    contadorCarrinho.textContent = totalQtd;

    const vazio = carrinho.length === 0;
    btnPagarPix.disabled = vazio;
    btnLimparCarrinho.disabled = vazio;

    if (vazio) {
        itensCarrinhoEl.innerHTML = '<p class="text-center text-muted my-5">O seu carrinho está vazio.</p>';
        totalCarrinhoEl.textContent = '$ 0.00';
        return;
    }

    itensCarrinhoEl.innerHTML = '';
    let total = 0;

    carrinho.forEach(item => {
        const subtotal = item.price * item.quantidade;
        total += subtotal;

        const div = document.createElement('div');
        div.className = 'd-flex align-items-center gap-2 border-bottom py-2';
        div.innerHTML = `
            <img src="${item.thumbnail}" class="img-carrinho" alt="${item.title}">
            <div class="flex-grow-1 overflow-hidden">
                <div class="text-truncate small fw-bold" title="${item.title}">${item.title}</div>
                <div class="text-success small fw-semibold">$ ${subtotal.toFixed(2)}</div>
                <div class="d-flex align-items-center gap-2 mt-1">
                    <button class="btn btn-outline-secondary btn-qtd" onclick="alterarQtd(${item.id}, -1)">-</button>
                    <span class="small fw-bold">${item.quantidade}</span>
                    <button class="btn btn-outline-secondary btn-qtd" onclick="alterarQtd(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="btn btn-sm text-danger border-0" title="Remover item" onclick="removerItem(${item.id})">✕</button>
        `;
        itensCarrinhoEl.appendChild(div);
    });

    totalCarrinhoEl.textContent = `$ ${total.toFixed(2)}`;
}

// =========================================================================
// 5. PAGAMENTO PIX (GERAÇÃO DE QR CODE VIA API)
// =========================================================================

btnPagarPix.addEventListener('click', () => {
    const total = carrinho
        .reduce((acc, item) => acc + (item.price * item.quantidade), 0)
        .toFixed(2);

    // Monta um código Pix Copia e Cola simulado com o valor da compra
    const codigoPix = `00020126360014BR.GOV.BCB.PIX0114lojinha@pix.com520400005303986540${total.length}${total}5802BR5915LOJINHA VIRTUAL6009PORTO ALEGRE62070503***6304ABCD`;

    // Solicita a imagem do QR Code à API externa
    pixQrCodeImg.src = `${API_QRCODE}${encodeURIComponent(codigoPix)}`;
    pixValorEl.textContent = `$ ${total}`;
    pixCopiaColaInput.value = codigoPix;

    modalPix.show();
});

btnCopiarPix.addEventListener('click', () => {
    navigator.clipboard.writeText(pixCopiaColaInput.value);
    btnCopiarPix.textContent = 'Copiado!';
    setTimeout(() => btnCopiarPix.textContent = 'Copiar', 2000);
});

btnConfirmarPix.addEventListener('click', () => {
    modalPix.hide();
    alert('Pagamento Pix confirmado! Obrigado pela sua compra na Lojinha Virtual.');
    carrinho = [];
    salvarCarrinho();
});

btnLimparCarrinho.addEventListener('click', () => {
    carrinho = [];
    salvarCarrinho();
});

// =========================================================================
// 6. EVENTOS DE PESQUISA E NAVEGAÇÃO
// =========================================================================

function resetarParaInicio() {
    campoBusca.value = '';
    filtroCategoria.value = '';
    carregarProdutos();
}

btnBuscar.addEventListener('click', () => {
    const termo = campoBusca.value.trim();
    filtroCategoria.value = '';
    carregarProdutos(termo ? `${API_PRODUTOS}/search?q=${encodeURIComponent(termo)}` : undefined);
});

campoBusca.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnBuscar.click();
});

filtroCategoria.addEventListener('change', () => {
    const categoria = filtroCategoria.value;
    campoBusca.value = '';
    carregarProdutos(categoria ? `${API_PRODUTOS}/category/${encodeURIComponent(categoria)}` : undefined);
});

btnRecarregar.addEventListener('click', resetarParaInicio);

logoHome.addEventListener('click', (e) => {
    e.preventDefault();
    resetarParaInicio();
});

// =========================================================================
// 7. INICIALIZAÇÃO DA PÁGINA
// =========================================================================
atualizarCarrinho();
carregarProdutos();