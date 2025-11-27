/* ============================================================
   CONFIGURAÇÃO E ELEMENTOS DO DOM
   ============================================================ */
const form = document.getElementById('controleFormCompleto');
// Verifica se os elementos de resultado existem ou cria
const resultado = document.getElementById('resultado') || createDiv('resultado');
const registrosSalvos = document.getElementById('registrosSalvos') || createDiv('registrosSalvos');
const verBtn = document.getElementById('verRegistros');
const limparBtn = document.getElementById('limparRegistros');
const enviarBtn = document.getElementById('enviarWhatsApp');
const imprimirBtn = document.getElementById('imprimirRegistro');

function createDiv(id) {
    const div = document.createElement('div');
    div.id = id;
    document.body.appendChild(div);
    return div;
}

/* ============================================================
   1. SALVAR FORMULÁRIO (COM MENSAGEM VERDE NA TELA)
   ============================================================ */
form.addEventListener('submit', function(e) {
    e.preventDefault();

    // --- 1. Captura Dados do Cliente ---
    const clienteInput = document.getElementById('cliente');
    let cliente = clienteInput ? clienteInput.value.trim() : 'Cliente';
    // Formata primeira letra maiúscula
    cliente = cliente.charAt(0).toUpperCase() + cliente.slice(1).toLowerCase();

    // --- 2. Captura Dados do Carro ---
    const carroInput = document.getElementById('modelo'); 
    const carro = carroInput ? carroInput.value.trim() : 'Modelo não informado';
    
    const placa = document.getElementById('placa') ? document.getElementById('placa').value : '';
    const km = document.getElementById('km') ? document.getElementById('km').value : '';
    // Monta string completa do carro
    const carroCompleto = `${carro} ${placa ? '('+placa+')' : ''} ${km ? '- ' + km + 'km' : ''}`;

    // --- 3. Captura Peças e Quantidades ---
    const checkboxes = document.querySelectorAll('input[name="pecas"]:checked');
    
    if (checkboxes.length === 0) {
        alert("Selecione ao menos uma peça.");
        return;
    }

    const listaPecas = [];
    checkboxes.forEach(checkbox => {
        const pai = checkbox.closest('.peca-item');
        const inputQtd = pai.querySelector('.peca-quantidade');
        const quantidade = inputQtd ? inputQtd.value : 1;

        listaPecas.push({
            nome: checkbox.value,
            qtd: quantidade
        });
    });

    // --- 4. Salva no LocalStorage ---
    const registro = {
        cliente,
        carro: carroCompleto,
        pecas: listaPecas, 
        data: new Date().toLocaleString('pt-BR')
    };

    const registros = JSON.parse(localStorage.getItem('registros')) || [];
    registros.push(registro);
    localStorage.setItem('registros', JSON.stringify(registros));

    // --- 5. Feedback Visual (Mensagem Verde) ---
    
    // Prepara o texto das peças para exibir na mensagem verde
    const pecasTexto = listaPecas.map(p => `${p.nome} (x${p.qtd})`).join(', ');

    resultado.style.display = "block";
    resultado.innerHTML = `
        <div style="background: #d4edda; color: #155724; padding: 15px; border: 1px solid #c3e6cb; border-radius: 5px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h3 style="margin-top:0;">✅ Orçamento salvo com sucesso!</h3>
            <p><strong>Cliente:</strong> ${cliente}</p>
            <p><strong>Veículo:</strong> ${carroCompleto}</p>
            <p><strong>Peças:</strong> ${pecasTexto}</p>
            <hr style="border-top: 1px solid #c3e6cb;">
            <p style="font-size: 0.8em; margin-bottom: 0;">O formulário foi limpo. Veja o histórico abaixo.</p>
        </div>
    `;

    // Esconde a lista antiga para evitar confusão
    registrosSalvos.style.display = "none";

    // Rola a tela suavemente até a mensagem
    resultado.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Limpa o formulário
    form.reset();

    // Faz a mensagem sumir suavemente após 8 segundos
    setTimeout(() => {
        resultado.style.transition = "opacity 0.5s ease";
        resultado.style.opacity = "0";
        setTimeout(() => {
            resultado.style.display = "none";
            resultado.innerHTML = "";
            resultado.style.opacity = "1";
        }, 500);
    }, 8000);
});


/* ============================================================
   2. VER REGISTROS
   ============================================================ */
