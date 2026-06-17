// nivel_ataque.js

// Tabela de progressão do nível de ataque (Nível: EXP Máxima necessária)
const tabelaExpAtaque = {
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

/**
 * Adiciona experiência ao nível de ataque do jogador e verifica se subiu de nível.
 * @param {Object} jogador - O objeto atual do jogador.
 * @param {number} quantidade - Quantidade de EXP de ataque ganha (padrão é 1 por golpe).
 * @returns {Object} O objeto jogador atualizado.
 */
function ganharExpAtaque(jogador, quantidade = 1) {
    // Inicializa as variáveis no jogador caso elas não existam ainda no Save
    if (jogador.nivel_ataque === undefined) jogador.nivel_ataque = 1;
    if (jogador.exp_ataque_atual === undefined) jogador.exp_ataque_atual = 0;
    if (jogador.exp_ataque_maxima === undefined) jogador.exp_ataque_maxima = tabelaExpAtaque[1];
    if (jogador.bonus_maestria_atk_min === undefined) jogador.bonus_maestria_atk_min = 0;
    if (jogador.bonus_maestria_atk_max === undefined) jogador.bonus_maestria_atk_max = 0;

    // Se já estiver no nível máximo de maestria, não ganha mais EXP
    if (jogador.nivel_ataque >= 10) {
        jogador.nivel_ataque = 10;
        jogador.exp_ataque_atual = 0;
        jogador.exp_ataque_maxima = tabelaExpAtaque[10];
        return jogador;
    }

    jogador.exp_ataque_atual += quantidade;

    // Loop de Level Up da Maestria de Ataque
    while (jogador.nivel_ataque < 10 && jogador.exp_ataque_atual >= jogador.exp_ataque_maxima) {
        jogador.exp_ataque_atual -= jogador.exp_ataque_maxima;
        jogador.nivel_ataque += 1;

        // Aplica os bônus permanentes baseados no nível alcançado
        if (jogador.nivel_ataque === 2) jogador.bonus_maestria_atk_max += 1;
        else if (jogador.nivel_ataque === 3) jogador.bonus_maestria_atk_max += 1;
        else if (jogador.nivel_ataque === 4) jogador.bonus_maestria_atk_max += 1;
        else if (jogador.nivel_ataque === 5) jogador.bonus_maestria_atk_min += 1;
        // Exemplo de continuação para níveis superiores, se desejar:
        else if (jogador.nivel_ataque === 6) jogador.bonus_maestria_atk_max += 1;
        else if (jogador.nivel_ataque === 7) jogador.bonus_maestria_atk_max += 1;
        else if (jogador.nivel_ataque === 8) jogador.bonus_maestria_atk_max += 1;
        else if (jogador.nivel_ataque === 9) jogador.bonus_maestria_atk_min += 1;
        else if (jogador.nivel_ataque === 10) jogador.bonus_maestria_atk_max += 1;

        // Atualiza a nova EXP máxima do próximo nível de ataque
        jogador.exp_ataque_maxima = tabelaExpAtaque[jogador.nivel_ataque];

        console.log(`⚔️ Sua Maestria de Ataque subiu para o Nível ${jogador.nivel_ataque}!`);
    }

    // Trava os limites se atingir o máximo no loop
    if (jogador.nivel_ataque >= 10) {
        jogador.nivel_ataque = 10;
        jogador.exp_ataque_atual = 0;
        jogador.exp_ataque_maxima = tabelaExpAtaque[10];
    }

    return jogador;
}