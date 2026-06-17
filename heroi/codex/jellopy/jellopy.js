// jellopy.js

let jogador = null;
let slotAtivo = null;

// Definição dos níveis do códex atualizada (14)
const configuracaoCodex = {
    1: { quantidadeRequerida: 10, bonusAtributo: "bonus_vida_maxima", valorBonus: 5, desc: "+5 de Vida Máxima" },
    2: { quantidadeRequerida: 20, bonusAtributo: "bonus_mana_maxima", valorBonus: 5, desc: "+5 de Mana Máxima" },
    3: { quantidadeRequerida: 30, bonusAtributo: "bonus_esquiva", valorBonus: 1, desc: "+1 de Esquiva" },
    4: { quantidadeRequerida: 40, bonusAtributo: "bonus_acerto", valorBonus: 1, desc: "+1 de Acerto" },
    5: { quantidadeRequerida: 50, bonusAtributo: "bonus_defesa_maxima", valorBonus: 1, desc: "+1 de Defesa Máxima" },
    6: { quantidadeRequerida: 60, bonusAtributo: "bonus_ataque_maximo", valorBonus: 1, desc: "+1 de Ataque Máximo" },
    7: { quantidadeRequerida: 70, bonusAtributo: "bonus_inteligencia", valorBonus: 1, desc: "+1 de Inteligência" },
    8: { quantidadeRequerida: 80, bonusAtributo: "bonus_precisao", valorBonus: 1, desc: "+1 de Precisão" },
    9: { quantidadeRequerida: 90, bonusAtributo: "bonus_vitalidade", valorBonus: 1, desc: "+1 de Vitalidade" },
    10: { quantidadeRequerida: 100, bonusAtributo: "bonus_agilidade", valorBonus: 1, desc: "+1 de Agilidade" },
    11: { quantidadeRequerida: 110, bonusAtributo: "bonus_defesa_minima", valorBonus: 1, desc: "+1 de Defesa Mínima" },
    12: { quantidadeRequerida: 120, bonusAtributo: "bonus_ataque_minimo", valorBonus: 1, desc: "+1 de Ataque Mínimo" },
    13: { quantidadeRequerida: 130, bonusAtributo: "bonus_protecao", valorBonus: 1, desc: "+1 de Proteção" },
    14: { quantidadeRequerida: 140, bonusAtributo: "bonus_forca", valorBonus: 1, desc: "+1 de Força" }
};

window.onload = function() {
    inicializarCodex();
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
// SALVAR E EXPORTAR BACKUP
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
            prompt("Não foi possível gerar o arquivo automaticamente. Copie seu Save:", textoJson);
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
        alert("Arquivo de backup gerado na pasta de Downloads!");
    }
}

// =========================================================================
// MECÂNICA E RENDERIZAÇÃO DO CÓDEX
// =========================================================================

function inicializarCodex() {
    slotAtivo = localStorage.getItem("DarCraker_Slot_Ativo");
    if (!slotAtivo) {
        window.location.href = "../../index.html";
        return;
    }

    jogador = JSON.parse(localStorage.getItem(`DarCraker_Slot_${slotAtivo}`));
    if (!jogador) return;

    // Garante que a estrutura do códex exista no save do jogador
    if (!jogador.codex) {
        jogador.codex = {};
    }
    if (jogador.codex.jellopy_nivel === undefined) {
        jogador.codex.jellopy_nivel = 1; // Inicia no nível 1 do códex
        jogador.codex.jellopy_progresso = 0; // Quantos jellopies já foram depositados
    }

    atualizarTelaCodex();
}

function atualizarTelaCodex() {
    let nivelAtual = jogador.codex.jellopy_nivel;
    let progressoAtual = jogador.codex.jellopy_progresso;
    
    let qtdMochila = 0;
    if (jogador.mochila && jogador.mochila["jellopy"]) {
        qtdMochila = jogador.mochila["jellopy"].quantidade;
    }
    document.getElementById("qtd-mochila").innerText = qtdMochila;

    // LIMITE ALTERADO: Agora o limite máximo finalizado é maior que 14
    if (nivelAtual > 14) {
        document.getElementById("codex-nivel").innerText = "14";
        document.getElementById("progresso-atual").innerText = "-";
        document.getElementById("progresso-requerido").innerText = "-";
        document.getElementById("codex-recompensa-desc").innerText = "Todos os bônus adquiridos com sucesso!";
        document.getElementById("container-acoes").style.display = "none";
        document.getElementById("msg-concluido").style.display = "block";
        return;
    }

    let config = configuracaoCodex[nivelAtual];

    document.getElementById("codex-nivel").innerText = nivelAtual;
    document.getElementById("progresso-atual").innerText = progressoAtual;
    document.getElementById("progresso-requerido").innerText = config.quantidadeRequerida;
    document.getElementById("codex-recompensa-desc").innerText = config.desc;
    
    document.getElementById("container-acoes").style.display = "block";
    document.getElementById("msg-concluido").style.display = "none";
}

