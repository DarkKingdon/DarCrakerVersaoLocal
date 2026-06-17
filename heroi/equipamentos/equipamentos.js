// equipamentos.js

let jogador = null;
let slotAtivo = null;

window.onload = function() {
    renderizarTelaEquipamentos();
};

function toggleMenu() {
    let sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("active");
}

// =========================================================================
// FUNÇÕES DE SUPORTE AO JOGADOR (SALVAR E EXPORTAR)
// =========================================================================
function salvarNoSlotAtual() {
    let slotAtivo = localStorage.getItem("DarCraker_Slot_Ativo");
    let jogador = JSON.parse(localStorage.getItem(`DarCraker_Slot_${slotAtivo}`));

    if (!jogador) {
        alert("Nenhum personagem encontrado para salvar!");
        return;
    }

    localStorage.setItem(`DarCraker_Slot_${slotAtivo}`, JSON.stringify(jogador));
    alert(`Progresso salvo com sucesso no Slot ${slotAtivo}!`);
}

function exportarSaveFisico() {
    let slotAtivo = localStorage.getItem("DarCraker_Slot_Ativo");
    let jogador = JSON.parse(localStorage.getItem(`DarCraker_Slot_${slotAtivo}`));

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

function renderizarTelaEquipamentos() {
    slotAtivo = localStorage.getItem("DarCraker_Slot_Ativo");
    if (!slotAtivo) {
        window.location.href = "../../index.html";
        return;
    }

    jogador = JSON.parse(localStorage.getItem(`DarCraker_Slot_${slotAtivo}`));
    if (!jogador) return;

    // Se o jogador não tiver a estrutura de equipamentos no objeto, cria ela
    if (!jogador.equipados) {
        jogador.equipados = {
            mao: null
        };
    }
    if (!jogador.mochila) jogador.mochila = {};

    atualizarSlotsEquipados();
    renderizarMochilaEquipaveis();
}

// Atualiza a visualização do que já está no corpo do herói
function atualizarSlotsEquipados() {
    const displayMao = document.getElementById("display-mao");
    const itemMao = jogador.equipados.mao;

    if (itemMao) {
        // Verifica se tem imagem, se não, usa o ícone/emoji
        let elementoVisual = itemMao.imagem 
            ? `<img src="${itemMao.imagem}" alt="${itemMao.nome}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; margin-bottom: 5px;">`
            : `<span style="font-size: 1.5rem;">${itemMao.icone}</span>`;

        displayMao.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                ${elementoVisual}
                <span style="color: #22c55e; font-size: 0.9rem;">${itemMao.nome}</span>
                <small style="color: #888; font-size: 0.7rem; margin-top: 2px;">Clique p/ desequipar</small>
            </div>
        `;
    } else {
        displayMao.innerText = "Vazio";
    }
}

// Renderiza na metade de baixo apenas itens do tipo "Equipamento" que estão na mochila
function renderizarMochilaEquipaveis() {
    const grid = document.getElementById("equipamentos-grid");
    grid.innerHTML = "";

    let temEquipamento = false;

    Object.keys(jogador.mochila).forEach(chave => {
        const item = jogador.mochila[chave];

        // Filtra para exibir apenas os equipamentos da mochila
        if (item.tipo === "Equipamento" && item.quantidade > 0) {
            temEquipamento = true;

            const slot = document.createElement("div");
            slot.className = "inventory-slot";
            slot.onclick = () => abrirModalEquip(item, chave);

            // Se o item tiver imagem, renderiza a tag img. Se não, usa o emoji.
            let conteudoSlot = item.imagem 
                ? `<img src="${item.imagem}" alt="${item.nome}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">`
                : `${item.icone || '📦'}`;

            slot.innerHTML = `
                ${conteudoSlot} 
                <div class="item-qty">${item.quantidade}</div>
            `;

            grid.appendChild(slot);
        }
    });

    if (!temEquipamento) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666; font-style: italic; padding: 20px 0;">Nenhum equipamento extra na mochila.</p>`;
    }
}

function abrirModalEquip(item, chaveMochila) {
    document.getElementById("modal-item-nome").innerText = item.nome;
    document.getElementById("modal-item-descricao").innerText = item.descricao;
    
    // ATUALIZAÇÃO: Puxa a imagem para o modal se ela existir, se não usa o emoji
    const modalIcon = document.getElementById("modal-item-icone");
    if (item.imagem) {
        modalIcon.innerHTML = `<img src="${item.imagem}" alt="${item.nome}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px;">`;
    } else {
        modalIcon.innerHTML = item.icone || "📦";
    }
    
    // Mostra os atributos do equipamento no modal
    let listaAtributos = "";
    if (item.bonus.vida_maxima > 0) listaAtributos += `❤️ +${item.bonus.vida_maxima} Vida Máxima <br>`;
    if (item.bonus.forca > 0) listaAtributos += `💪 +${item.bonus.forca} Força <br>`;
    if (item.bonus.protecao > 0) listaAtributos += `🛡️ +${item.bonus.protecao} Proteção <br>`;
    listaAtributos += `⚠️ Nível Mínimo: ${item.nivel_minimo}`;
    
    document.getElementById("modal-item-atributos").innerHTML = listaAtributos;

    const btn = document.getElementById("btn-action-equip");
    btn.onclick = () => equiparItem(item, chaveMochila);

    document.getElementById("equip-modal").style.display = "flex";
}

function fecharModal() {
    document.getElementById("equip-modal").style.display = "none";
}

function equiparItem(item, chaveMochila) {
    // 1. Validar Requisito de Nível
    if (jogador.nivel < item.nivel_minimo) {
        alert(`Você precisa ter nível ${item.nivel_minimo} para usar este item! Seu nível atual é ${Math.floor(jogador.nivel)}.`);
        fecharModal();
        return;
    }

    const slotAlvo = item.slot; // no caso das luvas, "mao"

    // 2. Se já existe um item equipado naquele slot, remove ele primeiro
    if (jogador.equipados[slotAlvo]) {
        desequiparSemSalvar(slotAlvo);
    }

    // 3. Coloca o item no slot equipado
    jogador.equipados[slotAlvo] = { ...item };

    // 4. Aplica os bônus ao herói permanentemente enquanto equipado
    // CORREÇÃO AQUI: Alimenta a propriedade de bônus e depois soma na vida máxima do jogador
    jogador.bonus_vida_maxima = (jogador.bonus_vida_maxima || 0) + item.bonus.vida_maxima;
    jogador.vida_maxima += item.bonus.vida_maxima;
    
    jogador.bonus_forca = (jogador.bonus_forca || 0) + item.bonus.forca;
    jogador.bonus_protecao = (jogador.bonus_protecao || 0) + item.bonus.protecao;
    
    // Cura a vida atual proporcionalmente ao ganho de vida maxima para não bugar
    jogador.vida_atual += item.bonus.vida_maxima;

    // 5. Remove 1 unidade dele da mochila
    jogador.mochila[chaveMochila].quantidade -= 1;
    if (jogador.mochila[chaveMochila].quantidade <= 0) {
        delete jogador.mochila[chaveMochila];
    }

    // Guardar mudanças no LocalStorage
    localStorage.setItem(`DarCraker_Slot_${slotAtivo}`, JSON.stringify(jogador));
    
    fecharModal();
    renderizarTelaEquipamentos();
    alert(`${item.nome} equipado com sucesso!`);
}

function removerEquipamento(slot) {
    if (!jogador.equipados || !jogador.equipados[slot]) return;
    
    if (confirm(`Deseja remover o item do slot ${slot}?`)) {
        desequiparSemSalvar(slot);
        localStorage.setItem(`DarCraker_Slot_${slotAtivo}`, JSON.stringify(jogador));
        renderizarTelaEquipamentos();
        alert("Item movido de volta para a mochila!");
    }
}

// Função auxiliar interna para reverter os atributos ao retirar o item
function desequiparSemSalvar(slot) {
    const item = jogador.equipados[slot];
    if (!item) return;

    // CORREÇÃO AQUI: Deduz o valor da propriedade de bônus e da vida máxima
    jogador.bonus_vida_maxima = Math.max(0, (jogador.bonus_vida_maxima || 0) - item.bonus.vida_maxima);
    jogador.vida_maxima -= item.bonus.vida_maxima;
    
    jogador.bonus_forca = Math.max(0, (jogador.bonus_forca || 0) - item.bonus.forca);
    jogador.bonus_protecao = Math.max(0, (jogador.bonus_protecao || 0) - item.bonus.protecao);
    
    if (jogador.vida_atual > jogador.vida_maxima) {
        jogador.vida_atual = jogador.vida_maxima;
    }

    // Devolve para a mochila
    const idItem = item.id;
    if (jogador.mochila[idItem]) {
        jogador.mochila[idItem].quantidade += 1;
    } else {
        jogador.mochila[idItem] = { ...item, quantidade: 1 };
    }

    // Esvazia o slot do corpo
    jogador.equipados[slot] = null;
}