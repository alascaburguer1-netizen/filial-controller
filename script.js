let offsetTempo = 0;

document.addEventListener('DOMContentLoaded', () => {

    // --- VERIFICAÇÃO DE SEGURANÇA ---
    if (typeof CONFIG_ALASCA === 'undefined' || typeof RUAS_SBC === 'undefined') {
        console.error("❌ Erro: Arquivos config.js ou ruas.js não encontrados.");
        return;
    }

    // --- 1. CONFIGURAÇÃO DAS FILIAIS (Drakon Burger) ---
    const filiais = ['jardim-laura-filial', 'bairro-dos-casa-filiasl'];

    filiais.forEach(id => {
        const el = document.getElementById(id);
        if (el && CONFIG_ALASCA[id]) {
            const titulo = el.querySelector('.store-title');
            if (titulo) titulo.innerText = CONFIG_ALASCA[id].nome;
            
            el.addEventListener('click', () => { 
                window.location.href = CONFIG_ALASCA[id].link; 
            });
        }
    });

    // --- 2. AUTOCOMPLETE LOCAL CUSTOMIZADO (100% OFFLINE) ---
    const addressInput = document.getElementById('address-input');
    const resultsContainer = document.getElementById('custom-results');

    if (addressInput && resultsContainer) {
        addressInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            
            if (query.length < 3) {
                resultsContainer.style.display = 'none';
                return;
            }

            // Filtra no banco de dados local RUAS_SBC
            const matches = RUAS_SBC.filter(rua => 
                rua.toLowerCase().includes(query)
            ).slice(0, 8); 

            if (matches.length > 0) {
                resultsContainer.innerHTML = '';
                resultsContainer.style.display = 'block';

                matches.forEach(rua => {
                    const partes = rua.split(' - ');
                    const nomeRua = partes[0];
                    const detalhe = partes[1] || "";

                    const div = document.createElement('div');
                    div.className = 'suggestion-item';
                    div.innerHTML = `
                        <div class="suggestion-main"><strong>${nomeRua}</strong></div>
                        <div class="suggestion-sub">${detalhe}</div>
                    `;

                    div.addEventListener('click', () => {
                        addressInput.value = rua;
                        resultsContainer.style.display = 'none';
                        
                        // Log detalhado no console
                        const matchCoord = rua.match(/\(([^)]+)\)/);
                        console.group("📍 Endereço Selecionado");
                        printLogExtenso(rua, matchCoord ? matchCoord[1] : "N/A");
                        console.groupEnd();
                    });

                    resultsContainer.appendChild(div);
                });
            } else {
                resultsContainer.style.display = 'none';
            }
        });

        // Fecha a lista ao clicar fora
        document.addEventListener('click', (e) => {
            if (!addressInput.contains(e.target) && !resultsContainer.contains(e.target)) {
                resultsContainer.style.display = 'none';
            }
        });
    }

    // --- 3. LÓGICA DE VERIFICAÇÃO (btn-verify + Popup Dinâmico) ---
    const btnVerify = document.getElementById('btn-verify');
    const popupOverlay = document.getElementById('popup-overlay');
    const closePopup = document.getElementById('close-popup');
    const popupTexto = popupOverlay ? popupOverlay.querySelector('p') : null;

    if (btnVerify && addressInput && popupOverlay && popupTexto) {
        
        btnVerify.addEventListener('click', () => {
            const valorInput = addressInput.value.trim();

            // CASO 1: Campo Vazio
            if (valorInput === "") {
                popupTexto.innerText = "Por favor, escreva o nome de uma rua ou cep antes de verificar.";
                popupOverlay.style.display = 'flex';
                console.warn("⚠️ Tentativa de verificação com campo vazio.");
                return;
            }

            // CASO 2: Rua não existe no banco de dados
            const enderecoValido = RUAS_SBC.includes(valorInput);

            if (!enderecoValido) {
                popupTexto.innerText = "Esta rua não existe em nossa base. Por favor, selecione uma rua existente na lista de sugestões.";
                popupOverlay.style.display = 'flex';
                console.warn("⚠️ Rua não encontrada no banco de dados.");
            } else {
                // SUCESSO
                console.log("✅ Endereço validado com sucesso:", valorInput);
                alert("Endereço confirmado! Escolha sua filial abaixo.");
            }
        });

        // Fechar Pop-up
        if (closePopup) {
            closePopup.addEventListener('click', () => {
                popupOverlay.style.display = 'none';
            });
        }

        // Fecha ao clicar no fundo escuro
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) {
                popupOverlay.style.display = 'none';
            }
        });
    }

    // --- 4. INICIA RELÓGIO E STATUS DAS LOJAS ---
    iniciarRelogio();
});

/**
 * Utilitário: Log formatado no console
 */
function printLogExtenso(textoCompleto, coords) {
    const partes = textoCompleto.split(' - ');
    const rua = partes[0];
    const bairroEParenteses = partes[1] || "";
    const bairro = bairroEParenteses.split(' (')[0];

    console.log("%c--- LOG DRAKON BURGER ---", "color: #bc2c3d; font-weight: bold;");
    console.log(`🏠 Rua:      ${rua}`);
    console.log(`🏘️ Bairro:   ${bairro}`);
    console.log(`🌐 Coords:   ${coords}`);
    console.log(`📝 String:   ${textoCompleto}`);
    console.log("--------------------------");
}

// --- FUNÇÕES DE TEMPO E STATUS ---
async function iniciarRelogio() {
    const url = 'https://timeapi.io/api/Time/current/zone?timeZone=America/Sao_Paulo';
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const dados = await res.json();
        offsetTempo = new Date(dados.dateTime).getTime() - performance.now();
    } catch (e) {
        offsetTempo = Date.now() - performance.now();
    }
    atualizarStatusDOM();
    setInterval(atualizarStatusDOM, 60000);
}

function getHoraOficial() { return new Date(performance.now() + offsetTempo); }

function atualizarStatusDOM() {
    ['jardim-laura-filial', 'bairro-dos-casa-filiasl'].forEach(id => calcularStatusLoja(id));
}

function calcularStatusLoja(id) {
    const el = document.getElementById(id);
    if (!el || !CONFIG_ALASCA[id]) return;

    const statusTxt = el.querySelector('.store-status');
    const horarios = CONFIG_ALASCA[id].horarios;
    const agora = getHoraOficial();
    const diaAtual = agora.getDay();
    const minAtual = (agora.getHours() * 60) + agora.getMinutes();

    let statusHTML = "Fechado";
    let cor = "#e6707a";
    const configDia = horarios[diaAtual];

    if (configDia) {
        const [hAbre, mAbre] = configDia.abre.split(':').map(Number);
        const [hFecha, mFecha] = configDia.fecha.split(':').map(Number);
        const minAbre = hAbre * 60 + mAbre;
        const minFecha = hFecha * 60 + mFecha;

        if (minAtual >= minAbre && minAtual < minFecha) {
            statusHTML = "Aberto agora";
            cor = "#28a745";
        }
    }
    statusTxt.innerHTML = statusHTML;
    statusTxt.style.color = cor;
}