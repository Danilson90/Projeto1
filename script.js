const listaProdutos = document.getElementById('lista-produtos');
const loading = document.getElementById('loading');
const erroMsg = document.getElementById('erro-msg');
const campoBusca = document.getElementById('campo-busca');
const btnBuscar = document.getElementById('btn-buscar');
const btnRecarregar = document.getElementById('btn-recarregar');

const API_URL = 'https://dummyjson.com/products';

// Função principal para buscar dados da API
async function carregarProdutos(url = `${API_URL}?limit=12`) {
    // Reseta o estado da tela
    listaProdutos.innerHTML = '';
    erroMsg.classList.add('d-none');
    loading.classList.remove('d-none');

    try {
        const resposta = await fetch(url);
        
        if (!resposta.ok) {
            throw new Error(`Erro na requisição: ${resposta.status}`);
        }

        const dados = await resposta.json();
        renderizarProdutos(dados.products);
    } catch (erro) {
        erroMsg.textContent = `Não foi possível carregar os produtos. (${erro.message})`;
        erroMsg.classList.remove('d-none');
    } finally {
        loading.classList.add('d-none');
    }
}

// Função para montar os cards do Bootstrap na tela
function renderizarProdutos(produtos) {
    if (!produtos || produtos.length === 0) {
        listaProdutos.innerHTML = `
            <div class="col-12 text-center text-muted my-4">
                <h5>Nenhum produto encontrado.</h5>
            </div>`;
        return;
    }

    produtos.forEach(produto => {
        const coluna = document.createElement('div');
        coluna.className = 'col';

        coluna.innerHTML = `
            <div class="card h-100 shadow-sm border-0 card-produto">
                <img src="${produto.thumbnail}" class="card-img-top" alt="${produto.title}">
                <div class="card-body d-flex flex-column">
                    <span class="badge bg-secondary align-self-start mb-2 text-capitalize">${produto.category}</span>
                    <h5 class="card-title fs-6 fw-bold">${produto.title}</h5>
                    <p class="card-text text-muted small descricao-curta">${produto.description}</p>
                    <div class="mt-auto pt-3 d-flex justify-content-between align-items-center">
                        <span class="fs-5 fw-bold text-success">$ ${produto.price.toFixed(2)}</span>
                        <button class="btn btn-sm btn-outline-primary" onclick="alert('Produto: ${produto.title}\\nAvaliação: ${produto.rating}/5')">
                            Detalhes
                        </button>
                    </div>
                </div>
            </div>
        `;

        listaProdutos.appendChild(coluna);
    });
}

// Eventos de busca e recarregamento
btnBuscar.addEventListener('click', () => {
    const termo = campoBusca.value.trim();
    if (termo) {
        carregarProdutos(`${API_URL}/search?q=${encodeURIComponent(termo)}`);
    } else {
        carregarProdutos();
    }
});

campoBusca.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        btnBuscar.click();
    }
});

btnRecarregar.addEventListener('click', () => {
    campoBusca.value = '';
    carregarProdutos();
});

// Carrega os produtos assim que a página abre
carregarProdutos();



// ###################################################################


document.getElementById('logo-home').addEventListener('click', (e) => {
    e.preventDefault();
    campoBusca.value = '';
    carregarProdutos();
});



// ###################################################################



const listaProdutos = document.getElementById('lista-produtos');
const loading = document.getElementById('loading');
const erroMsg = document.getElementById('erro-msg');
const campoBusca = document.getElementById('campo-busca');
const btnBuscar = document.getElementById('btn-buscar');
const btnRecarregar = document.getElementById('btn-recarregar');

// Elementos do Carrinho e Pix
const contadorCarrinho = document.getElementById('contador-carrinho');
const itensCarrinhoEl = document.getElementById('itens-carrinho');
const totalCarrinhoEl = document.getElementById('total-carrinho');
const btnPagarPix = document.getElementById('btn-pagar-pix');
const btnLimparCarrinho = document.getElementById('btn-limpar-carrinho');

const modalPix = new bootstrap.Modal(document.getElementById('modalPix'));
const pixQrCodeImg = document.getElementById('pix-qrcode');
const pixValorEl = document.getElementById('pix-valor');
const pixCopiaColaInput = document.getElementById('pix-copia-cola');
const btnCopiarPix = document.getElementById('btn-copiar-pix');
const btnConfirmarPix = document.getElementById('btn-confirmar-pix');

const API_PRODUTOS = 'https://dummyjson.com/products';
const API_QRCODE = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=';

let catalogoCache = {};
let carrinho = JSON.parse(localStorage.getItem('lojinha_carrinho')) || [];

// --- PRODUTOS (DUMMY API) ---