if(verBtn) {
    verBtn.addEventListener('click', () => {
        const registros = JSON.parse(localStorage.getItem('registros')) || [];

        if (registrosSalvos.style.display === "block") {
            registrosSalvos.style.display = "none";
            return;
        }

        if (registros.length === 0) {
            registrosSalvos.innerHTML = "<p style='text-align:center; padding:20px;'>Nenhum registro salvo ainda.</p>";
        } else {
            registrosSalvos.innerHTML = "<h3 style='text-align:center; color:#333;'>Histórico de Orçamentos</h3>";
            registros.forEach((r, index) => {
                // Formata peças para exibição simples
                const pecasString = r.pecas.map(p => `${p.nome} (x${p.qtd})`).join(', ');

                registrosSalvos.innerHTML += `
                <div class="registro-item" style="border:1px solid #ddd; padding:15px; margin-bottom:15px; border-radius:8px; background:#fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <p><strong>Cliente:</strong> ${r.cliente}</p>
                    <p><strong>Veículo:</strong> ${r.carro}</p>
                    <p><strong>Data:</strong> ${r.data}</p>
                    <p><strong>Peças:</strong> ${pecasString}</p>
                    <div style="margin-top:15px; display:flex; gap:10px;">
                        <button class="btn-acao btn-whats" data-index="${index}" style="padding:8px 15px; cursor:pointer; background:#25D366; color:white; border:none; border-radius:4px;">WhatsApp</button>
                        <button class="btn-acao btn-print" data-index="${index}" style="padding:8px 15px; cursor:pointer; background:#007bff; color:white; border:none; border-radius:4px;">Imprimir</button>
                    </div>
                </div>
                `;
            });
        }

        registrosSalvos.style.display = "block";
        
        // Rola até o histórico
        registrosSalvos.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Adiciona eventos aos botões gerados dinamicamente
        adicionarEventosBotoesListagem();
    });
}

function adicionarEventosBotoesListagem() {
    document.querySelectorAll('.btn-whats').forEach(btn => {
        btn.addEventListener('click', (e) => {
            enviarWhatsappIndex(e.target.getAttribute('data-index'));
        });
    });

    document.querySelectorAll('.btn-print').forEach(btn => {
        btn.addEventListener('click', (e) => {
            imprimirIndex(e.target.getAttribute('data-index'));
        });
    });
}

/* ============================================================
   3. FUNÇÕES DE AÇÃO (WhatsApp e Impressão)
   ============================================================ */

