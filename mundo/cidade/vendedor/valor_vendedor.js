// valor_vendedor.js - Banco de dados de itens à venda pelo NPC

const TABELA_VENDEDOR = {
    "racao_tipo_1": {
        id: "racao_tipo_1",
        nome: "Ração Tipo 1",
        tipo: "comum",
        descricao: "Uma ração nutritiva ideal para fortalecer o mascote Toby.",
        icone: "🍖",
        valor_compra: 500, // Configurado por 500 ouros como pedido
        acumulavel: true
    },
    "maca": {
        id: "maca",
        nome: "Maçã",
        tipo: "consumivel",
        descricao: "Uma maçã bem vermelha e suculenta. Restaura 5 de vida.",
        icone: "🍎",
        valor_compra: 7,
        acumulavel: true
    },
    "zaleia": {
        id: "zaleia",
        nome: "Zaleia",
        tipo: "comum",
        descricao: "Uma planta de coloração avermelhada, com propriedades misteriosas.",
        icone: "🌿",
        valor_compra: 10,
        acumulavel: true
    },
    "luvas_simples": {
        id: "luvas_simples",
        nome: "Luvas Simples",
        tipo: "Equipamento",
        descricao: "Luvas de couro desgastadas que oferecem uma leve proteção.",
        icone: "🧤",
        valor_compra: 150,
        acumulavel: false
    }
};