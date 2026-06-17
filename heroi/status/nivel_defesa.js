// nivel_defesa.js

const tabelaExpDefesa = {
    1: 10,
    2: 20,
    3: 30,
    4: 50,
    5: 60,
    6: 70,
    7: 80,
    8: 100,
    9: 110,
    10: 120 // Nível Máximo de Maestria
};

function ganharExpDefesa(jogador, quantidade = 1) {
    if (jogador.nivel_defesa === undefined) jogador.nivel_defesa = 1;
    if (jogador.exp_defesa_atual === undefined) jogador.exp_defesa_atual = 0;
    if (jogador.exp_defesa_maxima === undefined) jogador.exp_defesa_maxima = tabelaExpDefesa[1];
    if (jogador.bonus_maestria_def_min === undefined) jogador.bonus_maestria_def_min = 0;
    if (jogador.bonus_maestria_def_max === undefined) jogador.bonus_maestria_def_max = 0;

    if (jogador.nivel_defesa >= 10) {
        jogador.nivel_defesa = 10;
        jogador.exp_defesa_atual = 0;
        jogador.exp_defesa_maxima = tabelaExpDefesa[10];
        return jogador;
    }

    jogador.exp_defesa_atual += quantidade;

    while (jogador.nivel_defesa < 10 && jogador.exp_defesa_atual >= jogador.exp_defesa_maxima) {
        jogador.exp_defesa_atual -= jogador.exp_defesa_maxima;
        jogador.nivel_defesa += 1;

        // Progressão balanceada para a defesa
        if (jogador.nivel_defesa === 2) jogador.bonus_maestria_def_max += 1;
        else if (jogador.nivel_defesa === 3) jogador.bonus_maestria_def_max += 1;
        else if (jogador.nivel_defesa === 4) jogador.bonus_maestria_def_max += 1;
        else if (jogador.nivel_defesa === 5) jogador.bonus_maestria_def_min += 1; // Nível 5 ganha defesa mínima
        else if (jogador.nivel_defesa === 6) jogador.bonus_maestria_def_max += 1;
        else if (jogador.nivel_defesa === 7) jogador.bonus_maestria_def_max += 1;
        else if (jogador.nivel_defesa === 8) jogador.bonus_maestria_def_max += 1;
        else if (jogador.nivel_defesa === 9) jogador.bonus_maestria_def_min += 1;
        else if (jogador.nivel_defesa === 10) jogador.bonus_maestria_def_max += 1;

        jogador.exp_defesa_maxima = tabelaExpDefesa[jogador.nivel_defesa];
        console.log(`🛡️ Sua Maestria de Defesa subiu para o Nível ${jogador.nivel_defesa}!`);
    }

    if (jogador.nivel_defesa >= 10) {
        jogador.nivel_defesa = 10;
        jogador.exp_defesa_atual = 0;
        jogador.exp_defesa_maxima = tabelaExpDefesa[10];
    }

    return jogador;
}