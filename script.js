let diferencaServidor = 0;

document.addEventListener('DOMContentLoaded', () => {

    // Clique nos cartões
    const locationsList = document.querySelector('.locations-list');

    if (locationsList) {
        locationsList.addEventListener('click', (event) => {

            const clickedCard = event.target.closest('.location-card');

            if (!clickedCard) return;

            switch (clickedCard.id) {

                case 'jardim-laura-filial':
                    window.open('https://alasca-burguer.ola.click/', '_blank');
                    break;

                case 'bairro-dos-casa-filiasl':
                    window.open('https://alascaburguer2.ola.click/', '_blank');
                    break;

            }

        });
    }

    iniciarRelogio();

});

a/* sync function iniciarRelogio() {

    try {

        const resposta = await fetch(
            'https://timeapi.io/api/Time/current/zone?timeZone=America/Sao_Paulo'
        );

        if (!resposta.ok) throw new Error();

        const dados = await resposta.json();

        const horaServidor = new Date(dados.dateTime).getTime();
        const horaLocal = Date.now();

        diferencaServidor = horaServidor - horaLocal;

    } catch (erro) {

        console.warn("Não foi possível sincronizar horário. Utilizando relógio local.");

        diferencaServidor = 0;
    }

    atualizarStatusDOM();

    // Atualiza exatamente a cada minuto
    setInterval(atualizarStatusDOM, 60000);

}

function getHoraOficial() {
    return new Date(Date.now() + diferencaServidor);
}

function atualizarStatusDOM() {

    Object.keys(CONFIG_ALASCA).forEach(id => {
        calcularStatusLoja(id);
    });

}

function calcularStatusLoja(id) {

    const card = document.getElementById(id);

    if (!card) return;

    const configuracao = CONFIG_ALASCA[id];

    if (!configuracao) return;

    const badgeOpen = card.querySelector('.badge-open');
    const badgeClosed = card.querySelector('.badge-closed');

    if (!badgeOpen || !badgeClosed) return;

    const agora = getHoraOficial();

    const diaSemana = agora.getDay();
    const horarioHoje = configuracao.horarios[diaSemana];

    let aberta = false;

    if (horarioHoje !== null) {

        const [horaAbre, minutoAbre] = horarioHoje.abre.split(':').map(Number);
        const [horaFecha, minutoFecha] = horarioHoje.fecha.split(':').map(Number);

        const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
        const minutosAbre = horaAbre * 60 + minutoAbre;
        const minutosFecha = horaFecha * 60 + minutoFecha;

        aberta = minutosAgora >= minutosAbre && minutosAgora < minutosFecha;
    }

    if (aberta) {
        badgeOpen.style.display = 'inline-flex';
        badgeClosed.style.display = 'none';
    } else {
        badgeOpen.style.display = 'none';
        badgeClosed.style.display = 'inline-flex';
    }

    // Debug (pode remover depois)
    console.log({
        loja: id,
        agora: agora.toLocaleString('pt-BR'),
        diaSemana,
        horarioHoje,
        aberta
    });

} */