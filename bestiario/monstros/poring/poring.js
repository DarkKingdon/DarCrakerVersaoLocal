// poring.js

window.onload = function() {
    renderizarDadosPoring();
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
    if (!slotAtivo) return;
    
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
    if (!slotAtivo) return;

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
// RENDERIZAÇÃO DOS DADOS DO MONSTRO
// =========================================================================
function renderizarDadosPoring() {
    const dadosPoring = {
        nome: "Poring",
        nivel: 1,
        vida_maxima: 7,
        ataque_minimo: 1,
        ataque_maximo: 2,
        defesa_minima: 0,
        defesa_maxima: 0,
        recompensa_exp: 1
    };

    // 1. Atualiza dados principais do Monstro
    document.getElementById("monster-nome").innerText = dadosPoring.nome;
    document.getElementById("monster-nivel").innerText = dadosPoring.nivel;
    document.getElementById("monster-img").src = "../../../img/monstros/poring.jpg";

    // 2. Preenche os Atributos Básicos
    document.getElementById("stat-hp").innerText = dadosPoring.vida_maxima;
    document.getElementById("stat-atk").innerText = `${dadosPoring.ataque_minimo} ~ ${dadosPoring.ataque_maximo}`;
    document.getElementById("stat-def").innerText = `${dadosPoring.defesa_minima} ~ ${dadosPoring.defesa_maxima}`;
    document.getElementById("stat-exp").innerText = `+${dadosPoring.recompensa_exp} EXP`;

    // 3. Dados dos Drops do Poring
    const bestiarioDrops = [
        { 
            nome: "Jellopy", 
            imagem: "../../../img/objeto_comun/jellopy.jpg", 
            quantidade: "1x", 
            chance: "6%",
            descricao: "Uma joia cristalina e comum dropada por monstros fracos.",
            valor: "1z"
        },
        { 
            nome: "Luvas Simples", 
            imagem: "../../../img/equipamentos/luvas_simples.jpg", 
            quantidade: "1x", 
            chance: "4%",
            descricao: "Um Par de Luvas Simples.",
            valor: "1z"
        },
        { 
            nome: "Maçã", 
            imagem: "../../../img/objeto_consumivel/maca.jpg", 
            quantidade: "1x", 
            chance: "17%",
            descricao: "Restaura 5 de vida ao ser consumida.",
            valor: "2z"
        },
        { 
            nome: "Moedas de Ouro", 
            imagem: "../../../img/objeto_comun/moedas_de_ouro.jpg", 
            quantidade: "1x a 2x", 
            chance: "8%",
            descricao: "Uma moeda de ouro para negociar no mundo.",
            valor: "0z"
        },
        { 
            nome: "Zaleia", 
            imagem: "../../../img/objeto_comun/zaleia.jpg", 
            quantidade: "1x", 
            chance: "7%",
            descricao: "Uma planta de coloração avermelhada.",
            valor: "5z"
        }
        
    ];

    // 4. Renderiza as linhas da tabela de drops
    const tabelaCorpo = document.getElementById("lista-drops");
    tabelaCorpo.innerHTML = ""; 

    bestiarioDrops.forEach(drop => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>
                <div class="drop-item-cell" title="${drop.descricao} | Valor: ${drop.valor}">
                    <div class="drop-img-box">
                        <img src="${drop.imagem}" alt="${drop.nome}" class="drop-item-img" onerror="this.style.display='none'">
                    </div>
                    <span>${drop.nome}</span>
                </div>
            </td>
            <td>${drop.quantidade}</td>
            <td class="txt-exp" style="font-weight: bold;">${drop.chance}</td>
        `;

        tabelaCorpo.appendChild(linha);
    });
}