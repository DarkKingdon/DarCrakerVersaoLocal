// vendedor.js - Lógica de funcionamento da loja de compras dividida em abas

let slotAtivo = localStorage.getItem("DarCraker_Slot_Ativo") || "1";
let jogador = JSON.parse(localStorage.getItem(`DarCraker_Slot_${slotAtivo}`));

document.addEventListener("DOMContentLoaded", function() {
    if (!jogador) {
        alert("Erro: Nenhum personagem carregado!");
        window.location.href = "../../../index.html";
        return;
    }
    
    if (!jogador.mochila) {
        jogador.mochila = {};
    }

    atualizarInterfaceOuro();
    renderizarVitrineCompras();
});

function atualizarInterfaceOuro() {
    let saldoOuro = 0;
    if (jogador.mochila["moedasdeouro"]) {
        saldoOuro = jogador.mochila["moedasdeouro"].quantidade || 0;
    }
    document.getElementById("saldo-ouro").textContent = saldoOuro;
}

function obterCaminhoImagemVendedor(nomeItem) {
    if (!nomeItem) return null;
    const nomeFormatado = nomeItem.toLowerCase().trim();

    switch(nomeFormatado) {
        case "jellopy":
            return "../../../img/objeto_comun/jellopy.jpg";
        case "luvas simples":
        case "luvas_simples":
            return "../../../img/equipamentos/luvas_simples.jpg";
        case "moedas de ouro":
        case "moeda de ouro":
        case "moedasdeouro":
            return "../../../img/objeto_comun/moedas_de_ouro.jpg";
        case "zaleia":
            return "../../../img/objeto_comun/zaleia.jpg";
        case "ração tipo 1":
        case "racao tipo 1":
        case "racao_tipo_1":
            return "../../../img/objeto_comun/racao_tipo_1.jpg";
        case "maçã":
        case "maca":
            return "../../../img/objeto_consumivel/maca.jpg";
        default:
            return `../../../img/objeto_comun/${nomeFormatado}.jpg`;
    }
}

// Controla abrir e fechar as categorias (Sanfona)
function toggleCategoria(idCategoria, elementoHeader) {
    const conteudo = document.getElementById(`cat-${idCategoria}`);
    const seta = elementoHeader.querySelector('.seta-categoria');
    
    if (conteudo.classList.contains('active')) {
        conteudo.classList.remove('active');
        seta.classList.remove('fa-chevron-up');
        seta.classList.add('fa-chevron-down');
    } else {
        conteudo.classList.add('active');
        seta.classList.remove('fa-chevron-down');
        seta.classList.add('fa-chevron-up');
    }
}

function renderizarVitrineCompras() {
    const gridSuprimentos = document.getElementById("grid-suprimentos");
    const gridEquipamentos = document.getElementById("grid-equipamentos");
    const gridAlquimia = document.getElementById("grid-alquimia");
    
    // Limpa todos os grids antes de renderizar
    gridSuprimentos.innerHTML = "";
    gridEquipamentos.innerHTML = "";
    gridAlquimia.innerHTML = "";
    
    const listaItensVenda = Object.keys(TABELA_VENDEDOR);

    listaItensVenda.forEach(itemId => {
        let dadosOficiais = TABELA_VENDEDOR[itemId];
        let nomeExibicao = dadosOficiais.nome || itemId;
        let valorCompra = dadosOficiais.valor_compra;
        let imgSrc = obterCaminhoImagemVendedor(nomeExibicao);

        let cardHTML = `
            <div class="vendedor-card" id="vitrine-item-${itemId}">
                <div class="vendedor-img-container">
                    <img src="${imgSrc}" alt="${nomeExibicao}" class="vendedor-card-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div class="item-icon" style="display: none; font-size: 2rem;">${dadosOficiais.icone || '📦'}</div>
                </div>
                <div class="vendedor-card-info">
                    <h3>${nomeExibicao}</h3>
                    <p class="item-descricao" title="${dadosOficiais.descricao}">${dadosOficiais.descricao}</p>
                    <div class="preco-compra">
                        <img src="../../../img/objeto_comun/moedas_de_ouro.jpg" alt="Ouro" class="moeda-img"> 
                        <span>${valorCompra} Ouro</span>
                    </div>
                    <button class="btn-comprar" onclick="comprarItem('${itemId}')">Comprar</button>
                </div>
            </div>
        `;
        
        // Separação lógica baseada nas categorias solicitadas
        if (itemId === "racao_tipo_1" || itemId === "maca") {
            gridSuprimentos.innerHTML += cardHTML;
        } else if (itemId === "luvas_simples" || dadosOficiais.tipo.toLowerCase() === "equipamento") {
            gridEquipamentos.innerHTML += cardHTML;
        } else if (itemId === "zaleia") {
            gridAlquimia.innerHTML += cardHTML;
        }
    });
}

