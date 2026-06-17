// =========================================================================
// CONTROLE DO MENU SIDEBAR (NATIVO E INDEPENDENTE - MENU MASCOTES)
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
// FUNÇÕES DE SALVAMENTO E BACKUP
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

// =========================================================================
// CONTROLE DE DESBLOQUEIO E EXIBIÇÃO DE NÍVEL DOS MASCOTES
// =========================================================================
document.addEventListener("DOMContentLoaded", function () {
    // 1. Recupera o slot ativo e os dados do jogador do localStorage
    let slotAtivo = localStorage.getItem("DarCraker_Slot_Ativo");
    let jogador = JSON.parse(localStorage.getItem(`DarCraker_Slot_${slotAtivo}`));

    // Se não encontrar o jogador (por segurança), assume nível 1
    let nivelAtual = jogador && jogador.nivel ? jogador.nivel : 1;

    // ==========================================
    // VERIFICAÇÃO E ATUALIZAÇÃO DO TOBY (NÍVEL 5)
    // ==========================================
    let cardToby = document.getElementById("mascote-toby");
    if (cardToby) {
        let nivelNecessarioToby = 5;

        if (nivelAtual < nivelNecessarioToby) {
            cardToby.classList.add("bloqueado");
            let infoTexto = cardToby.querySelector(".codex-card-info h3");
            if (infoTexto) {
                infoTexto.innerHTML = `<i class="fas fa-lock"></i> Nív. ${nivelNecessarioToby}`;
            }
        } else {
            // Se o Toby estiver DESBLOQUEADO, atualiza a badge com o nível real dele
            let badgeToby = document.getElementById("badge-nivel-toby");
            if (badgeToby && jogador && jogador.codex) {
                let nivelToby = jogador.codex.toby_nivel !== undefined ? jogador.codex.toby_nivel : 1;
                
                if (nivelToby > 14) {
                    badgeToby.innerText = "Máx";
                } else {
                    badgeToby.innerText = `Nível. ${nivelToby}`;
                }
            }
        }
    }

    // ==========================================
    // VERIFICAÇÃO E ATUALIZAÇÃO DO DANTE (NÍVEL 10)
    // ==========================================
    let cardDante = document.getElementById("mascote-dante");
    if (cardDante) {
        let nivelNecessarioDante = 10;

        if (nivelAtual < nivelNecessarioDante) {
            cardDante.classList.add("bloqueado");
            let infoTexto = cardDante.querySelector(".codex-card-info h3");
            if (infoTexto) {
                infoTexto.innerHTML = `<i class="fas fa-lock"></i> Nív. ${nivelNecessarioDante}`;
            }
        } else {
            // Se o Dante estiver DESBLOQUEADO, atualiza a badge com o nível real dele
            let badgeDante = document.getElementById("badge-nivel-dante");
            if (badgeDante && jogador && jogador.codex) {
                let nivelDante = jogador.codex.dante_nivel !== undefined ? jogador.codex.dante_nivel : 1;
                
                // Se no save estiver 15 significa que ele maximizou o nível 14
                if (nivelDante > 14) {
                    badgeDante.innerText = "Máx";
                    
                } else {
                    badgeDante.innerText = `Nível. ${nivelDante}`;
                }
            }
        }
    }
});