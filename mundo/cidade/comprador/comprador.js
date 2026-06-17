// comprador.js - Lógica de funcionamento da tela de vendas

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
    renderizarVitrineVendas();
});

function atualizarInterfaceOuro() {
    let saldoOuro = 0;
    if (jogador.mochila["moedasdeouro"]) {
        saldoOuro = jogador.mochila["moedasdeouro"].quantidade || 0;
    }
    document.getElementById("saldo-ouro").textContent = saldoOuro;
}

// Retorna os caminhos de imagem baseados na raiz onde o comprador está localizado
function obterCaminhoImagemComprador(nomeItem) {
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

function renderizarVitrineVendas() {
    const grid = document.getElementById("grid-vendas");
    const msgVazia = document.getElementById("mensagem-vazia");
    grid.innerHTML = "";
    
    let itensExibidos = 0;
    const listaDropsValidos = Object.keys(TABELA_COMPRADOR);

    listaDropsValidos.forEach(itemId => {
        let itemMochila = jogador.mochila[itemId];
        
        if (itemMochila) {
            let quantidade = itemMochila.quantidade || itemMochila.quantity || 0;
            
            if (quantidade > 0) {
                itensExibidos++;
                
                let dadosOficiais = TABELA_COMPRADOR[itemId];
                let nomeExibicao = dadosOficiais.nome || itemId;
                let valorVenda = dadosOficiais.valor_venda;
                let imgSrc = obterCaminhoImagemComprador(nomeExibicao);

                let cardHTML = `
    <div class="comprador-card" id="vitrine-item-${itemId}">
        <div class="quantidade-badge">${quantidade}x</div>
        <div class="comprador-img-container">
            <img src="${imgSrc}" alt="${nomeExibicao}" class="comprador-card-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div class="item-icon" style="display: none; font-size: 2rem;">${dadosOficiais.icone || '📦'}</div>
        </div>
        <div class="comprador-card-info">
            <h3>${nomeExibicao}</h3>
            <div class="preco-venda">
                <img src="../../../img/objeto_comun/moedas_de_ouro.jpg" alt="Ouro" class="moeda-img"> 
                <span>${valorVenda} Ouro</span>
            </div>
            <button class="btn-vender" onclick="venderDrop('${itemId}')">Vender 1</button>
        </div>
    </div>
`;
                grid.innerHTML += cardHTML;
            }
        }
    });

    if (itensExibidos === 0) {
        msgVazia.style.display = "block";
    } else {
        msgVazia.style.display = "none";
    }
}

function venderDrop(itemId) {
    let item = jogador.mochila[itemId];
    if (!item) return;

    let quantidade = item.quantidade || item.quantity || 0;
    if (quantidade <= 0) return;

    let valorVenda = TABELA_COMPRADOR[itemId] ? TABELA_COMPRADOR[itemId].valor_venda : 1;

    if (item.quantidade !== undefined) {
        item.quantidade--;
    } else if (item.quantity !== undefined) {
        item.quantity--;
    }

    if ((item.quantidade || item.quantity || 0) <= 0) {
        delete jogador.mochila[itemId];
    }

    if (!jogador.mochila["moedasdeouro"]) {
        jogador.mochila["moedasdeouro"] = {
            id: "moedasdeouro",
            nome: "Moedas de Ouro",
            tipo: "comum",
            descricao: "Uma moeda de ouro que serve para negociar coisas no mundo de DarCraker.",
            icone: "🪙",
            acumulavel: true,
            valor_venda: 0,
            quantidade: 0
        };
    }
    
    jogador.mochila["moedasdeouro"].quantidade += valorVenda;

    localStorage.setItem(`DarCraker_Slot_${slotAtivo}`, JSON.stringify(jogador));

    atualizarInterfaceOuro();
    renderizarVitrineVendas();
}

function toggleMenu() {
    let sidebar = document.getElementById("sidebar");
    if (sidebar) {
        sidebar.classList.toggle("active");
    }
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
    if (!jogador) {
        alert("Nenhum personagem encontrado para salvar!");
        return;
    }
    localStorage.setItem(`DarCraker_Slot_${slotAtivo}`, JSON.stringify(jogador));
    alert(`Progresso salvo com sucesso no Slot ${slotAtivo}!`);
}

function exportarSaveFisico() {
    if (!jogador) {
        alert("Nenhum personagem encontrado no slot ativo!");
        return;
    }

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