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