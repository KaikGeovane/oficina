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
   1. SALVAR FORMULÁRIO
   ============================================================ */
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // --- 1. Cliente ---
        const clienteInput = document.getElementById('cliente');
        let cliente = clienteInput ? clienteInput.value.trim() : 'Cliente';
        cliente = cliente.charAt(0).toUpperCase() + cliente.slice(1).toLowerCase();

        // --- 2. Dados do carro ---
        const modelo = document.getElementById('modelo')?.value.trim() || '';
        const ano = document.getElementById('ano')?.value.trim() || '';
        const placa = document.getElementById('placa')?.value.trim() || '';
        const cor = document.getElementById('cor')?.value.trim() || '';
        const km = document.getElementById('km')?.value.trim() || '';

        // --- 3. Peças ---
        const checkboxes = document.querySelectorAll('input[name="pecas"]:checked');
        if (checkboxes.length === 0) {
            alert("Selecione ao menos uma peça.");
            return;
        }

        const listaPecas = [];
        checkboxes.forEach(checkbox => {
            const pai = checkbox.closest('.peca-item');
            const inputQtd = pai ? pai.querySelector('.peca-quantidade') : null;
            const quantidade = inputQtd ? inputQtd.value : 1;

            listaPecas.push({
                nome: checkbox.value,
                qtd: quantidade
            });
        });

        // --- 4. Salvar no LocalStorage ---
        const registro = {
            cliente,
            modelo,
            ano,
            placa,
            cor,
            km,
            pecas: listaPecas,
            data: new Date().toLocaleString('pt-BR')
        };

        const registros = JSON.parse(localStorage.getItem('registros')) || [];
        registros.push(registro);
        localStorage.setItem('registros', JSON.stringify(registros));

        // --- 5. Feedback Visual (Mensagem Verde) ---
        const pecasTexto = listaPecas.map(p => `${p.nome} (x${p.qtd})`).join(', ');

        resultado.style.display = "block";
        resultado.innerHTML = `
            <div style="background:#d4edda; color:#155724; padding:15px; border:1px solid #c3e6cb; border-radius:5px; margin-bottom:20px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                <h3 style="margin-top:0;">Orçamento salvo com sucesso</h3>
                <p><strong>Cliente:</strong> ${cliente}</p>
                <p><strong>Veículo:</strong> ${modelo}</p>
                <p><strong>Cor:</strong> ${cor}</p>
                <p><strong>Peças:</strong> ${pecasTexto}</p>
                <hr style="border-top:1px solid #c3e6cb;">
                <p style="font-size:0.8em; margin-bottom:0;">O formulário foi limpo. Veja o histórico abaixo.</p>
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
}

/* ============================================================
   2. VER REGISTROS (listagem com WhatsApp e Impressão)
   ============================================================ */
if (verBtn) {
    verBtn.addEventListener('click', () => {
        const registros = JSON.parse(localStorage.getItem('registros')) || [];

        // Se já está visível, fecha e retorna (toggle)
        if (registrosSalvos.style.display === "block") {
            registrosSalvos.style.display = "none";
            return;
        }

        if (registros.length === 0) {
            registrosSalvos.innerHTML = "<p style='text-align:center; padding:20px;'>Nenhum registro salvo ainda.</p>";
        } else {
            registrosSalvos.innerHTML = "<h3 style='text-align:center; color:#333;'>Histórico de Orçamentos</h3>";

            registros.forEach((r, index) => {
                const pecasString = r.pecas.map(p => `${p.nome} (x${p.qtd})`).join(', ');

                registrosSalvos.innerHTML += `
                    <div class="registro-item" style="border:1px solid #ddd; padding:15px; margin-bottom:15px; border-radius:8px; background:#fff; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                        <p><strong>Cliente:</strong> ${r.cliente}</p>
                        <p><strong>Veículo:</strong> ${r.modelo}</p>
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
    // WhatsApp
    document.querySelectorAll('.btn-whats').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = e.target.getAttribute('data-index');
            enviarWhatsappIndex(idx);
        });
    });

    // Impressão
    document.querySelectorAll('.btn-print').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = e.target.getAttribute('data-index');
            imprimirIndex(idx);
        });
    });
}

/* ============================================================
   3. FUNÇÕES DE IMPRESSÃO
   ============================================================ */

function imprimirIndex(index) {
    const registros = JSON.parse(localStorage.getItem('registros')) || [];
    const r = registros[index];
    if (!r) return;
    imprimirRelatorio(r);
}

