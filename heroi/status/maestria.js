// maestria.js
window.addEventListener('DOMContentLoaded', () => {
    atualizarTelaMaestria();
});

function atualizarTelaMaestria() {
    let slotAtivo = localStorage.getItem("DarCraker_Slot_Ativo");
    if (!slotAtivo) return;

    let jogador = JSON.parse(localStorage.getItem(`DarCraker_Slot_${slotAtivo}`));
    if (!jogador) return;

    // Normaliza variáveis de ataque se não existirem
    if (jogador.nivel_ataque === undefined) jogador.nivel_ataque = 1;
    if (jogador.exp_ataque_atual === undefined) jogador.exp_ataque_atual = 0;
    if (jogador.exp_ataque_maxima === undefined) jogador.exp_ataque_maxima = 10;
    if (jogador.bonus_maestria_atk_min === undefined) jogador.bonus_maestria_atk_min = 0;
    if (jogador.bonus_maestria_atk_max === undefined) jogador.bonus_maestria_atk_max = 0;

    // Normaliza variáveis de defesa se não existirem
    if (jogador.nivel_defesa === undefined) jogador.nivel_defesa = 1;
    if (jogador.exp_defesa_atual === undefined) jogador.exp_defesa_atual = 0;
    if (jogador.exp_defesa_maxima === undefined) jogador.exp_defesa_maxima = 10;
    if (jogador.bonus_maestria_def_min === undefined) jogador.bonus_maestria_def_min = 0;
    if (jogador.bonus_maestria_def_max === undefined) jogador.bonus_maestria_def_max = 0;

    // Atualiza dados de ATAQUE na tela
    document.getElementById("lbl-nv-ataque").innerText = jogador.nivel_ataque;
    document.getElementById("lbl-bonus-atk-min").innerText = `+${jogador.bonus_maestria_atk_min}`;
    document.getElementById("lbl-bonus-atk-max").innerText = `+${jogador.bonus_maestria_atk_max}`;
    document.getElementById("lbl-exp-atk-atual").innerText = jogador.exp_ataque_atual;
    document.getElementById("lbl-exp-atk-max").innerText = Math.floor(jogador.exp_ataque_maxima);
    
    let pctAtk = (jogador.exp_ataque_atual / jogador.exp_ataque_maxima) * 100;
    document.getElementById("bar-exp-ataque").style.width = `${Math.min(100, pctAtk)}%`;

    // Atualiza dados de DEFESA na tela
    document.getElementById("lbl-nv-defesa").innerText = Math.floor(jogador.nivel_defesa);
    document.getElementById("lbl-bonus-def-min").innerText = `+${jogador.bonus_maestria_def_min}`;
    document.getElementById("lbl-bonus-def-max").innerText = `+${jogador.bonus_maestria_def_max}`;
    document.getElementById("lbl-exp-def-atual").innerText = jogador.exp_defesa_atual;
    document.getElementById("lbl-exp-def-max").innerText = Math.floor(jogador.exp_defesa_maxima);
    
    let pctDef = (jogador.exp_defesa_atual / jogador.exp_defesa_maxima) * 100;
    document.getElementById("bar-exp-defesa").style.width = `${Math.min(100, pctDef)}%`;
}