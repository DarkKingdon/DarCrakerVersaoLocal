const statusBaseInicial = {
    nome: "", nivel: 1, experiencia_atual: 0, experiencia_maxima: 10,
    pontos_disponiveis: 0, pontos_de_maestria: 0, pontos_de_habilidades: 0,
    vida_atual: 20, vida_maxima: 20, mana_atual: 10, mana_maxima: 10,
    forca: 1, protecao: 1, agilidade: 1, precisao: 1, vitalidade: 1, inteligencia: 1,
    ataque_minimo: 1, ataque_maximo: 2, defesa_minima: 1, defesa_maxima: 2, esquiva: 2, acerto: 2,
    bonus_vida_maxima: 0, bonus_mana_maxima: 0, bonus_forca: 0, bonus_protecao: 0,
    bonus_agilidade: 0, bonus_precisao: 0, bonus_vitalidade: 0, bonus_inteligencia: 0,
    bonus_ataque_minimo: 0, bonus_ataque_maximo: 0, bonus_defesa_minima: 0, bonus_defesa_maxima: 0,
    bonus_esquiva: 0, bonus_acerto: 0
};

// Abre o novo modal interativo de escolha de Slots para Novo Jogo
function novoJogo() {
    // Alerta visual nos botões se o slot já contiver um personagem
    for (let i = 1; i <= 3; i++) {
        let dados = localStorage.getItem(`DarCraker_Slot_${i}`);
        let obsElemento = document.getElementById(`novo-slot-${i}-obs`);
        if (dados) {
            let p = JSON.parse(dados);
            obsElemento.innerText = `(Ocupado: ${p.nome} Nív. ${p.nivel})`;
            obsElemento.style.color = "#ff3377"; // Destaque em rosa para slot ocupado
        } else {
            obsElemento.innerText = "(Vazio)";
            obsElemento.style.color = "#00ffff"; // Ciano para vazio
        }
    }
    document.getElementById("modal-novo-jogo").style.display = "flex";
}

function fecharModalNovoJogo() {
    document.getElementById("modal-novo-jogo").style.display = "none";
}

// Executada após o jogador clicar em um dos 3 botões do Modal
function confirmarSlotNovoJogo(slot) {
    // Verifica se já tem jogo salvo ali para avisar o usuário
    let dadosExistentes = localStorage.getItem(`DarCraker_Slot_${slot}`);
    if (dadosExistentes) {
        let p = JSON.parse(dadosExistentes);
        let confirmar = confirm(`Aviso: O Slot ${slot} já possui o herói ${p.nome}. Deseja apagar e iniciar assim mesmo?`);
        if (!confirmar) return;
    }

    // Fecha o modal de slots
    fecharModalNovoJogo();

    // Pergunta o nome (Como solicitado, mantivemos essa parte padrão que já funciona)
    let nomeHeroi = prompt("Digite o nome do seu Herói:");
    if (!nomeHeroi || nomeHeroi.trim() === "") {
        alert("Nome inválido!");
        return;
    }

    let novoPersonagem = { ...statusBaseInicial };
    novoPersonagem.nome = nomeHeroi;

    // Salva e define a sessão ativa
    localStorage.setItem(`DarCraker_Slot_${slot}`, JSON.stringify(novoPersonagem));
    localStorage.setItem("DarCraker_Slot_Ativo", slot);

    alert(`Herói ${nomeHeroi} criado com sucesso no Slot ${slot}!`);
    window.location.href = "inicio/inicio.html";
}

// Funções para controlar a janela pop-up dos slots internos
function abrirMenuSlots() {
    // Atualiza os nomes nos botões do modal antes de abrir
    for(let i = 1; i <= 3; i++) {
        let dados = localStorage.getItem(`DarCraker_Slot_${i}`);
        if(dados) {
            let p = JSON.parse(dados);
            // CORRIGIDO: de `slot-${i-info}` para `slot-${i}-info`
            document.getElementById(`slot-${i}-info`).innerText = `${p.nome} (Nív. ${p.nivel})`;
        } else {
            document.getElementById(`slot-${i}-info`).innerText = "Vazio";
        }
    }
    document.getElementById("modal-slots").style.display = "flex";
}

function fecharMenuSlots() {
    document.getElementById("modal-slots").style.display = "none";
}

function escolherSlotParaCarregar(slot) {
    let dadosSalvos = localStorage.getItem(`DarCraker_Slot_${slot}`);
    if (!dadosSalvos) {
        alert(`O Slot ${slot} está vazio! Clique em Novo Jogo.`);
        return;
    }
    localStorage.setItem("DarCraker_Slot_Ativo", slot);
    window.location.href = "inicio/inicio.html";
}

// BOTÃO IMPORTAR: Lê o arquivo físico baixado na pasta Downloads
function importarSaveArquivo() {
    const seletor = document.createElement("input");
    seletor.type = "file";
    seletor.accept = ".json";

    seletor.onchange = function(e) {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        const leitor = new FileReader();
        leitor.onload = function(evento) {
            try {
                const saveCarregado = JSON.parse(evento.target.result);
                
                if (saveCarregado.nome && saveCarregado.nivel) {
                    let slot = prompt("Em qual Slot interno (1, 2 ou 3) deseja descarregar este arquivo?");
                    if (slot !== "1" && slot !== "2" && slot !== "3") {
                        alert("Slot inválido! Importação cancelada.");
                        return;
                    }

                    // Salva o arquivo lido no slot que o jogador escolheu
                    localStorage.setItem(`DarCraker_Slot_${slot}`, JSON.stringify(saveCarregado));
                    localStorage.setItem("DarCraker_Slot_Ativo", slot);
                    
                    alert(`Save do herói ${saveCarregado.nome} importado com sucesso para o Slot ${slot}!`);
                    window.location.href = "inicio/inicio.html";
                } else {
                    alert("Arquivo de save inválido para o DarCraker.");
                }
            } catch(err) {
                alert("Erro ao processar o arquivo de save.");
            }
        };
        leitor.readAsText(arquivo);
    };
    seletor.click();
}