// Garante que o script só rode depois que todo o HTML for carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente carregado. Iniciando script.js');

    const formSteps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.steps-indicator .step');
    const form = document.getElementById('loan-simulator-form');
    const phoneInput = document.getElementById('phone');
    const cpfInput = document.getElementById('cpf');
    const stepsIndicatorContainer = document.querySelector('.steps-indicator');
    const successModal = document.getElementById('success-modal');
    const closeButton = document.querySelector('.close-button');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    console.log('formSteps encontrados:', formSteps.length, formSteps);
    console.log('stepIndicators encontrados:', stepIndicators.length, stepIndicators);
    console.log('Formulário encontrado:', form);
    console.log('phoneInput encontrado:', phoneInput);
    console.log('cpfInput encontrado:', cpfInput);
    console.log('stepsIndicatorContainer encontrado:', stepsIndicatorContainer);
    console.log('successModal encontrado:', successModal);


    // A etapa inicial é 0 (Valores)
    let currentStep = 0;

    // Função para mostrar a etapa correta e atualizar os indicadores E A BARRA DE PROGESSO
    function showStep(stepIndex) {
        console.log('Chamando showStep para o índice:', stepIndex);
        formSteps.forEach((step, index) => {
            if (index === stepIndex) {
                step.classList.remove('hidden'); // Mostra a etapa atual
                console.log(`Removendo 'hidden' de: ${step.id}`);
            } else {
                step.classList.add('hidden'); // Esconde as outras etapas
                console.log(`Adicionando 'hidden' a: ${step.id}`);
            }
        });

        stepIndicators.forEach((indicator, index) => {
            if (index === stepIndex) {
                indicator.classList.add('active'); // Ativa o indicador da etapa atual
                console.log(`Ativando indicador: ${indicator.dataset.step}`);
            } else {
                indicator.classList.remove('active'); // Desativa os outros indicadores
                console.log(`Desativando indicador: ${indicator.dataset.step}`);
            }
        });

        currentStep = stepIndex; // Atualiza a etapa atual
        console.log('currentStep atualizado para:', currentStep);

        // --- Lógica para atualizar a barra de progresso ---
        if (stepsIndicatorContainer) {
            const totalSteps = formSteps.length; // 3 passos
            // Os 10% de padding em cada lado do steps-indicator
            const paddingPercentage = 0.10; 
            const containerWidth = stepsIndicatorContainer.offsetWidth; // Largura total do steps-indicator
            const barUsableWidth = containerWidth * (1 - (2 * paddingPercentage)); // Largura real da barra cinza (80%)

            let targetWidthPixels = 0;

            if (totalSteps > 1) {
                // Calcula a largura de cada segmento da barra com base na largura útil
                const segmentWidth = barUsableWidth / (totalSteps - 1);
                // A largura alvo é o número de segmentos completos * largura do segmento
                targetWidthPixels = stepIndex * segmentWidth;
            }

            stepsIndicatorContainer.style.setProperty('--progress-width', `${targetWidthPixels}px`);
            console.log(`Barra de progresso atualizada para ${targetWidthPixels}px (step: ${stepIndex})`);
        } else {
            console.warn('stepsIndicatorContainer não encontrado para atualizar a barra de progresso.');
        }
    }

    // --- Funções de Máscara ---
    function maskPhone(value) {
        if (!value) return "";
        value = value.replace(/\D/g, ''); // Remove tudo que não é dígito
        if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos

        if (value.length > 10) {
            // (XX) XXXXX-XXXX (11 dígitos, ex: celular)
            return value.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
        } else if (value.length > 6) {
            // (XX) XXXX-XXXX (10 dígitos, ex: fixo)
            return value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
        } else if (value.length > 2) {
            // (XX) XXXX
            return value.replace(/^(\d\d)(\d{0,5})/, '($1) $2');
        } else {
            return value.replace(/^(\d*)/, '($1'); // (X, (XX
        }
    }

    function maskCPF(value) {
        if (!value) return "";
        value = value.replace(/\D/g, ''); // Remove tudo que não é dígito
        if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos

        return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    // --- Aplicação das Máscaras ---
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = maskPhone(e.target.value);
        });
    }

    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            e.target.value = maskCPF(e.target.value);
        });
    }

    // Função para remover erro de um campo específico
    function removeError(inputElement) {
        inputElement.classList.remove('input-error');
        const errorMessage = inputElement.nextElementSibling;
        if (errorMessage && errorMessage.classList.contains('error-message')) {
            errorMessage.remove();
        }
    }

    // Adiciona event listeners para remover erro ao digitar
    formSteps.forEach(step => {
        const inputs = step.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                removeError(input);
            });
        });
    });


    // Função para validar campos obrigatórios e formatos específicos
    function validateStep(stepId) {
        console.log('--- Iniciando validação da etapa:', stepId, '---');
        const currentFormStep = document.getElementById(stepId);
        const inputs = currentFormStep.querySelectorAll('input[required]');
        let isValid = true;

        inputs.forEach(input => {
            removeError(input); // Sempre remove o erro antes de revalidar

            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('input-error');
                const errorDiv = document.createElement('span');
                errorDiv.classList.add('error-message');
                errorDiv.textContent = 'Preencha este campo.';
                input.parentNode.insertBefore(errorDiv, input.nextSibling);
                console.log(`Validação FALHOU para ${input.id}: Campo vazio.`);
            } else {
                // Validações específicas para email, telefone, CPF
                if (input.id === 'email') {
                    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(input.value)) {
                        isValid = false;
                        input.classList.add('input-error');
                        const errorDiv = document.createElement('span');
                        errorDiv.classList.add('error-message');
                        errorDiv.textContent = 'E-mail inválido.';
                        input.parentNode.insertBefore(errorDiv, input.nextSibling);
                        console.log(`Validação FALHOU para ${input.id}: E-mail inválido: ${input.value}`);
                    } else {
                        console.log(`Validação OK para ${input.id}: ${input.value}`);
                    }
                } else if (input.id === 'cpf') {
                    const unmaskedCPF = input.value.replace(/\D/g, '');
                    if (unmaskedCPF.length !== 11) {
                        isValid = false;
                        input.classList.add('input-error');
                        const errorDiv = document.createElement('span');
                        errorDiv.classList.add('error-message');
                        errorDiv.textContent = 'CPF inválido (necessita 11 dígitos).';
                        input.parentNode.insertBefore(errorDiv, input.nextSibling);
                        console.log(`Validação FALHOU para ${input.id}: CPF com menos de 11 dígitos: ${unmaskedCPF.length}`);
                    } else {
                        console.log(`Validação OK para ${input.id}: ${input.value}`);
                    }
                } else if (input.id === 'phone') {
                    // Comprimento do telefone: 10 para fixo (DD + 8 dígitos), 11 para celular (DD + 9 dígitos)
                    const unmaskedPhone = input.value.replace(/\D/g, '');
                    if (unmaskedPhone.length < 10 || unmaskedPhone.length > 11) {
                        isValid = false;
                        input.classList.add('input-error');
                        const errorDiv = document.createElement('span');
                        errorDiv.classList.add('error-message');
                        errorDiv.textContent = 'Telefone inválido (necessita 10 ou 11 dígitos, incluindo o DDD).';
                        input.parentNode.insertBefore(errorDiv, input.nextSibling);
                    } else {
                        console.log(`Validação OK para ${input.id}: ${input.value}`);
                    }
                } else {
                    console.log(`Validação OK para ${input.id}: ${input.value}`);
                }
            }
        });
        console.log('--- Validação da etapa', stepId, 'resultou em:', isValid, '---');
        return isValid;
    }

    // Event listeners para botões de "Continuar" (próxima etapa)
    document.querySelectorAll('[data-next-step]').forEach(button => {
        button.addEventListener('click', () => {
            console.log('Botão "Continuar" clicado.');
            const nextStepId = button.dataset.nextStep;
            const currentStepId = button.closest('.form-step').id;

            console.log('currentStepId:', currentStepId, 'nextStepId:', nextStepId);

            // Valida a etapa atual antes de avançar, mas apenas se for a etapa de 'dados'
            if (currentStepId === 'step-dados') {
                if (!validateStep(currentStepId)) {
                    console.log('Validação da etapa de dados falhou. Não avançando para a próxima etapa.');
                    return;
                } else {
                    console.log('Validação da etapa de dados BEM SUCEDIDA. Avançando...');
                }
            }

            const nextStepElement = document.getElementById(nextStepId);
            console.log('nextStepElement encontrado:', nextStepElement);

            if (nextStepElement) {
                const nextStepIndex = Array.from(formSteps).indexOf(nextStepElement);
                console.log('nextStepIndex:', nextStepIndex);
                showStep(nextStepIndex);

                // Preenche os dados de confirmação na última etapa
                if (nextStepId === 'step-confirmacao') {
                    console.log('Preenchendo dados para a etapa de confirmação.');
                    document.getElementById('confirm-loan-amount').textContent = document.getElementById('loan-amount-display').textContent;
                    document.getElementById('confirm-installments').textContent = document.getElementById('installments-display').textContent;
                    document.getElementById('confirm-name').textContent = document.getElementById('full-name').value;
                    document.getElementById('confirm-email').textContent = document.getElementById('email').value;
                    document.getElementById('confirm-phone').textContent = document.getElementById('phone').value;
                    document.getElementById('confirm-cpf').textContent = document.getElementById('cpf').value;
                }
            } else {
                console.error('Erro: Elemento da próxima etapa não encontrado com ID:', nextStepId);
            }
        });
    });

    // Event listeners para botões de "Voltar" (etapa anterior)
    document.querySelectorAll('[data-prev-step]').forEach(button => {
        button.addEventListener('click', () => {
            console.log('Botão "Voltar" clicado.');
            const prevStepId = button.dataset.prevStep;
            const prevStepElement = document.getElementById(prevStepId);
            const prevStepIndex = Array.from(formSteps).indexOf(prevStepElement);
            showStep(prevStepIndex);
        });
    });

    // Lógica para "finalizar" a simulação (agora com modal)
    document.getElementById('finalize-loan-btn').addEventListener('click', () => {
        console.log('Botão "Finalizar Empréstimo" clicado.');
        const loanData = {
            amount: parseFloat(document.getElementById('loan-amount-display').textContent.replace('R$ ', '').replace(',', '.')),
            installments: parseInt(document.getElementById('installments-display').textContent.replace(' meses', '')),
            fullName: document.getElementById('full-name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            cpf: document.getElementById('cpf').value
        };

        console.log('Dados da Simulação Finalizada:', loanData);
        
        // Exibe o modal de sucesso
        if (successModal) {
            successModal.classList.add('show');
        }

        // O formulário NÃO é mais resetado automaticamente aqui.
        // O reset e o retorno à primeira etapa acontecem ao fechar o modal.
        console.log('Modal de sucesso exibido. Aguardando interação do usuário para fechar e resetar.');
    });

    // Lógica para fechar o modal (AGORA INCLUI O RESET DO FORMULÁRIO)
    function closeModalAndReset() {
        if (successModal) {
            successModal.classList.remove('show');
            form.reset(); // Reseta o formulário
            // Limpar classes de erro para o reset do formulário
            document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
            document.querySelectorAll('.error-message').forEach(el => el.remove());
            showStep(0); // Volta para a primeira etapa
            console.log('Modal fechado, formulário resetado e voltando para a primeira etapa.');
        }
    }

    if (closeButton) {
        closeButton.addEventListener('click', closeModalAndReset);
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModalAndReset);
    }

    // Fecha o modal se o usuário clicar fora do conteúdo
    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                closeModalAndReset();
            }
        });
    }

    // Inicializa mostrando a primeira etapa ao carregar a página
    console.log('Chamando showStep(0) na inicialização.');
    showStep(0);
});