async function carregarProdutos(url = `${API_PRODUTOS}?limit=12`) {
    listaProdutos.innerHTML = '';
    erroMsg.classList.add('d-none');
    loading.classList.remove('d-none');

    try {
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error(`Erro: ${resposta.status}`);

        const dados = await resposta.json();
        dados.products.forEach(p => catalogoCache[p.id] = p);
        renderizarProdutos(dados.products);
    } catch (erro) {
        erroMsg.textContent = `Erro ao carregar produtos: ${erro.message}`;
        erroMsg.classList.remove('d-none');
    } finally {
        loading.classList.add('d-none');
    }
}

function renderizarProdutos(produtos) {
    if (!produtos.length) {
        listaProdutos.innerHTML = '<p class="text-center text-muted my-4">Nenhum produto encontrado.</p>';
        return;
    }

    produtos.forEach(produto => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card h-100 shadow-sm border-0 card-produto">
                <img src="${produto.thumbnail}" class="card-img-top" alt="${produto.title}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title fs-6 fw-bold">${produto.title}</h5>
                    <p class="card-text text-muted small descricao-curta">${produto.description}</p>
                    <div class="mt-auto pt-2">
                        <div class="fs-5 fw-bold text-success mb-2">$ ${produto.price.toFixed(2)}</div>
                        <button class="btn btn-primary btn-sm w-100" onclick="adicionarAoCarrinho(${produto.id})">
                            + Adicionar
                        </button>
                    </div>
                </div>
            </div>
        `;
        listaProdutos.appendChild(col);
    });
}

// --- CARRINHO SIMPLES ---

function salvarCarrinho() {
    localStorage.setItem('lojinha_carrinho', JSON.stringify(carrinho));
    atualizarCarrinho();
}

function adicionarAoCarrinho(id) {
    const item = carrinho.find(i => i.id === id);
    if (item) {
        item.quantidade++;
    } else {
        const prod = catalogoCache[id];
        if (!prod) return;
        carrinho.push({
            id: prod.id,
            title: prod.title,
            price: prod.price,
            thumbnail: prod.thumbnail,
            quantidade: 1
        });
    }
    salvarCarrinho();
}

function alterarQtd(id, delta) {
    const item = carrinho.find(i => i.id === id);
    if (!item) return;
    item.quantidade += delta;
    if (item.quantidade <= 0) {
        carrinho = carrinho.filter(i => i.id !== id);
    }
    salvarCarrinho();
}

function atualizarCarrinho() {
    const totalQtd = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    contadorCarrinho.textContent = totalQtd;

    const vazio = carrinho.length === 0;
    btnPagarPix.disabled = vazio;
    btnLimparCarrinho.disabled = vazio;

    if (vazio) {
        itensCarrinhoEl.innerHTML = '<p class="text-center text-muted my-5">Seu carrinho está vazio.</p>';
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
                <div class="text-truncate small fw-bold">${item.title}</div>
                <div class="text-success small">$ ${subtotal.toFixed(2)}</div>
                <div class="d-flex align-items-center gap-2 mt-1">
                    <button class="btn btn-outline-secondary btn-qtd" onclick="alterarQtd(${item.id}, -1)">-</button>
                    <span class="small fw-bold">${item.quantidade}</span>
                    <button class="btn btn-outline-secondary btn-qtd" onclick="alterarQtd(${item.id}, 1)">+</button>
                </div>
            </div>
        `;
        itensCarrinhoEl.appendChild(div);
    });

    totalCarrinhoEl.textContent = `$ ${total.toFixed(2)}`;
}

// --- PAGAMENTO PIX (API QR CODE) ---

btnPagarPix.addEventListener('click', () => {
    const total = carrinho.reduce((acc, item) => acc + (item.price * item.quantidade), 0).toFixed(2);
    
    // Payload Pix simulado com o valor atual do carrinho
    const codigoPix = `00020126360014BR.GOV.BCB.PIX0114lojinha@pix.com520400005303986540${total.length}${total}5802BR5915LOJINHA VIRTUAL6009SAO PAULO62070503***6304ABCD`;

    // Chama a API pública para gerar a imagem do QR Code
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
    alert('Pagamento Pix confirmado! Obrigado pela compra na Lojinha Virtual.');
    carrinho = [];
    salvarCarrinho();
});

btnLimparCarrinho.addEventListener('click', () => {
    carrinho = [];
    salvarCarrinho();
});

// --- BUSCA E NAVEGAÇÃO ---

btnBuscar.addEventListener('click', () => {
    const termo = campoBusca.value.trim();
    carregarProdutos(termo ? `${API_PRODUTOS}/search?q=${encodeURIComponent(termo)}` : undefined);
});

campoBusca.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnBuscar.click();
});

btnRecarregar.addEventListener('click', () => {
    campoBusca.value = '';
    carregarProdutos();
});

document.getElementById('logo-home').addEventListener('click', (e) => {
    e.preventDefault();
    campoBusca.value = '';
    carregarProdutos();
});

// Inicializa
atualizarCarrinho();
carregarProdutos();