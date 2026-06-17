// equipamentos_data.js

const tabelaEquipamentos = {
    "luvas_simples": {
        id: "luvas_simples",
        nome: "Luvas Simples",
        slot: "mao", // Pode ser: cabeca, peito, mao, pernas, etc.
        nivel_minimo: 2,
        descricao: "Luvas de couro desgastadas que oferecem uma leve proteção e aderência.",
        icone: "🧤",
        imagem: "../../img/objeto_equipamentos/luvas_simples.jpg", // Caminho padrão de imagens
        tipo: "Equipamento",
        valor_venda: 5,
        bonus: {
            vida_maxima: 5,
            forca: 0,
            protecao: 0
        }
    }
};