function imprimirRelatorio(dados) {

   let linhasPecas = [];

dados.pecas.forEach((p, index) => {
    linhasPecas.push(`
        <tr>
            <td> ${p.nome} (x${p.qtd})</td>  <!-- peça vai na coluna Item -->
            <td></td>  <!-- coluna Descrição vazia -->
            <td></td>  <!-- coluna Valor vazia -->
        </tr>
    `);
});


    while (linhasPecas.length < 12) {
        linhasPecas.push(`
            <tr>
                <td></td><td></td><td></td>
            </tr>
        `);
    }

    const conteudo = `
<html>
<head>
<title>Orçamento - ${dados.cliente}</title>

<style>
body { font-family: Arial; padding: 20px; }
.folha { width: 750px; margin:auto; }
.logo-bloco { display:flex; align-items:center; border:2px solid #000; padding:10px; }
.logo-bloco img { width:130px; }
.info-texto { font-size:12px; margin-left:10px; }
table { width:100%; border-collapse:collapse; margin-top:8px; }
th, td { border:1px solid #000; padding:5px; font-size:13px; }
.assinatura { margin-top:30px; font-size:14px; }
</style>

</head>

<body>
<div class="folha">

    <!-- LOGO -->
    <div class="logo-bloco">
        <img src="img/logo-jc.png">
        <div class="info-texto">
            TRABALHAMOS COM NACIONAIS E IMPORTADOS<br>
            INJEÇÃO ELETRÔNICA - MECÂNICA EM GERAL<br>
            Rua Brasília, 28 – Bairro Jardim Liberdade<br>
            DE SEGUNDA A SÁBADO
        </div>
    </div>

    <!-- TABELA DO CARRO -->
    <table>
        <tr>
            <th>Cliente</th>
            <td>${dados.cliente}</td>

            <th>Carro</th>
            <td>${dados.modelo}</td>

            <th>Ano</th>
            <td>${dados.ano}</td>

            <th>Placa</th>
            <td>${dados.placa}</td>

            <th>Cor</th>
            <td>${dados.cor}</td>

            <th>Km</th>
            <td>${dados.km}</td>
        </tr>
    </table>

    <!-- PEÇAS -->
    <table>
        <tr>
            <th style="width:40px">Item</th>
            <th>Descrição dos Serviços</th>
            <th style="width:80px">Valor</th>
        </tr>
        ${linhasPecas.join('')}
    </table>

    <!-- TOTAL -->
    <table style="margin-top:10px">
        <tr>
            <th style="width:120px">Total R$</th>
            <td></td>
        </tr>
    </table>

    <div class="assinatura">
        Autorizado _______________________________________<br><br>
        Assinatura do Cliente _____________________________
    </div>

</div>
</body>
</html>
`;

    const janela = window.open('', '', 'width=900,height=700');
    janela.document.write(conteudo);
    janela.document.close();

    setTimeout(() => janela.print(), 500);
}

/* ============================================================
   4. LIMPAR
   ============================================================ */
if (limparBtn) {
    limparBtn.addEventListener('click', () => {
        if (confirm("Tem certeza que deseja apagar TODO o histórico?")) {
            localStorage.removeItem('registros');
            registrosSalvos.innerHTML = "";
            registrosSalvos.style.display = "none";

            resultado.innerHTML = "<p style='color:red; text-align:center;'>Histórico apagado.</p>";
            resultado.style.display = "block";

            setTimeout(() => {
                resultado.style.display = "none";
                resultado.innerHTML = "";
            }, 3000);
        }
    });
}

/* ============================================================
   5. WHATSAPP (enviar registro por chat)
   ============================================================ */
function enviarWhatsappIndex(index) {
    const registros = JSON.parse(localStorage.getItem('registros')) || [];
    const r = registros[index];
    if (!r) return;

    const listaFormatada = r.pecas.map(p => `▪ ${p.nome} (${p.qtd}x)`).join('\n');

    const mensagem =
`JC Centro Automotivo

Cliente: ${r.cliente}
Veículo: ${r.modelo}
Ano: ${r.ano}
Placa: ${r.placa}
Cor: ${r.cor}
Km: ${r.km}
Data: ${r.data}

Peças solicitadas:
${listaFormatada}`;

    // Substitua o número abaixo pelo número desejado se precisar
    const numero = '5531987194555';
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

// Botão "Enviar Último" da tela principal
if (enviarBtn) {
    enviarBtn.addEventListener('click', () => {
        const registros = JSON.parse(localStorage.getItem('registros')) || [];
        if (registros.length > 0) enviarWhatsappIndex(registros.length - 1);
        else alert("Nenhum registro para enviar.");
    });
}

// Botão "Imprimir Último" da tela principal
if (imprimirBtn) {
    imprimirBtn.addEventListener('click', () => {
        const registros = JSON.parse(localStorage.getItem('registros')) || [];
        if (registros.length > 0) imprimirIndex(registros.length - 1);
        else alert("Nenhum registro para imprimir.");
    });
}
