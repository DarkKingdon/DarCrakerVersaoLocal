// =========================================================================
// CONTROLE DO MENU SIDEBAR (NATIVO E INDEPENDENTE - MENU MONSTROS)
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