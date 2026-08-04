document.addEventListener('DOMContentLoaded', () => {
    const locationsList = document.querySelector('.locations-list');

    if (locationsList) {
        locationsList.addEventListener('click', (event) => {

            const clickedCard = event.target.closest('.location-card');

            if (clickedCard) {
                const storeId = clickedCard.id;

                if (storeId === 'loja-jardim-laura') {
                    window.open('https://alasca-burguer.ola.click/', '_blank');
                }

                else if (storeId === 'loja-assuncao') {
                    window.open('https://alascaburguer2.ola.click/', '_blank');
                }
            }
        });
    }
});