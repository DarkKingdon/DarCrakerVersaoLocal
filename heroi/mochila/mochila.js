let jogador = null;
let slotAtivo = null;

window.onload = function() {
    renderizarMochila();
};

// =========================================================================
// CONTROLE DO MENU SIDEBAR (NATIVO E INDEPENDENTE)
// =========================================================================
function toggleMenu() {
    let sidebar = document.getElementById("sidebar");
    if (sidebar) {
        sidebar.classList.toggle("active");
    }
}

// Fecha o menu se clicar fora dele
document.addEventListener('click', function(event) {
    let sidebar = document.getElementById("sidebar");
    let menuToggle = document.querySelector(".menu-toggle");
    
    if (sidebar && sidebar.classList.contains('active')) {
        if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// =========================================================================
// FUNÇÕES DE SUPORTE AO JOGADOR (SALVAR E EXPORTAR)
// =========================================================================
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

// =========================================================================
// RENDERIZAÇÃO DA MOCHILA E MECÂNICAS
// =========================================================================

function obterCaminhoImagemIndependente(nomeItem) {
    if (!nomeItem) return null;
    
    const nomeFormatado = nomeItem.toLowerCase().trim();

    switch(nomeFormatado) {
        case "jellopy":
            return "../../img/objeto_comun/jellopy.jpg";
            
            case "luvas simples":
            return "../../img/equipamentos/luvas_simples.jpg";

        case "moedas de ouro":
        case "moeda de ouro":
            return "../../img/objeto_comun/moedas_de_ouro.jpg";
            
            case "lora":
            return "../../img/objeto_comun/lora.jpg";


        case "zaleia":
            return "../../img/objeto_comun/zaleia.jpg";

           // Adicionado as duas variações para garantir que a imagem apareça na mochila
        case "ração tipo 1":
        case "racao tipo 1":
            return "../../img/objeto_comun/racao_tipo_1.jpg";
            
            case "sangue tipo 1":
            return "../../img/objeto_comun/sangue_tipo_1.jpg";

        case "maçã":
        case "maca":
            return "../../img/objeto_consumivel/maca.jpg";

            
        default:
            return `../../img/objeto_comun/${nomeFormatado}.jpg`;
    }
}

function renderizarMochila() {
    slotAtivo = localStorage.getItem("DarCraker_Slot_Ativo");
    if (!slotAtivo) {
        window.location.href = "../../index.html";
        return;
    }

    jogador = JSON.parse(localStorage.getItem(`DarCraker_Slot_${slotAtivo}`));
    const grid = document.getElementById("mochila-grid");
    grid.innerHTML = ""; 

    if (!jogador || !jogador.mochila || Object.keys(jogador.mochila).length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666; font-style: italic; padding: 40px 0;">Sua mochila está completamente vazia...</p>`;
        return;
    }

    Object.keys(jogador.mochila).forEach(chave => {
        const item = jogador.mochila[chave];
        
        if (item.quantidade <= 0) return;

        const slot = document.createElement("div");
        slot.className = "inventory-slot";
        slot.onclick = () => abrirModal(item);

        const imagemReal = obterCaminhoImagemIndependente(item.nome);
        let exibicaoVisual = "";

        if (imagemReal) {
            exibicaoVisual = `<img src="${imagemReal}" alt="${item.nome}" class="slot-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                              <div class="item-icon" style="display: none;">${item.icone || '📦'}</div>`;
        } else {
            exibicaoVisual = `<div class="item-icon">${item.icone || '📦'}</div>`;
        }

        slot.innerHTML = `
            ${exibicaoVisual}
            <div class="item-qty">${item.quantidade}</div>
        `;

        grid.appendChild(slot);
    });
}

function abrirModal(item) {
    const modalIconeContainer = document.getElementById("modal-item-icone");
    const imagemTratada = obterCaminhoImagemIndependente(item.nome);

    if (imagemTratada) {
        modalIconeContainer.innerHTML = `<img src="${imagemTratada}" alt="${item.nome}" style="width: 80px; height: 80px; object-fit: contain; image-rendering: pixelated;" onerror="this.parentElement.innerHTML='<div class=\'item-icon\'>${item.icone || '📦'}</div>';">`;
    } else {
        modalIconeContainer.innerHTML = `<div class="item-icon">${item.icone || '📦'}</div>`;
    }

    document.getElementById("modal-item-nome").innerText = item.nome;
    document.getElementById("modal-item-tipo").innerText = item.tipo || "Comum";
    document.getElementById("modal-item-descricao").innerText = item.descricao || "Sem descrição disponível.";
    document.getElementById("modal-item-qtd").innerText = item.quantidade;
    
    // --- NOVA LÓGICA PARA PEGAR O VALOR DINÂMICO ---
    // Padroniza a chave do item (ex: "Luvas Simples" vira "luvas_simples") para bater com a tabela
    const chaveItem = item.nome.toLowerCase().trim().replace(/ /g, "_").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    let valorUnitario = 0;

    // Procura na TABELA_COMPRADOR se ela existir, senão usa o valor padrão do próprio item
    if (typeof TABELA_COMPRADOR !== "undefined" && TABELA_COMPRADOR[chaveItem]) {
        valorUnitario = TABELA_COMPRADOR[chaveItem].valor_venda;
    } else {
        valorUnitario = item.valor_venda || 0; 
    }

    // Calcula o valor total baseado na quantidade que o jogador tem na mochila
    document.getElementById("modal-item-valor").innerText = valorUnitario * item.quantidade;
    // ------------------------------------------------

    document.getElementById("item-modal").style.display = "flex";
}


function fecharModal() {
    document.getElementById("item-modal").style.display = "none";
}