// --- WhatsApp ---
function enviarWhatsappIndex(index) {
    const registros = JSON.parse(localStorage.getItem('registros')) || [];
    const r = registros[index];
    if(!r) return;

    const listaFormatada = r.pecas.map(p => `▪ ${p.nome} (${p.qtd}x)`).join('\n');
    
    const mensagem = `*JC Centro Automotivo* 🛠️\n\n` +
        `*Cliente:* ${r.cliente}\n` +
        `*Veículo:* ${r.carro}\n` +
        `*Data:* ${r.data}\n\n` +
        `*Peças Solicitadas:*\n${listaFormatada}`;

    const url = `https://wa.me/5531987194555?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

// Botão "Enviar Último" da tela principal
if(enviarBtn) {
    enviarBtn.addEventListener('click', () => {
        const registros = JSON.parse(localStorage.getItem('registros')) || [];
        if (registros.length > 0) {
            enviarWhatsappIndex(registros.length - 1);
        } else {
            alert("Nenhum registro para enviar.");
        }
    });
}

// --- Impressão ---
function imprimirIndex(index) {
    const registros = JSON.parse(localStorage.getItem('registros')) || [];
    const r = registros[index];
    if(!r) return;
    imprimirRelatorio(r);
}

// Botão "Imprimir Último" da tela principal
if(imprimirBtn) {
    imprimirBtn.addEventListener('click', () => {
        const registros = JSON.parse(localStorage.getItem('registros')) || [];
        if (registros.length > 0) {
            imprimirIndex(registros.length - 1);
        } else {
            alert("Nenhum registro para imprimir.");
        }
    });
}

// --- Lógica de Limpar ---
if(limparBtn) {
    limparBtn.addEventListener('click', () => {
        if (confirm("Tem certeza que deseja apagar TODO o histórico?")) {
            localStorage.removeItem('registros');
            registrosSalvos.innerHTML = "";
            registrosSalvos.style.display = "none";
            resultado.innerHTML = "<p style='color:red; text-align:center;'>Histórico apagado.</p>";
            resultado.style.display = "block";
            setTimeout(() => { resultado.style.display = "none"; }, 3000);
        }
    });
}

/* ============================================================
   4. FUNÇÃO GERADORA DE PDF/IMPRESSÃO
   ============================================================ */
function imprimirRelatorio(dados) {
    const categoriasMap = {
        'Motor': ['Bloco do motor', 'Cabeçote', 'Pistão', 'Anel de pistão', 'Biela', 'Virabrequim', 'Cárter', 'Junta do cabeçote', 'Comando de válvulas', 'Válvulas', 'Assentos de válvula', 'Mola de válvula', 'Tuchos', 'Correia dentada', 'Tensor de correia', 'Corrente de comando', 'Polia', 'Balancins', 'Carenagem do motor'],
        'Combustível': ['Bomba de combustível', 'Filtro de combustível', 'Bico injetor', 'Injetores', 'Regulador de pressão', 'Linha de combustível', 'Tanque de combustível', 'Válvula de retorno'],
        'Ignição': ['Velas de ignição', 'Cabos de vela', 'Bobina de ignição', 'Módulo de ignição', 'Distribuidor'],
        'Arrefecimento': ['Radiador', 'Ventoinha', 'Ventilador', "Bomba d'água", 'Termostato', 'Mangueiras do radiador', 'Reservatório de expansão', 'Sensor de temperatura'],
        'Freios': ['Pastilha de freio', 'Disco de freio', 'Tambor de freio', 'Cilindro mestre', 'Pinça de freio', 'Sensor ABS', 'Flexível de freio', 'Fluido de freio'],
        'Suspensão': ['Amortecedor', 'Mola helicoidal', 'Bucha suspensão', 'Braço oscilante', 'Pivô', 'Bieleta'],
        'Direção': ['Caixa de direção', 'Bomba de direção', 'Haste de direção', 'Barra de direção', 'Cremalheira'],
        'Elétrica': ['Bateria', 'Alternador', 'Motor de arranque', 'Fusível', 'Relé', 'Chicote', 'Central eletrônica', 'Painel de instrumentos', 'Interruptor'],
        'Outros': [] 
    };

    let htmlPecas = '';
    let pecasRestantes = [...dados.pecas];

    for (const [catNome, catItens] of Object.entries(categoriasMap)) {
        const pecasDaCategoria = pecasRestantes.filter(p => catItens.some(item => p.nome.includes(item)));
        
        if (pecasDaCategoria.length > 0) {
            htmlPecas += `<div class="categoria-print"><h4>${catNome}</h4><ul>`;
            pecasDaCategoria.forEach(p => {
                htmlPecas += `<li>${p.nome} <strong>(x${p.qtd})</strong></li>`;
                pecasRestantes = pecasRestantes.filter(rest => rest !== p);
            });
            htmlPecas += `</ul></div>`;
        }
    }

    if (pecasRestantes.length > 0) {
        htmlPecas += `<div class="categoria-print"><h4>Diversos</h4><ul>`;
        pecasRestantes.forEach(p => {
            htmlPecas += `<li>${p.nome} <strong>(x${p.qtd})</strong></li>`;
        });
        htmlPecas += `</ul></div>`;
    }

    const conteudo = `
    <html>
    <head>
        <title>Orçamento - ${dados.cliente}</title>
        <style>
            body { font-family: Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .logo { width: 200px; margin-bottom: 10px; }
            .info { background: #f4f4f4; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .info p { margin: 5px 0; font-size: 14px; }
            .categoria-print h4 { margin-bottom: 5px; border-bottom: 1px solid #ccc; color: #555; padding-top: 10px; }
            ul { margin-top: 0; padding-left: 20px; }
            li { margin-bottom: 5px; }
            .assinatura { margin-top: 50px; text-align: center; }
            .linha { border-top: 1px solid #000; width: 60%; margin: 0 auto; }
        </style>
    </head>
    <body>
        <header>
            <img class="logo-jc" src=" https://kaikgeovane.github.io/oficina/" alt="Logo JC">
            <p>Tel: (31) 987194555</p>
        </header>

        <div class="info">
            <p><strong>Cliente:</strong> ${dados.cliente}</p>
            <p><strong>Veículo:</strong> ${dados.carro}</p>
            <p><strong>Data do Orçamento:</strong> ${dados.data}</p>
        </div>

        <div class="pecas-container">
            <h3>Peças e Serviços Solicitados</h3>
            ${htmlPecas}
        </div>

        <div class="assinatura">
            <br><br>
            <div class="linha"></div>
            <p>Assinatura do Responsável</p>
        </div>
    </body>
    </html>
    `;

    const janela = window.open('', '', 'width=900,height=700');
    janela.document.write(conteudo);
    janela.document.close();

    setTimeout(() => {
        janela.print();
    }, 500);
}
