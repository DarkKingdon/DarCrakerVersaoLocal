// status.js

window.onload = function() {
    atualizarTelaStatus();
};

// =========================================================================
// TABELA DE EXPERIÊNCIA (NÍVEL MÁXIMO 10)
// =========================================================================
const tabelaExperiencia = {
    1: 10,
    2: 21,
    3: 30,
    4: 43,
    5: 50,
    6: 59,
    7: 60,
    8: 80,
    9: 95,
    10: 100
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
// ATUALIZAÇÃO E LOGICA DE STATUS DO JOGADOR
// =========================================================================
function atualizarTelaStatus() {
    let slotAtivo = localStorage.getItem("DarCraker_Slot_Ativo");
    if (!slotAtivo) {
        window.location.href = "../../index.html";
        return;
    }

    let jogador = JSON.parse(localStorage.getItem(`DarCraker_Slot_${slotAtivo}`));
    if (!jogador) return;

    if (jogador.pontos_disponiveis === undefined) {
        jogador.pontos_disponiveis = 0;
    }

    jogador = verificarSubirDeNivel(jogador);

    // --- DECLARAÇÕES ÚNICAS DOS ATRIBUTOS TOTAIS ---
    let totalForca = jogador.forca + (jogador.bonus_forca || 0);
    let totalProtecao = jogador.protecao + (jogador.bonus_protecao || 0);
    let totalAgilidade = jogador.agilidade + (jogador.bonus_agilidade || 0);
    let totalPrecisao = jogador.precisao + (jogador.bonus_precisao || 0);
    let totalVitalidade = jogador.vitalidade + (jogador.bonus_vitalidade || 0);
    let totalInteligencia = jogador.inteligencia + (jogador.bonus_inteligencia || 0);

    let maestriaAtkMin = jogador.bonus_maestria_atk_min || 0;
    let maestriaAtkMax = jogador.bonus_maestria_atk_max || 0;
    let maestriaDefMin = jogador.bonus_maestria_def_min || 0;
    let maestriaDefMax = jogador.bonus_maestria_def_max || 0;

    let ataqueMinCalculado = (totalForca * 1) + maestriaAtkMin; 
    let ataqueMaxCalculado = (totalForca * 2) + maestriaAtkMax; 
    let defesaMinCalculado = (totalProtecao * 1) + maestriaDefMin; 
    let defesaMaxCalculado = (totalProtecao * 2) + maestriaDefMax; 
    let esquivaCalculada = totalAgilidade * 2; 
    let acertoCalculado = totalPrecisao * 2;

    let manaBaseHeroi = jogador.mana_base || 5; 
    let manaCalculadaManual = jogador.inteligencia * 5;
    let manaCalculadaCodex = (jogador.bonus_inteligencia || 0) * 5;
    let manaCalculadaDireta = (jogador.bonus_mana_maxima || 0);

    jogador.mana_maxima = manaBaseHeroi + manaCalculadaManual + manaCalculadaCodex + manaCalculadaDireta;

    if (jogador.mana_atual > jogador.mana_maxima) {
        jogador.mana_atual = jogador.mana_maxima;
    }

    // 🛡️ VERIFICAÇÕES DE SEGURANÇA (Se o elemento não existir na página, não gera erro)
    if (document.getElementById("display-nome")) document.getElementById("display-nome").innerText = jogador.nome;
    if (document.getElementById("display-nivel")) document.getElementById("display-nivel").innerText = Math.floor(jogador.nivel);
    if (document.getElementById("display-exp-atual")) document.getElementById("display-exp-atual").innerText = jogador.experiencia_atual;
    if (document.getElementById("display-exp-max")) document.getElementById("display-exp-max").innerText = jogador.experiencia_maxima;
    
    if (document.getElementById("display-pontos-totais")) document.getElementById("display-pontos-totais").innerText = jogador.pontos_disponiveis;
    if (document.getElementById("display-pontos-disponiveis")) document.getElementById("display-pontos-disponiveis").innerText = jogador.pontos_disponiveis;

    if (document.getElementById("display-vida-atual")) document.getElementById("display-vida-atual").innerText = jogador.vida_atual;
    if (document.getElementById("display-vida-max")) document.getElementById("display-vida-max").innerText = jogador.vida_maxima;
    if (document.getElementById("display-mana-atual")) document.getElementById("display-mana-atual").innerText = jogador.mana_atual;
    if (document.getElementById("display-mana-max")) document.getElementById("display-mana-max").innerText = jogador.mana_maxima;
    
    if (document.getElementById("display-forca")) document.getElementById("display-forca").innerText = totalForca;
    if (document.getElementById("display-protecao")) document.getElementById("display-protecao").innerText = totalProtecao;
    if (document.getElementById("display-agilidade")) document.getElementById("display-agilidade").innerText = totalAgilidade;
    if (document.getElementById("display-precisao")) document.getElementById("display-precisao").innerText = totalPrecisao;
    if (document.getElementById("display-vitalidade")) document.getElementById("display-vitalidade").innerText = totalVitalidade;
    if (document.getElementById("display-inteligencia")) document.getElementById("display-inteligencia").innerText = totalInteligencia;
    
    if (document.getElementById("display-esquiva")) document.getElementById("display-esquiva").innerText = esquivaCalculada + (jogador.bonus_esquiva || 0);
    if (document.getElementById("display-acerto")) document.getElementById("display-acerto").innerText = acertoCalculado + (jogador.bonus_acerto || 0);

    if (document.getElementById("display-ataque-min")) document.getElementById("display-ataque-min").innerText = ataqueMinCalculado + (jogador.bonus_ataque_minimo || 0);
    if (document.getElementById("display-ataque-max")) document.getElementById("display-ataque-max").innerText = ataqueMaxCalculado + (jogador.bonus_ataque_maximo || 0);
    if (document.getElementById("display-defesa-min")) document.getElementById("display-defesa-min").innerText = defesaMinCalculado + (jogador.bonus_defesa_minima || 0);
    if (document.getElementById("display-defesa-max")) document.getElementById("display-defesa-max").innerText = defesaMaxCalculado + (jogador.bonus_defesa_maxima || 0);

    // --- EXIBIR ATRIBUTOS BÔNUS NA TELA ---
    if (document.getElementById("bonus-vida-max")) document.getElementById("bonus-vida-max").innerText = jogador.bonus_vida_maxima || 0;
    if (document.getElementById("bonus-mana-max")) document.getElementById("bonus-mana-max").innerText = jogador.bonus_mana_maxima || 0;
    if (document.getElementById("bonus-forca")) document.getElementById("bonus-forca").innerText = jogador.bonus_forca || 0;
    if (document.getElementById("bonus-protecao")) document.getElementById("bonus-protecao").innerText = jogador.bonus_protecao || 0;
    if (document.getElementById("bonus-agilidade")) document.getElementById("bonus-agilidade").innerText = jogador.bonus_agilidade || 0;
    if (document.getElementById("bonus-precisao")) document.getElementById("bonus-precisao").innerText = jogador.bonus_precisao || 0;
    if (document.getElementById("bonus-vitalidade")) document.getElementById("bonus-vitalidade").innerText = jogador.bonus_vitalidade || 0;
    if (document.getElementById("bonus-inteligencia")) document.getElementById("bonus-inteligencia").innerText = jogador.bonus_inteligencia || 0;
    if (document.getElementById("bonus-ataque-min")) document.getElementById("bonus-ataque-min").innerText = jogador.bonus_ataque_minimo || 0;
    if (document.getElementById("bonus-ataque-max")) document.getElementById("bonus-ataque-max").innerText = jogador.bonus_ataque_maximo || 0;
    if (document.getElementById("bonus-defesa-min")) document.getElementById("bonus-defesa-min").innerText = jogador.bonus_defesa_minima || 0;
    if (document.getElementById("bonus-defesa-max")) document.getElementById("bonus-defesa-max").innerText = jogador.bonus_defesa_maxima || 0;
    if (document.getElementById("bonus-esquiva")) document.getElementById("bonus-esquiva").innerText = jogador.bonus_esquiva || 0;
    if (document.getElementById("bonus-acerto")) document.getElementById("bonus-acerto").innerText = jogador.bonus_acerto || 0;

    // CONTROLE DOS BOTÕES DE ADICIONAR E PAINEL DE AVISO
    let botoes = document.querySelectorAll(".btn-add");
    let painelPontos = document.getElementById("panel-pontos");

    if (jogador.pontos_disponiveis > 0) {
        botoes.forEach(btn => btn.style.display = "inline-block");
        if (painelPontos) painelPontos.style.display = "block";
    } else {
        botoes.forEach(btn => btn.style.display = "none");
        if (painelPontos) painelPontos.style.display = "none";
    }
}

// =========================================================================
// FUNÇÃO DE VERIFICAÇÃO DE LEVEL UP
// =========================================================================
function verificarSubirDeNivel(jogador) {
    let subiu = false;

    while (jogador.nivel < 10 && jogador.experiencia_atual >= jogador.experiencia_maxima) {
        jogador.experiencia_atual -= jogador.experiencia_maxima;
        jogador.nivel += 1;
        jogador.pontos_disponiveis += 1;
        
        jogador.experiencia_maxima = tabelaExperiencia[jogador.nivel];
        subiu = true;

        jogador.vida_atual = jogador.vida_maxima;
        jogador.mana_atual = jogador.mana_maxima;

        alert(`✨ Parabéns! Você subiu para o Nível ${jogador.nivel}! Sua Vida e Mana foram totalmente restauradas e você ganhou 1 ponto de atributo.`);
    }

    if (jogador.nivel >= 10) {
        jogador.nivel = 10;
        jogador.experiencia_atual = 0;
        jogador.experiencia_maxima = tabelaExperiencia[10];
    }

    if (subiu) {
        let slotAtivo = localStorage.getItem("DarCraker_Slot_Ativo");
        localStorage.setItem(`DarCraker_Slot_${slotAtivo}`, JSON.stringify(jogador));
    }

    return jogador;
}

// =========================================================================
// FUNÇÃO PARA DISTRIBUIR OS PONTOS
// =========================================================================
function adicionarAtributo(atributo) {
    let slotAtivo = localStorage.getItem("DarCraker_Slot_Ativo");
    let jogador = JSON.parse(localStorage.getItem(`DarCraker_Slot_${slotAtivo}`));

    if (!jogador || !jogador.pontos_disponiveis || jogador.pontos_disponiveis <= 0) {
        return; 
    }

    if (jogador[atributo] !== undefined) {
        jogador[atributo] += 1;
        jogador.pontos_disponiveis -= 1;

        if (atributo === 'vitalidade') { 
            jogador.vida_maxima += 10; 
            jogador.vida_atual += 10; 
        }
        if (atributo === 'inteligencia') { 
            jogador.mana_maxima += 5; 
            jogador.mana_atual += 5; 
        }

        localStorage.setItem(`DarCraker_Slot_${slotAtivo}`, JSON.stringify(jogador));
        atualizarTelaStatus();
    }
}