function entregarJellopy(quantidade) {
    let nivelAtual = jogador.codex.jellopy_nivel;
    if (nivelAtual > 14) return; // ALTERADO PARA 14

    let config = configuracaoCodex[nivelAtual];
    
    if (!jogador.mochila || !jogador.mochila["jellopy"] || jogador.mochila["jellopy"].quantidade <= 0) {
        alert("Você não possui Jellopy na mochila para entregar!");
        return;
    }

    let jellopiesDisponiveis = jogador.mochila["jellopy"].quantidade;
    let limiteFaltante = config.quantidadeRequerida - jogador.codex.jellopy_progresso;
    
    let quantidadeParaEntregar = Math.min(quantidade, jellopiesDisponiveis, limiteFaltante);

    jogador.mochila["jellopy"].quantidade -= quantidadeParaEntregar;
    jogador.codex.jellopy_progresso += quantidadeParaEntregar;

    if (jogador.mochila["jellopy"].quantidade <= 0) {
        delete jogador.mochila["jellopy"];
    }

    if (jogador.codex.jellopy_progresso >= config.quantidadeRequerida) {
        let atributoBonus = config.bonusAtributo;
        let valorDoBonus = config.valorBonus;

        if (jogador[atributoBonus] === undefined) {
            jogador[atributoBonus] = 0;
        }
        jogador[atributoBonus] += valorDoBonus;

        // --- ATUALIZAÇÕES DIRETAS NA FICHA ---

        // NÍVEL 1
        if (atributoBonus === "bonus_vida_maxima") {
            jogador.vida_maxima += valorDoBonus;
            jogador.vida_atual += valorDoBonus;
        }
        // NÍVEL 2
        if (atributoBonus === "bonus_mana_maxima") {
            jogador.mana_maxima += valorDoBonus;
            jogador.mana_atual += valorDoBonus;
        }
        // NÍVEL 3
        if (atributoBonus === "bonus_esquiva") {
        if (jogador.esquiva !== undefined) jogador.esquiva += valorDoBonus;
        }
        // NÍVEL 4
        if (atributoBonus === "bonus_acerto") {
        if (jogador.acerto !== undefined) jogador.acerto += valorDoBonus;
        }
        // NÍVEL 5
        if (atributoBonus === "bonus_defesa_maxima") {
        if (jogador.defesa_maxima !== undefined) jogador.defesa_maxima += valorDoBonus;
        }
        // NÍVEL 6
        if (atributoBonus === "bonus_ataque_maximo") {
        if (jogador.ataque_maximo !== undefined) jogador.ataque_maximo += valorDoBonus;
        }
        // NÍVEL 7
        if (atributoBonus === "bonus_inteligencia") {
        let ganhoMana = valorDoBonus * 5; 
            jogador.vida_maxima = jogador.vida_maxima || 0;
            jogador.mana_maxima += ganhoMana;
            jogador.mana_current = jogador.mana_atual += ganhoMana; 
        }
        // NÍVEL 8
        if (atributoBonus === "bonus_precisao") {
        if (jogador.bonus_precisao === undefined) {
            jogador.bonus_precisao = 0;
           }
        }
        // NÍVEL 9
        if (atributoBonus === "bonus_vitalidade") {
        let ganhoVida = valorDoBonus * 10; // 1 de vitalidade concede 10 de vida
           jogador.vida_maxima += ganhoVida;
           jogador.vida_atual += ganhoVida;
        }
        // NÍVEL 10
        if (atributoBonus === "bonus_agilidade") {
        if (jogador.bonus_agilidade === undefined) {
            jogador.bonus_agilidade = 0;
           }
        }
        // NÍVEL 11
        if (atributoBonus === "bonus_defesa_minima") {
        if (jogador.defesa_minima !== undefined) {
            jogador.defesa_minima += valorDoBonus;
           }
        }
        // NÍVEL 12
        if (atributoBonus === "bonus_protecao") {
        if (jogador.bonus_protecao === undefined) {
            jogador.bonus_protecao = 0;
          }
        }
        // NÍVEL 13
        if (atributoBonus === "bonus_forca") {
        if (jogador.bonus_forca === undefined) {
            jogador.bonus_forca = 0;
          }
        }

        alert(`⭐ Fantástico! Você concluiu o Nível ${nivelAtual} do Códex do Jellopy e recebeu o bônus permanente de: ${config.desc}!`);

        jogador.codex.jellopy_nivel += 1;
        jogador.codex.jellopy_progresso = 0;
    }

    localStorage.setItem(`DarCraker_Slot_${slotAtivo}`, JSON.stringify(jogador));
    atualizarTelaCodex();
}

function entregarTudo() {
    let nivelAtual = jogador.codex.jellopy_nivel;
    if (nivelAtual > 14) return; // ALTERADO PARA 14

    let config = configuracaoCodex[nivelAtual];
    let limiteFaltante = config.quantidadeRequerida - jogador.codex.jellopy_progresso;

    entregarJellopy(limiteFaltante);
}