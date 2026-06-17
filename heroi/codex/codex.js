// =========================================================================
// CONTROLE DO MENU SIDEBAR (NATIVO E INDEPENDENTE - MENU CODEX)
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
// INJEÇÃO DINÂMICA DE NÍVEIS DOS ITENS DO CODEX
// =========================================================================
document.addEventListener("DOMContentLoaded", function () {
    let slotAtivo = localStorage.getItem("DarCraker_Slot_Ativo");
    let jogador = JSON.parse(localStorage.getItem(`DarCraker_Slot_${slotAtivo}`));

    // Mapeamento dos IDs das Badges com as chaves correspondentes no localStorage/Save
    const itensCodex = [
        { idBadge: "badge-codex-jellopy", chaveNivel: "jellopy_nivel", nivelMaximo: 14 },
        { idBadge: "badge-codex-luvas_simples", chaveNivel: "luvas_simples_nivel", nivelMaximo: 14 },
        { idBadge: "badge-codex-maca", chaveNivel: "maca_nivel", nivelMaximo: 14 },
        { idBadge: "badge-codex-moedas_de_ouro", chaveNivel: "moedas_de_ouro_nivel", nivelMaximo: 14 },
        { idBadge: "badge-codex-racao_tipo_1", chaveNivel: "racao_tipo_1_nivel", nivelMaximo: 14 },
        { idBadge: "badge-codex-zaleia", chaveNivel: "zaleia_nivel", nivelMaximo: 14 }
    ];

    // Varre cada item configurado
    itensCodex.forEach(item => {
        let elementoBadge = document.getElementById(item.idBadge);
        
        if (elementoBadge) {
            let nivelItem = 0; // Valor padrão inicial caso o item nunca tenha sido entregue

            // Valida se o herói possui dados válidos de Codex gravados
            if (jogador && jogador.codex && jogador.codex[item.chaveNivel] !== undefined) {
                nivelItem = jogador.codex[item.chaveNivel];
            }

            // Formatação de exibição do texto da Badge
            if (nivelItem > item.nivelMaximo) {
                elementoBadge.innerText = "MÁX";
                elementoBadge.style.color = "#000000"; // Muda para verde se estiver maximizado
                elementoBadge.style.borderColor = "#22c55e";
                elementoBadge.style.boxShadow = "0 0 5px rgba(34, 197, 94, 0.5)";
            } else {
                elementoBadge.innerText = `Nível. ${nivelItem}`;
            }
        }
    });
});