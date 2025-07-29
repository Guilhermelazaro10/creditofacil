// Garante que o script só rode depois que todo o HTML for carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente carregado. Iniciando simulador.js');

    const loanAmountInput = document.getElementById('loan-amount');
    const loanAmountDisplay = document.getElementById('loan-amount-display');
    const installmentsInput = document.getElementById('installments');
    const installmentsDisplay = document.getElementById('installments-display');

    console.log('Elementos do simulador encontrados:', { loanAmountInput, loanAmountDisplay, installmentsInput, installmentsDisplay });

    // Função para formatar moeda brasileira
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2
        }).format(value);
    };

    // Função para atualizar o background do slider
    function updateSliderBackground(inputElement) {
        // Obter as cores das variáveis CSS
        const filledColor = getComputedStyle(document.documentElement).getPropertyValue('--slider-filled-color-simulator').trim();
        const trackColor = getComputedStyle(document.documentElement).getPropertyValue('--slider-track-color-simulator').trim();

        const percentage = ((inputElement.value - inputElement.min) / (inputElement.max - inputElement.min)) * 100;
        inputElement.style.background = `linear-gradient(to right, ${filledColor} ${percentage}%, ${trackColor} ${percentage}%, ${trackColor} 100%)`;
    }

    // Atualiza o display do valor do empréstimo
    if (loanAmountInput && loanAmountDisplay) {
        loanAmountInput.addEventListener('input', () => {
            loanAmountDisplay.textContent = formatCurrency(loanAmountInput.value);
            updateSliderBackground(loanAmountInput); // Atualiza a barra de progresso do range input
            console.log('Valor do empréstimo alterado para:', loanAmountInput.value);
        });
    } else {
        console.warn('Elementos do slider de valor não encontrados. (loanAmountInput ou loanAmountDisplay)');
    }


    // Atualiza o display das parcelas
    if (installmentsInput && installmentsDisplay) {
        installmentsInput.addEventListener('input', () => {
            installmentsDisplay.textContent = `${installmentsInput.value} meses`;
            updateSliderBackground(installmentsInput); // Atualiza a barra de progresso do range input
            console.log('Número de parcelas alterado para:', installmentsInput.value);
        });
    } else {
        console.warn('Elementos do slider de parcelas não encontrados. (installmentsInput ou installmentsDisplay)');
    }


    // Define os valores iniciais no display ao carregar a página
    if (loanAmountDisplay && loanAmountInput) {
        loanAmountDisplay.textContent = formatCurrency(loanAmountInput.value);
    }
    if (installmentsDisplay && installmentsInput) {
        installmentsDisplay.textContent = `${installmentsInput.value} meses`;
    }

    // Garante que as barras de progresso dos sliders sejam inicializadas corretamente
    if (loanAmountInput) {
        updateSliderBackground(loanAmountInput);
    }
    if (installmentsInput) {
        updateSliderBackground(installmentsInput);
    }
    console.log('Simulador inicializado com valores padrão.');
});