function comprarItem(itemId) {
    let dadosItem = TABELA_VENDEDOR[itemId];
    if (!dadosItem) return;

    let custo = dadosItem.valor_compra;
    let ouroAtual = jogador.mochila["moedasdeouro"] ? jogador.mochila["moedasdeouro"].quantidade : 0;

    if (ouroAtual < custo) {
        alert("Você não tem Moedas de Ouro suficientes para comprar este item!");
        return;
    }

    jogador.mochila["moedasdeouro"].quantidade -= custo;

    if (!jogador.mochila[itemId]) {
        jogador.mochila[itemId] = {
            id: dadosItem.id,
            nome: dadosItem.nome,
            tipo: dadosItem.tipo,
            descricao: dadosItem.descricao,
            icone: dadosItem.icone,
            acumulavel: dadosItem.acumulavel,
            quantidade: 1
        };
    } else {
        if (jogador.mochila[itemId].quantidade !== undefined) {
            jogador.mochila[itemId].quantidade++;
        } else {
            jogador.mochila[itemId].quantidade = 1;
        }
    }

    localStorage.setItem(`DarCraker_Slot_${slotAtivo}`, JSON.stringify(jogador));
    atualizarInterfaceOuro();
    alert(`Você comprou 1x ${dadosItem.nome}!`);
}

// Funções do menu e salvamento mantidas sem alteração
function toggleMenu() {
    let sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("active");
}

document.addEventListener('click', function(event) {
    let sidebar = document.getElementById("sidebar");
    let menuToggle = document.querySelector(".menu-toggle");
    if (sidebar && sidebar.classList.contains('active')) {
        if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
            sidebar.classList.remove('active');
        }
    }
});

function salvarNoSlotAtual() {
    if (!jogador) { alert("Nenhum personagem encontrado para salvar!"); return; }
    localStorage.setItem(`DarCraker_Slot_${slotAtivo}`, JSON.stringify(jogador));
    alert(`Progresso salvo com sucesso no Slot ${slotAtivo}!`);
}

function exportarSaveFisico() {
    if (!jogador) { alert("Nenhum personagem encontrado no slot ativo!"); return; }
    const textoJson = JSON.stringify(jogador, null, 2);
    const nomeArquivo = `backup_DarCraker_${jogador.nome.toLowerCase()}.json`;

    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        try {
            const base64Dados = btoa(unescape(encodeURIComponent(textoJson)));
            const linkDataUri = "data:application/json;base64," + base64Dados + "#" + encodeURIComponent(nomeArquivo);
            const linkAndroid = document.createElement("a");
            linkAndroid.href = linkDataUri;
            linkAndroid.download = nomeArquivo;
            document.body.appendChild(linkAndroid);
            linkAndroid.click();
            document.body.removeChild(linkAndroid);
        } catch (e) {
            prompt("Não foi possível gerar o arquivo automaticamente. Copie o seu código de Save abaixo:", textoJson);
        }
    } else {
        const blob = new Blob([textoJson], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = nomeArquivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        alert("Arquivo de backup gerado na sua pasta de Downloads!");
    }
}