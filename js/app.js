$(document).ready(function () {
    cardapio.eventos.init();
})

var cardapio = {};

var MEU_CARRINHO = [];
var MEU_ENDERECO = null;

var VALOR_CARRINHO = 0;
var VALOR_ENTREGA = 5;

var CELULAR_EMPRESA = ''; // PARA TESTAR INTEGRAÇÃO COM WHATSAPP, INSERIR O TELEFONE NO FORMATO DDI+DDD+NUMERO, EX: '558399999999'

cardapio.eventos = {

    init: () => {
        cardapio.metodos.obterItensCardapio(); // CARREGA OS ITENS DO CARDAPIO AO INICIAR APLICAÇÃO
        cardapio.metodos.carregarBotaoLigar(); // CARREGA O BOTÃO DE LIGAR AO INICIAR APLICAÇÃO
        cardapio.metodos.carregarBotaoReserva(); // ISSO PODE SER REMOVIDO -- NÃO QUERO REALIZAR RESERVA
        
    }

}

cardapio.metodos = {

    // OBTEM A LISTA DE ITENS DO CARDAPIO
    obterItensCardapio: (categoria = 'burgers', vermais = false) => {

        var filtro = MENU[categoria];
        console.log(filtro);

        if (!vermais) {
            $("#itensCardapio").html('');
            $("#btnVerMais").removeClass('hidden');
        }


        $.each(filtro, (i, e) => {

            let temp = cardapio.templates.item.replace(/\${img}/g, e.img)
            .replace(/\${nome}/g, e.name)
            .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
            .replace(/\${id}/g, e.id)

            // BOTÃO VER MAIS FOI CLICADO (12 ITENS)
            if (vermais && i >= 8 && i < 12) {
                $("#itensCardapio").append(temp)
            }

            // PAGINAÇÃO INICIAL (8 ITENS)
            if (!vermais && i < 8) {
                $("#itensCardapio").append(temp)
            }
            

        })

        // REMOVE O ATIVO
        $(".container-menu a").removeClass('active');

        // SETA O MENU PARA ATIVO
        $("#menu-" + categoria).addClass('active')

    },

    // CLIQUE NO BOTÃO DE VER MAIS
    verMais: () => {

        var ativo = $(".container-menu a.active").attr('id').split('menu-')[1];
        cardapio.metodos.obterItensCardapio(ativo, true);

        $("#btnVerMais").addClass('hidden');

    },
    
    // DIMINUIR A QUANTIDADE DO ITEM NO CARDÁPIO
    diminuirQuantidade: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());

        if (qntdAtual > 0) {
            $("#qntd-" + id).text(qntdAtual - 1)
        }

    },
    
    // AUMENTAR A QUANTIDADE DO ITEM NO CARDÁPIO
    aumentarQuantidade: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());
        $("#qntd-" + id).text(qntdAtual + 1);
    },
    
    // ADICIONAR ITEM AO CARRINHO
    adicionarAoCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());

        if (qntdAtual >0) {

            // OBTER CATEGORIA ATIVA
            var categoria = $(".container-menu a.active").attr('id').split('menu-')[1];

            // OBTER A LISTA DE ITENS
            let filtro = MENU[categoria];

            // OBTER O ITEM
            let item = $.grep(filtro, (e, i) => { return e.id == id });

            if (item.length > 0) {

                // VALIDAR SE JÁ EXISTE O ITEM NO CARRINHO
                let existe = $.grep(MEU_CARRINHO, (elem, index) => { return elem.id == id});

                // CASO JÁ EXISTA, SÓ ALTERA A QUANTIDADE
                if (existe.length > 0) {
                    let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
                    MEU_CARRINHO[objIndex].qntd = MEU_CARRINHO[objIndex].qntd + qntdAtual;
                }
                // CASO AINDA NÃO EXISTA O ITEM NO CARRINHO, ADICIONA O MESMO
                else {
                    item[0].qntd = qntdAtual;
                    MEU_CARRINHO.push(item[0]) 
                }

                cardapio.metodos.mensagem('Item adicionado com sucesso!', 'green')
                $("#qntd-" + id).text(0);

                cardapio.metodos.atualizarBadgeTotal();

            }

        }

    },
    
    // ATUALIZAR O BADGE DE TOTAIS DOS BOTÕES DO CARRINHO
    atualizarBadgeTotal: () => {

        var total = 0;

        $.each(MEU_CARRINHO, (i, e) => {
            total += e.qntd
        })

        if (total > 0) {
            $(".botao-carrinho").removeClass('hidden');
            $(".container-total-carrinho").removeClass('hidden');
        }
        else {
            $(".botao-carrinho").addClass('hidden');
            $(".container-total-carrinho").addClass('hidden');
        }

        $(".badge-total-carrinho").html(total);

        

    },

    // ABRIR MODAL DO PEDIDO
    abrirCarrinho: (abrir) => {
        
        if (abrir) {
            $("#modalCarrinho").removeClass('hidden');
            cardapio.metodos.carregarCarrinho();
        }
        else {
            $("#modalCarrinho").addClass('hidden');
        }

    },

    // ALTERAR AS ETAPAS
    carregarEtapa: (etapa) => {

        if (etapa == 1) {
            $("#lblTituloEtapa").text('Seu pedido:');
            $("#itensCarrinho").removeClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');

            $("#btnEtapaPedido").removeClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").addClass('hidden');
        }

        if (etapa == 2) {
            $("#lblTituloEtapa").text('Dados para entrega:');
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").removeClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');

            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").removeClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }

        if (etapa == 3) {
            $("#lblTituloEtapa").text('Resumo do pedido:');
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").removeClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');
            $(".etapa3").addClass('active');

            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").removeClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }

    },

    // VOLTAR ETAPAS
    voltarEtapa: () => {

        let etapa = $(".etapa.active").length;
        cardapio.metodos.carregarEtapa(etapa - 1);

    },

    // CARREGAR LISTA DE ITENS DO PEDIDO
    carregarCarrinho: () => {

        cardapio.metodos.carregarEtapa(1);

        if (MEU_CARRINHO.length > 0) {

            $("#itensCarrinho").html('');

            $.each(MEU_CARRINHO, (i, e) => {

                let temp = cardapio.templates.itemCarrinho.replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${id}/g, e.id)
                .replace(/\${qntd}/g, e.qntd)

                $("#itensCarrinho").append(temp);

                // ÚLTIMO ITEM DO CARRINHO
                if ((i + 1) == MEU_CARRINHO.length) {
                    cardapio.metodos.carregarValores();
                }

            })

        }
        else {
            $("#itensCarrinho").html('<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i> Seu carrinho está vazio!</p>');
            cardapio.metodos.carregarValores()
        }

    },

    // DIMINUI A QUANTIDADE DO ITEM NO CARRINHO
    diminuirQuantidadeCarrinho: (id) => {

            let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
    
            if (qntdAtual > 1) {
                $("#qntd-carrinho-" + id).text(qntdAtual - 1)
                cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1);
            }
            else {
                cardapio.metodos.removerItemCarrinho(id)
            }

    },

    // AUMENTA A QUANTIDADE DO ITEM NO CARRINHO
    aumentarQuantidadeCarrinho: (id) => {
        
            let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
            $("#qntd-carrinho-" + id).text(qntdAtual + 1)
            cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1);
    },

    // REMOVER ITEM DO CARRINHO
    removerItemCarrinho: (id) => {

        MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => { return e.id != id });
        cardapio.metodos.carregarCarrinho();

        // ATUALIZA O BOTÃO CARRINHO COM A QUANTIDADE ATUALIADA
        cardapio.metodos.atualizarBadgeTotal();

    },

    // ATUALIZA O CARRINHO COM QUANTIDADE ATUAL DE ITENS
    atualizarCarrinho: (id, qntd) => {

        let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
        MEU_CARRINHO[objIndex].qntd = qntd;

        // ATUALIZA O BOTÃO CARRINHO COM A QUANTIDADE ATUALIADA
        cardapio.metodos.atualizarBadgeTotal();

        // ATUALIZA OS VALORES TOTAIS DO CARRINHO EM R$
        cardapio.metodos.carregarValores();

    },

    // CARREGA VALORES DE SUBTOTAL, ENTREGA E TOTAL
    carregarValores: () => {

        VALOR_CARRINHO = 0;

        $("#lblSubTotal").text('R$ 0,00');
        $("#lblValorEntrega").text('+ R$ 0,00');
        $("#lblValorTotal").text('R$ 0,00');

        $.each(MEU_CARRINHO, (i, e) => {

            VALOR_CARRINHO += parseFloat(e.price * e.qntd);

            if ((i + 1) == MEU_CARRINHO.length) {
                $("#lblSubTotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace('.', ',')}`);
                $("#lblValorEntrega").text(`R$ ${VALOR_ENTREGA.toFixed(2).replace('.', ',')}`);
                $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}`);
            }

        })

    },


    // CARREGAR A ETAPA DE ENDEREÇO
    carregarEndereco: () => {
        if (MEU_CARRINHO.length <= 0) {
            cardapio.metodos.mensagem('Você ainda não escolheu nenhum item!')
            return;
        }

        cardapio.metodos.carregarEtapa(2);

    },


    // BUSCA DE ENDEREÇO API ViaCEP
    buscarCEP: () => {

        // VARIÁVEL COM O VALOR DO CEP CRIADA
        var cep = $("#txtCEP").val().trim().replace(/\D/g, '')

        // CHECA SE O CEP POSSUI VALOR INFORMADO
        if (cep != "") {

            // EXPRESSÃO REGULAR PARA VALIDAR CEP
            var validacep = /^[0-9]{8}$/;

            if(validacep.test(cep)) {

                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function(dados) {

                    if (!("erro" in dados)) {

                        // ATUALIZAR OS CAMPOS COM OS VALORES RETORNADOS
                        $("#txtEndereco").val(dados.logradouro);
                        $("#txtBairro").val(dados.bairro);
                        $("#txtCidade").val(dados.localidade);
                        $("#ddlUf").val(dados.uf);
                        $("#txtNumero").focus();
                
                    }
                    else {
                        cardapio.metodos.mensagem('CEP não encontrado. Preencha as informações manualmente.');
                        $("#txtEndereco").focus();
                    }

                })

            }
            else {
                cardapio.metodos.mensagem('CEP inválido');
                $("#txtCEP").focus();
            }

        }
        else {
            cardapio.metodos.mensagem('Informe o seu CEP.')
            $("#txtCEP").focus();
        }

    },

    // VALIDAÇÃO ANTES DE IR PARA FINALIZAR O PEDIDO
    resumoPedido: () => {

        let nomeCliente = $("#txtNome").val().trim();
        let cep = $("#txtCEP").val().trim();
        let endereco = $("#txtEndereco").val().trim();
        let bairro = $("#txtBairro").val().trim();
        let cidade = $("#txtCidade").val().trim();
        let uf = $("#ddlUf").val().trim();
        let numero = $("#txtNumero").val().trim();
        let complemento = $("#txtComplemento").val().trim();

        if (nomeCliente <= 0) {
            cardapio.metodos.mensagem('Para melhor identificação do seu pedido, por favor informe seu nome.');
            $("#txtNome").focus();
            return;
        }

        if (cep.length <= 0) {
            cardapio.metodos.mensagem('Informe o CEP, por favor.');
            $("#txtCEP").focus();
            return;
        }

        if (endereco.length <= 0) {
            cardapio.metodos.mensagem('Informe o endereço, por favor.');
            $("#txtEndereco").focus();
            return;
        }

        if (bairro.length <= 0) {
            cardapio.metodos.mensagem('Informe o bairro, por favor.');
            $("#txtBairro").focus();
            return;
        }

        if (cidade.length <= 0) {
            cardapio.metodos.mensagem('Informe a cidade, por favor.');
            $("#txtCidade").focus();
            return;
        }

        if (uf == -1) {
            cardapio.metodos.mensagem('Informe a UF, por favor.');
            $("#ddlUf").focus();
            return;
        }

        if (numero.length <= 0) {
            cardapio.metodos.mensagem('Informe o numero, por favor.');
            $("#txtNumero").focus();
            return;
        }

        MEU_ENDERECO = {

            nomeCliente: nomeCliente,
            cep: cep,
            endereco: endereco,
            bairro: bairro,
            cidade: cidade,
            uf: uf,
            numero: numero,
            complemento: complemento

        }

        cardapio.metodos.carregarEtapa(3);
        cardapio.metodos.carregarResumo();

    },

    // CARREGA A PARTE FINAL DO PEDIDO
    carregarResumo: () => {

        $("#listaItensResumo").html('');

        $.each(MEU_CARRINHO, (i, e) => {

            let temp = cardapio.templates.itemResumo.replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${qntd}/g, e.qntd)

            $("#listaItensResumo").append(temp);

        });

        $("#resumoEndereco").html(`${MEU_ENDERECO.nomeCliente} - ${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`);
        $("#cidadeEndereco").html(`${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`);


        cardapio.metodos.finalizarPedido();


    },

    // ATUALIZA O LINK DO BOTÃO DO WHATSAPP
    finalizarPedido: () => {

        if (MEU_CARRINHO.length > 0 && MEU_CARRINHO != null) {

            var texto = 'Olá! Gostaria de fazer um pedido:';
            texto += `\n\n*Itens do pedido:*\n\n\${itens}`;
            texto += '\n*Dados para entrega:*';
            texto += `\n\n${MEU_ENDERECO.nomeCliente}`;
            texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`;
            texto += `\n${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`;
            texto += `\n\n*Total (com entrega): R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}*`;

            var itens = '';

            $.each(MEU_CARRINHO, (i, e) => {

                itens += `*${e.qntd}x* ${e.name} ....... R$ ${e.price.toFixed(2).replace('.', ',')} \n`;

                if ((i + 1) == MEU_CARRINHO.length) {

                    texto = texto.replace(/\${itens}/g, itens);

                    // CONVERTER A URL
                    let encode = encodeURI(texto);
                    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

                    $("#btnEtapaResumo").attr('href', URL);

                }


            })

        }

    },

    // CARREGAR O LINK DO BOTÃO RESERVA
    carregarBotaoReserva: () => {

        var texto = 'Olá! Gostaria de fazer uma *reserva*.';

        let encode = encodeURI(texto);
        let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

        $("#btnReserva").attr('href', URL);

    },

    // CARREGAR O BOTAO DE LIGAR
    carregarBotaoLigar: () => {

        $("#btnLigar").attr('href', `tel:${CELULAR_EMPRESA}`);

    },

    // ABRE O DEPOIMENTO
    abrirDepoimento: (depoimento) => {

        $("#depoimento-1").addClass('hidden');
        $("#depoimento-2").addClass('hidden');
        $("#depoimento-3").addClass('hidden');

        $("#btnDepoimento-1").removeClass('active');
        $("#btnDepoimento-2").removeClass('active');
        $("#btnDepoimento-3").removeClass('active');

        $("#depoimento-" + depoimento).removeClass('hidden');
        $("#btnDepoimento-" + depoimento).addClass('active');

    },

    // MENSAGENS EXIBIDAS NA TELA  
    mensagem: (texto, cor = 'red', tempo = 3500) => {

        let id = Math.floor(Date.now() * Math.random()).toString();

        let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;

        $("#container-mensagens").append(msg);

        setTimeout(() => {
            $("#msg-" + id).removeClass('fadeInDown');
            $("#msg-" + id).addClass('fadeOutUp');
            setTimeout(() => {
                $("#msg-" + id).remove();
            }, 800);
        }, tempo)

    }

}
// TEMPLATE A SER UTILIZADO NOS CARDS DOS PRODUTOS
cardapio.templates = {
    item: `
        <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp">
            <div class="card card-item" id="\${id}">
                <div class="img-produto">
                    <img src="\${img}" />
                </div>
                <p class="title-produto text-center mt-4">
                    <b>\${nome}</b>
                </p>
                <p class="price-produto text-center">
                    <b>R$ \${preco}</b>
                </p>
                <div class="add-carrinho">
                    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-itens" id="qntd-\${id}">0</span>
                    <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                    <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fas fa-shopping-bag"></i></span>
                </div>
            </div>
        </div>
    `,

    itemCarrinho: `
        <div class="col-12 item-carrinho">
            <div class="img-produto">
                <img src="\${img}" />
            </div>
            <div class="dados-produto">
                <p class="title-produto"><b>\${nome}</b></p>
                <p class="price-produto"><b>R$ \${preco}</b></p>
            </div>
            <div class="add-carrinho">
                <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
                <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-remove no-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
            </div>
        </div>
    `,

    itemResumo: `
        <div class="col-12 item-carrinho resumo">
            <div class="img-produto-resumo">
                <img src="\${img}" />
            </div>
            <div class="dados-produto">
                <p class="title-produto-resumo">
                    <b>\${nome}</b>
                </p>
                <p class="price-produto-resumo">
                    <b>R$ \${preco}</b>
                </p>
            </div>
            <p class="quantidade-produto-resumo">
                x <b>\${qntd}</b>
                </p>
        </div>
    `
}