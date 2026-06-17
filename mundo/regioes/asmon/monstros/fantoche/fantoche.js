// fantoche.js

let jogador = null;
let slotAtivo = null;
let fantoche = {
    nome: "Fantoche",
    imagem: "../../img/monstros/fantoche.jpg",
    nivel: 1,
    vida_maxima: 7000000000000,
    vida_atual: 7000000000000,
    ataque_minimo: 0,
    ataque_maximo: 0,
    defesa_minima: 0,
    defesa_maxima: 0,
    recompensa_exp: 0
};

// Variáveis de controle do Temporizador Automático
let emCombate = false;
let loopTemporizador = null;
let tempoAtualMs = 0;
const tempoTotalTurnoMs = 3000; // 3 segundos para encher a barra
const intervaloAtualizacaoMs = 30; // Atualiza a barra a cada 30ms para ficar fluida

window.onload = function() {
    carregarDados(); // Carrega os dados do herói e atualiza o HP na tela
    
    // Inicia o combate automaticamente após 400 milissegundos
    setTimeout(() => {
        alternarCombate();
    }, 400);
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
// MECÂNICAS DE JOGO E COMBATE
// =========================================================================

function carregarDados() {
    slotAtivo = localStorage.getItem("DarCraker_Slot_Ativo");
    if (!slotAtivo) {
        window.location.href = "../../index.html";
        return;
    }

    jogador = JSON.parse(localStorage.getItem(`DarCraker_Slot_${slotAtivo}`));
    if (!jogador) return;

    // Inicializa interface do Herói
    document.getElementById("hero-nome").innerText = jogador.nome;
    document.getElementById("hero-nivel").innerText = Math.floor(jogador.nivel);
    atualizarInterfaceHP();
}

function atualizarInterfaceHP() {
    // Atualiza Herói
    let porcetagemHP_Heroi = (jogador.vida_atual / jogador.vida_maxima) * 100;
    document.getElementById("hero-hp-bar").style.width = `${Math.max(0, porcetagemHP_Heroi)}%`;
    document.getElementById("hero-hp-texto").innerText = `${jogador.vida_atual}/${jogador.vida_maxima}`;

    // Atualiza Fantoche
    let porcetagemHP_Fantoche = (fantoche.vida_atual / fantoche.vida_maxima) * 100;
    document.getElementById("monster-hp-bar").style.width = `${Math.max(0, porcetagemHP_Fantoche)}%`;
    document.getElementById("monster-hp-texto").innerText = `${fantoche.vida_atual}/${fantoche.vida_maxima}`;
}

function registrarLog(texto, cor = "#fff") {
    const logBox = document.getElementById("combat-log");
    const novoParagrafo = document.createElement("p");
    novoParagrafo.style.color = cor;
    novoParagrafo.innerHTML = texto;
    logBox.appendChild(novoParagrafo);
    logBox.scrollTop = logBox.scrollHeight;
}

function alternarCombate() {
    const btn = document.getElementById("btn-atacar");

    if (!emCombate) {
        emCombate = true;
        btn.innerText = "⏸ PAUSAR COMBATE";
        btn.classList.add("btn-combatendo");
        registrarLog(`⚔️ Você entrou em postura de combate automático!`, "#eab308");
        iniciarCronometroAcao();
    } else {
        pararCronometroAcao();
        emCombate = false;
        btn.innerText = "⚔️ ATACAR";
        btn.classList.remove("btn-combatendo");
        document.getElementById("timer-texto").innerText = "Combate pausado";
        registrarLog(`⏸ Combate pausado.`, "#aaa");
    }
}

function iniciarCronometroAcao() {
    if (!emCombate) return;

    document.getElementById("timer-texto").innerText = "Preparando ataque...";
    
    loopTemporizador = setInterval(() => {
        tempoAtualMs += intervaloAtualizacaoMs;
        
        let porcentagemBarra = (tempoAtualMs / tempoTotalTurnoMs) * 100;
        document.getElementById("action-timer-bar").style.width = `${Math.min(100, porcentagemBarra)}%`;

        if (tempoAtualMs >= tempoTotalTurnoMs) {
            pararCronometroAcao();
            executarTurnoAutomatico();
        }
    }, intervaloAtualizacaoMs);
}

function pararCronometroAcao() {
    clearInterval(loopTemporizador);
    loopTemporizador = null;
}

function resetarCronometroAcao() {
    tempoAtualMs = 0;
    document.getElementById("action-timer-bar").style.width = "0%";
}

function executarTurnoAutomatico() {
    document.getElementById("timer-texto").innerText = "💥 COMBATENDO! 💥";

    // --- RECALCULAR ATRIBUTOS DE ATAQUE BASEADO NA FORÇA ATUAL ---
    let totalForca = jogador.forca + (jogador.bonus_forca || 0);
    
    // Aplica a mesma fórmula da tela de status
    let ataqueMinCalculado = totalForca * 1; 
    let ataqueMaxCalculado = totalForca * 2; 

    // Agora somamos os bônus diretos de ataque (de armas/equipamentos, se houver)
    let atkMinHeroi = ataqueMinCalculado + (jogador.bonus_ataque_minimo || 0);
    let atkMaxHeroi = ataqueMaxCalculado + (jogador.bonus_ataque_maximo || 0);
    
    // Sorteia o dano dentro do intervalo correto (ex: de 2 a 4)
    let danoHeroi = Math.floor(Math.random() * (atkMaxHeroi - atkMinHeroi + 1)) + atkMinHeroi;
    
    // --- TURNO DO JOGADOR ---
    let defMonstro = Math.floor(Math.random() * (fantoche.defesa_maxima - fantoche.defesa_minima + 1)) + fantoche.defesa_minima;
    let danoFinalNoFantoche = Math.max(1, danoHeroi - defMonstro);

    fantoche.vida_atual -= danoFinalNoFantoche;
    if (fantoche.vida_atual < 0) fantoche.vida_atual = 0;

    registrarLog(`⚔️ **${jogador.nome}** atacou **Fantoche** e causou **${danoFinalNoFantoche}** de dano!`, "#00ffff");
    atualizarInterfaceHP();

    if (fantoche.vida_atual <= 0) {
        vitoria();
        return;
    }

    // --- TURNO DO MONSTRO ---
    setTimeout(() => {
        if (fantoche.vida_atual <= 0) return; 

        let danoMonstro = Math.floor(Math.random() * (fantoche.ataque_maximo - fantoche.ataque_minimo + 1)) + fantoche.ataque_minimo;
        
        // Recalcula a defesa baseada nos pontos de Proteção atuais do jogador
        let totalProtecao = jogador.protecao + (jogador.bonus_protecao || 0);
        let defesaMinCalculada = totalProtecao * 1;
        let defesaMaxCalculada = totalProtecao * 2;

        let defMinHeroi = defesaMinCalculada + (jogador.bonus_defesa_minima || 0);
        let defMaxHeroi = defesaMaxCalculada + (jogador.bonus_defesa_maxima || 0);
        let defHeroi = Math.floor(Math.random() * (defMaxHeroi - defMinHeroi + 1)) + defMinHeroi;
        
        let danoFinalNoHeroi = Math.max(0, danoMonstro - defHeroi); // fais o fantoche tirar 0 por ele e um fantoche para testar o dano do jogador

        jogador.vida_atual -= danoFinalNoHeroi;
        if (jogador.vida_atual < 0) jogador.vida_atual = 0;

        registrarLog(`💥 **Fantoche** contra-atacou e causou **${danoFinalNoHeroi}** de dano em você!`, "#a855f7");
        atualizarInterfaceHP();

        if (jogador.vida_atual <= 0) {
            derrota();
        } else {
            if (emCombate) {
                resetarCronometroAcao();
                setTimeout(() => {
                    iniciarCronometroAcao();
                }, 400);
            }
        }
    }, 600);
}


function verificarSubirDeNivel(jogador) {
    let subiu = false;

    // Tabela de experiência local para a verificação funcionar nesta tela
    const tabelaExperiencia = {
        1: 10, 2: 21, 3: 30, 4: 43, 5: 50, 6: 59, 7: 60, 8: 80, 9: 95, 10: 100
    };

    while (jogador.nivel < 10 && jogador.experiencia_atual >= jogador.experiencia_maxima) {
        jogador.experiencia_atual -= jogador.experiencia_maxima;
        jogador.nivel += 1;
        jogador.pontos_disponiveis += 1;
        
        jogador.experiencia_maxima = tabelaExperiencia[jogador.nivel];
        subiu = true;

        jogador.vida_atual = jogador.vida_maxima;
        // Se houver mana no seu sistema, descomente a linha abaixo:
        // jogador.mana_atual = jogador.mana_maxima;

        alert(`✨ Parabéns! Você subiu para o Nível ${jogador.nivel}! Sua Vida foi totalmente restaurada e você ganhou 1 ponto de atributo.`);
    }

    if (jogador.nivel >= 10) {
        jogador.nivel = 10;
        jogador.experiencia_atual = 0;
        jogador.experiencia_maxima = tabelaExperiencia[10];
    }

    return { jogador, subiu };
}

function vitoria() {
    emCombate = false;
    pararCronometroAcao();
    document.getElementById("btn-atacar").disabled = true;
    document.getElementById("timer-texto").innerText = "Vitória!";
    
    registrarLog(`🎉 **Fantoche foi derrotado!**`, "#22c55e");
    
    jogador.experiencia_atual += fantoche.recompensa_exp;
    registrarLog(`✨ Você ganhou **${fantoche.recompensa_exp}** pontos de EXP!`, "#eab308");

    // === NOVA LINHA ADICIONADA: VERIFICA SE SUBIU DE NÍVEL ===
    let resultadoNivel = verificarSubirDeNivel(jogador);
    jogador = resultadoNivel.jogador; // Atualiza o objeto jogador com o novo nível se mudou
    
    if (resultadoNivel.subiu) {
        document.getElementById("hero-nivel").innerText = Math.floor(jogador.nivel); // Atualiza o nível na tela de combate
        atualizarInterfaceHP(); // Atualiza a barra de vida cheia na interface do combate
    }








    // === GARANTE QUE A MOCHILA EXISTE AMBOS OS DROPS ===
    if (!jogador.mochila) jogador.mochila = {};

    // --- SISTEMA DE DROP 1: JELLOPY ---
    let chanceDrop = Math.random() * 100;
    if (chanceDrop <= 100) { 
        let quantJellopy = Math.floor(Math.random() * 2) + 1; 
        if (jogador.mochila["jellopy"]) {
            jogador.mochila["jellopy"].quantidade += quantJellopy;
        } else {
            let dadosJellopy = (typeof tabelaItensComuns !== 'undefined') ? tabelaItensComuns.jellopy : {
                id: "jellopy",
                nome: "Jellopy",
                tipo: "comum",
                descricao: "Um fragmento cristalino e gelatinoso. Muito comum em criaturas pequenas.",
                icone: "💎",
                imagem: "../../img/objeto_comun/jellopy.jpg", 
                acumulavel: true,
                valor_venda: 1
            };
            jogador.mochila["jellopy"] = { ...dadosJellopy, quantidade: quantJellopy };
        }
        registrarLog(`📦 **Drop:** Você encontrou ${quantJellopy}x **Jellopy**!`, "#a855f7");
    }

    // --- SISTEMA DE DROP 2: MAÇÃ ---
    let chanceDropMaca = Math.random() * 100;
    if (chanceDropMaca <= 100) { 
        let quantMaca = Math.floor(Math.random() * 2) + 1; 
        if (jogador.mochila["maca"]) {
            jogador.mochila["maca"].quantidade += quantMaca;
        } else {
            let dadosMaca = (typeof tabelaItensConsumiveis !== 'undefined') ? tabelaItensConsumiveis.maca : {
                id: "maca",
                nome: "Maçã",
                tipo: "consumivel",
                descricao: "Uma maçã bem vermelha e suculenta. Restaura 5 de vida ao ser consumida.",
                icone: "🍎",
                imagem: "../../img/objeto_consumivel/maca.jpg", 
                acumulavel: true,
                valor_venda: 1,
                restauracao_vida: 5
            };
            jogador.mochila["maca"] = { ...dadosMaca, quantidade: quantMaca };
        }
        registrarLog(`🍎 **Drop:** Você encontrou ${quantMaca}x **Maçã**!`, "#22c55e");
    }

    // --- SISTEMA DE DROP 3: MOEDAS DE OURO ---
    let chanceDropMoedas = Math.random() * 100;
    if (chanceDropMoedas <= 100) { 
        let quantMoedas = Math.floor(Math.random() * 2) + 1; 
        if (jogador.mochila["moedasdeouro"]) {
            jogador.mochila["moedasdeouro"].quantidade += quantMoedas;
        } else {
            let dadosMoedas = (typeof tabelaItensComuns !== 'undefined') ? tabelaItensComuns.moedasdeouro : {
                id: "moedasdeouro",
                nome: "Moedas de Ouro",
                tipo: "comum",
                descricao: "Uma moeda de ouro que serve para negociar coisas no mundo de DarCraker.",
                icone: "🪙",
                imagem: "../../img/objeto_comun/moedas_de_ouro.jpg", 
                acumulavel: true,
                valor_venda: 0
            };
            jogador.mochila["moedasdeouro"] = { ...dadosMoedas, quantidade: quantMoedas };
        }
        registrarLog(`💰 **Drop:** Você encontrou ${quantMoedas}x **Moedas de Ouro**!`, "#f59e0b");
    }

    // --- SISTEMA DE DROP 4: ZALEIA ---
    let chanceDropZaleia = Math.random() * 100;
    if (chanceDropZaleia <= 100) { 
        let quantZaleia = Math.floor(Math.random() * 2) + 1; 
        if (jogador.mochila["zaleia"]) {
            jogador.mochila["zaleia"].quantidade += quantZaleia;
        } else {
            let dadosZaleia = (typeof tabelaItensComuns !== 'undefined') ? tabelaItensComuns.zaleia : {
                id: "zaleia",
                nome: "Zaleia",
                tipo: "comum",
                descricao: "Uma planta de coloração avermelhada, com propriedades misteriosas.",
                icone: "🌿",
                imagem: "../../img/objeto_comun/zaleia.jpg", 
                acumulavel: true,
                valor_venda: 1
            };
            jogador.mochila["zaleia"] = { ...dadosZaleia, quantidade: quantZaleia };
        }
        registrarLog(`📦 **Drop:** Você encontrou ${quantZaleia}x **Zaleia**!`, "#a855f7");
    }

    // --- SISTEMA DE DROP 5: LUVAS SIMPLES ---
let chanceDropLuvas = Math.random() * 100;
if (chanceDropLuvas <= 100) { 
    let quantLuvas = Math.floor(Math.random() * 2) + 1; 
    if (jogador.mochila["luvas_simples"]) {
        // Se já existir, adiciona na propriedade correta
        if (jogador.mochila["luvas_simples"].quantidade !== undefined) {
            jogador.mochila["luvas_simples"].quantidade += quantLuvas;
        } else {
            jogador.mochila["luvas_simples"].quantidade = quantLuvas;
        }
    } else {
        let dadosLuvas = {
            id: "luvas_simples",
            nome: "Luvas Simples",
            slot: "mao",
            nivel_minimo: 2,
            descricao: "Luvas de couro desgastadas que oferecem uma leve proteção e aderência.",
            icone: "🧤",
            imagem: "../../img/equipamentos/luvas_simples.jpg", 
            tipo: "Equipamento",
            valor_venda: 1,
            bonus: {
                vida_maxima: 5,
                forca: 0,
                protecao: 0
            }
        };
        // CORREÇÃO AQUI: Mudado de quantity para quantidade
        jogador.mochila["luvas_simples"] = { ...dadosLuvas, quantidade: quantLuvas }; 
    }
    registrarLog(`🧤 **Drop Raro:** Você encontrou ${quantLuvas}x **Luvas Simples**!`, "#22c55e");
}

    // --- SISTEMA DE DROP 6: RAÇÃO TIPO 1 (MASCÔTE TOBY) ---
    let chanceDropRacao = Math.random() * 100;
    if (chanceDropRacao <= 100) { 
        let quantRacao = Math.floor(Math.random() * 2) + 1; 
        if (jogador.mochila["racao_tipo_1"]) {
            jogador.mochila["racao_tipo_1"].quantidade += quantRacao;
        } else {
            let dadosRacao = (typeof tabelaItensComuns !== 'undefined') ? tabelaItensComuns.racao_tipo_1 : {
                id: "racao_tipo_1",
                nome: "Ração Tipo 1",
                tipo: "comum",
                descricao: "Uma ração nutritiva ideal para fortalecer o mascote Toby.",
                icone: "🍖",
                imagem: "../../../../../img/objeto_comun/racao_tipo_1.jpg", 
                acumulavel: true,
                valor_venda: 1
            };
            jogador.mochila["racao_tipo_1"] = { ...dadosRacao, quantidade: quantRacao };
        }
        registrarLog(`🍖 **Drop:** Você encontrou ${quantRacao}x **Ração Tipo 1**!`, "#ffaa00");
    }
    
           // --- SISTEMA DE DROP 1: Sangue Tipo 1 ---
    let chanceDropSangue = Math.random() * 100;
    if (chanceDropSangue <= 6) { // 6% de chance dro drop
        let quantSangue = Math.floor(Math.random() * 1) + 1; 
        if (jogador.mochila["sangue_tipo_1"]) {
            jogador.mochila["sangue_tipo_1"].quantidade += quantSangue;
        } else {
            let dadosSangue = (typeof tabelaItensComuns !== 'undefined') ? tabelaItensComuns.sangue_tipo_1 : {
                id: "sangue_tipo_1",
                nome: "Sangue Tipo 1",
                tipo: "comum",
                descricao: "Um Sangue comun usado para alquimia.",
                icone: "🍖",
                imagem: "../../../../../img/objeto_comun/sangue_tipo_1.jpg", 
                acumulavel: true,
                valor_venda: 1
            };
            jogador.mochila["sangue_tipo_1"] = { ...dadosSangue, quantidade: quantSangue };
        }
        registrarLog(`🍖 **Drop:** Você encontrou ${quantSangue}x **Sangue Tipo 1**!`, "#ffaa00");
    }
    
    // --- SISTEMA DE DROP 3: Lora ---
    let chanceDropLora = Math.random() * 100;
    if (chanceDropLora <= 100) { 
        let quantLora = Math.floor(Math.random() * 2) + 1; 
        if (jogador.mochila["lora"]) {
            jogador.mochila["lora"].quantidade += quantLora;
        } else {
            let dadosLora = (typeof tabelaItensComuns !== 'undefined') ? tabelaItensComuns.lora : {
                id: "lora",
                nome: "Lora",
                tipo: "comum",
                descricao: "Uma planta de coloração azulada, com propriedades misteriosas.",
                icone: "🌿",
                imagem: "../../img/objeto_comun/lora.jpg", 
                acumulavel: true,
                valor_venda: 1
            };
            jogador.mochila["lora"] = { ...dadosLora, quantidade: quantLora };
        }
        registrarLog(`📦 **Drop:** Você encontrou ${quantLora}x **Lora**!`, "#a855f7");
    }

    localStorage.setItem(`DarCraker_Slot_${slotAtivo}`, JSON.stringify(jogador));
    registrarLog(`⏳ Redirecionando para a tela de status em 4 segundos...`, "#aaa");

    setTimeout(() => {
        window.location.href = "../../asmon.html";
    }, 4000);
}

function alternarMochilaCombate() {
    const painel = document.getElementById("painel-mochila-combate");
    if (painel.style.display === "none") {
        painel.style.display = "block";
        renderizarConsumiveisCombate();
    } else {
        painel.style.display = "none";
    }
}

function renderizarConsumiveisCombate() {
    const lista = document.getElementById("lista-consumiveis-combate");
    lista.innerHTML = "";

    if (!jogador || !jogador.mochila) return;

    let temConsumivel = false;

    Object.keys(jogador.mochila).forEach(chave => {
        const item = jogador.mochila[chave];

        if (item.tipo === "consumivel" && item.quantidade > 0) {
            temConsumivel = true;
            
            const divItem = document.createElement("div");
            divItem.style.display = "flex";
            divItem.style.justifyContent = "space-between";
            divItem.style.alignItems = "center";
            divItem.style.background = "#1a1a1a";
            divItem.style.padding = "8px";
            divItem.style.borderRadius = "4px";
            divItem.style.border = "1px solid #333";

            divItem.innerHTML = `
                <div style="font-size: 0.9rem;">
                    <span>${item.icone} <strong>${item.nome}</strong> (x${item.quantidade})</span>
                    <br><small style="color: #65a30d;">+${item.restauracao_vida} HP</small>
                </div>
                <button onclick="consumirItemCombate('${chave}')" style="background: #a855f7; border: none; color: white; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">Usar</button>
            `;
            lista.appendChild(divItem);
        }
    });

    if (!temConsumivel) {
        lista.innerHTML = `<p style="color: #666; font-style: italic; font-size: 0.85rem; text-align: center;">Nenhum item consumível na mochila...</p>`;
    }
}

function consumirItemCombate(chaveItem) {
    if (!jogador || !jogador.mochila || !jogador.mochila[chaveItem]) return;
    
    let item = jogador.mochila[chaveItem];

    if (jogador.vida_atual >= jogador.vida_maxima) {
        registrarLog(`⚠️ Sua vida já está cheia!`, "#eab308");
        return;
    }

    jogador.vida_atual += item.restauracao_vida;
    if (jogador.vida_atual > jogador.vida_maxima) {
        jogador.vida_atual = jogador.vida_maxima;
    }

    item.quantidade -= 1;
    if (item.quantidade <= 0) {
        delete jogador.mochila[chaveItem];
    }

    registrarLog(`🍎 Você consumiu **${item.nome}** e recuperou **${item.restauracao_vida}** de HP!`, "#22c55e");
    localStorage.setItem(`DarCraker_Slot_${slotAtivo}`, JSON.stringify(jogador));
    
    atualizarInterfaceHP();
    renderizarConsumiveisCombate();
}

function derrota() {
    emCombate = false;
    pararCronometroAcao();
    document.getElementById("btn-atacar").disabled = true;
    document.getElementById("timer-texto").innerText = "Derrota...";

    registrarLog(`💀 Você foi derrotado pelo Fantoche...`, "#ff3377");
    
    jogador.vida_atual = Math.floor(jogador.vida_maxima * 0.25); 
    localStorage.setItem(`DarCraker_Slot_${slotAtivo}`, JSON.stringify(jogador));

    registrarLog(`⏳ Retornando para recuperar suas energias...`, "#aaa");
    setTimeout(() => {
        window.location.href = "../../asmon.html";
    }, 3000);
}

function fugir() {
    if (confirm("Deseja realmente fugir da batalha? Seu progresso atual de vida será mantido.")) {
        emCombate = false;
        pararCronometroAcao();
        localStorage.setItem(`DarCraker_Slot_${slotAtivo}`, JSON.stringify(jogador));
        window.location.href = "../../asmon.html";
    }
}