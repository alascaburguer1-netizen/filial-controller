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