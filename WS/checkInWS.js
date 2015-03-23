var ID_USUARIO = window.localStorage.UsuarioId;						//id do usuario
var TOKEN = window.localStorage.UsuarioToken;						//token do usuario
var string = window.localStorage.produtoRecemAdicionado;			//string do localstorage com os id das listas e dos produtos recem adicionados no checkin
if(string == undefined){											//se string for indefinida
	window.localStorage.produtoRecemAdicionado = "";				//crie a variavel no localStoragee
	string = window.localStorage.produtoRecemAdicionado;			//salve na variavel string
}
var produtosRecemAdicionado = string.split(",");					//converter string em array


var estabelecimentos = [];
//__________________ ABRIR MODAL CHECKIN _____________________//
function abrirModalCheckin(flagCheckin){

	if(flagCheckin == "principal" || flagCheckin=="estabelecimento"){
		$.ajax({
			type: 'POST'
			, url: "http://192.168.1.99/Servidor/ListaDeProdutos.asmx/listarListas" 
			, crossDomain:true
			, contentType: 'application/json; charset=utf-8'
			, dataType: 'json'						
			, data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"'}"
			, success: function (data, status){                    
				var listas = $.parseJSON(data.d);
				document.getElementById("listasCheckin").innerHTML = "";
				
					for(var i=0; i<listas.length; i++){

					var select = document.createElement("option");
					select.setAttribute("value",listas[i].id_listaDeProdutos);
					select.innerHTML = listas[i].nome;
					var pai = document.getElementById("listasCheckin");
					pai.appendChild(select);
					}
					
			}
			, error: function (xmlHttpRequest, status, err) {
				alert("Ocorreu um erro no servidor");
			}
		});
	}
	
	if(flagCheckin == "principal" || flagCheckin=="lista"){
		$.ajax({
			type: 'POST'
			, url: "http://192.168.1.99/Servidor/Estabelecimento.asmx/listarEstabelecimento"
			, crossDomain:true
			, contentType: 'application/json; charset=utf-8'
			, dataType: 'json'
			, data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',nome:'',bairro:'',cidade:''}"
			, success: function (data, status){                    
				estabelecimentos = $.parseJSON(data.d);
				calcularEstabProximo(estabelecimentos); 
			}
			, error: function (xmlHttpRequest, status, err) {
				alert("Ocorreu um erro no servidor");
			}
		});
	}
	
	$('#myModalCheckin').modal('show');
}

//_________________ ESCOLHER ESTABELECIMENTO ___________________//
function escolherEstabelecimento(){										                   
	var estabelecimentosFormatados = [];
	
	for(var i=0; i<estabelecimentos.length; i++)
	estabelecimentosFormatados[i] = estabelecimentos[i].nome+" - "+estabelecimentos[i].bairro;
	
	$("#estabCheckin").autocomplete({ source: estabelecimentosFormatados}); 
}

//__________________ INICIAR CHECKIN __________________________//
function iniciarCheckin(flagCheckin){
	if(flagCheckin=="principal"){
		var idLista = $("#listasCheckin").val();
		window.localStorage.idListaClicada = idLista;
	}	
	if(flagCheckin=="lista"){
		var idLista = window.localStorage.idListaClicada;
	}	
	
	if(flagCheckin=="estab"){
		var idLista = $("#listasCheckin").val();
		var queries = {};
		$.each(document.location.search.substr(1).split('&'), function(c,q){
			var i = q.split('=');
			queries[i[0].toString()] = i[1].toString();
		});

		var idEstabelecimento=queries['id'];
	}	
	else{
		var estabelecimento = $("#estabCheckin").val();
		var aux=0;
		
		for(var a=0; a<estabelecimento.length; a++)
			if(estabelecimento[a]!= "-")
			aux++;
			else break;
			
		var nomeEstabelecimento = estabelecimento.substring(0,aux-1);
		
		for(var u=0; u<estabelecimentos.length; u++)
			if(estabelecimentos[u].nome==nomeEstabelecimento){
			var idEstabelecimento = estabelecimentos[u].id_estabelecimento;
			break;}
	}	
	
		
	window.localStorage.listaClicadaCheckin = idLista;
	window.localStorage.estabelecimentoClicadoCheckin = idEstabelecimento;
	window.location = "checkin.html";
}

//_________________ LISTA PRODUTOS PARA SER REALIZADO O CHECKIN _________________//
function retornarProdutosCheckIn(){	

	var idLista = window.localStorage.listaClicadaCheckin;							
	var idEstabelecimento =	window.localStorage.estabelecimentoClicadoCheckin; 		

	$.ajax({																		
        type: 'POST'
        , url: "http://192.168.1.99/Servidor/ListaDeProdutos.asmx/retornarItens" 
		, crossDomain:true
        , contentType: 'application/json; charset=utf-8'
        , dataType: 'json'
        , data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',idLista:'"+idLista+"',idEstabelecimento:'"+idEstabelecimento+"'}" 
        , success: function (data, status){                    
			var produtos = $.parseJSON(data.d);								
			document.getElementById("conteudo").innerHTML = "";		
				for(var i=0; i<produtos.length ;i++)						
				htmlListarProdutos2(produtos[i]);							
        }
        , error: function (xmlHttpRequest, status, err) {					
            alert('Ocorreu um erro no servidor');							
        }
    });
}

//___________________________ FUN��O GUARDAR ITENS ________________________________//
var itens = [];
var acessoItens = 0;
var total = 0;
function guardarItem(idProduto){
	modalEditarPreco(idProduto);
	document.getElementById("totalLista").innerHTML="";
	
	var checkBox = document.getElementById(idProduto);
	var quantidade = parseFloat(document.getElementById(idProduto+"quant").title);
	var precoProduto = parseFloat(document.getElementById(idProduto).alt);
	
	if(checkBox.checked == true){	
		document.getElementById(idProduto+"prod").className = "nome-produto-riscar";  		
		total += quantidade*precoProduto;
		document.getElementById("totalLista").innerHTML = "Total: R$ "+total.toFixed(2);

	}else{
		document.getElementById(idProduto+"prod").className = "nome-produto-desriscar";  		
		total-= quantidade*precoProduto;
		document.getElementById("totalLista").innerHTML = "Total: R$ "+total.toFixed(2);
	
	}
}

//___________________ MODAL EDITAR PRECO__________________________//
function modalEditarPreco(idProduto){
	var checkBox = document.getElementById(idProduto);
	
	if(checkBox.checked == true){	
		window.localStorage.idProdutoAbertoModal = idProduto;
		var preco = document.getElementById(idProduto).title;
		document.getElementById("preco").placeholder = preco;
		document.getElementById("preco").value = "";
		
	$('#confirmar_preco').modal('show');
	}
}

//___________________________ EDITAR PRODUTOS ___________________________//
function editarPreco(){
	var idProduto = window.localStorage.idProdutoAbertoModal;
	var preco = document.getElementById(idProduto).alt;
	var precoColocado = document.getElementById("preco").value;
	
	if(preco.match(/^-?\d*\.?\d+$/) && precoColocado!="")
	{
		var quantidade = parseFloat(document.getElementById(idProduto+"quant").title);
		var valorEditado =  document.getElementById("preco").value;
		var valorAntigo = document.getElementById(idProduto).alt;

		total -= quantidade*valorAntigo;
		
		var valorPreco = document.getElementById(idProduto+"preco");
		document.getElementById(idProduto).title = valorEditado;
		document.getElementById(idProduto).alt = valorEditado;
		
		valorPreco.innerHTML = "R$ " +valorEditado;
		$('#confirmar_preco').modal('hide');
		
		total += quantidade*valorEditado;
		document.getElementById("totalLista").innerHTML = "Total: R$ "+total.toFixed(2);	
	}else{
		alert("Coloque um preco em um formato valido!");
	}
}	

function checkout(){
	document.getElementById("totalCheckout").innerHTML = "Total: R$ "+total.toFixed(2);
}


//________________ LISTAR PRODUTOS _______________________//
function htmlListarProdutos2(produtos){
	var conteudo = document.createElement("div");
	
	//---- controle marca ---//
	if(produtos.marca == "")
		var marca = "Marca nao cadastrada";
	else
		var marca = produtos.marca;
		
	//---- controle pre�o ---//	
	if(produtos.preco == 0)
		var preco = "Sem valor cadastrado";
	else
		var preco = "R$ "+(produtos.preco).toFixed(2);
	
	conteudo.innerHTML = 
	 "<ul class='menu-principal listas-checkin'>"
	+	"<li class='list-group-item'>"
	+		 "<div class='icone-remover-produto-checkin'>"
	+			 "<img src='img/remove.png' width='20' />"
	+		"</div>"
	+		 "<a href='#' id='"+produtos.id_produto+"prod"+"'> "+produtos.nome+" </a>"
	+		"<span class='sub-titulo-menu' id='"+produtos.id_produto+"preco"+"'> "+preco+" </span>"
	+		"<div class='subtitulo-produto' title='"+produtos.quantidade+"' id='"+produtos.id_produto+"quant"+"'>"
	+			"Quantidade: "+produtos.quantidade+"<br /> "+marca+" </div>"
	+		"<div class='btn-acao'>"
	+			"<div class='checkbox checkin-box'>"
	+				"<label>"
	+					"<input type='checkbox' alt='"+produtos.preco+"' title='"+preco+"' id='"+produtos.id_produto+"' onclick='guardarItem("+produtos.id_produto+")'>"
	+				"</label>"
	+			"</div>"
	+		"</div>"
	+	"</li>"
	+"</ul>"
	
	var pai = document.getElementById("conteudo");
	pai.appendChild(conteudo);	
}

//_____________________ ACHAR ESTABELECIMENTO MAIS PR�XIMO ____________________//
function distLatLong(lat1,lon1,lat2,lon2) {
  var R = 6371; // raio da terra
  var Lati = Math.PI/180*(lat2-lat1);  //Graus  - > Radianos
  var Long = Math.PI/180*(lon2-lon1); 
  var a = 
	Math.sin(Lati/2) * Math.sin(Lati/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(Long/2) * Math.sin(Long/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // dist�ncia en km
  return((d*1).toFixed(4));
}

function deg2rad(degree) {
    return degree * (Math.PI / 180);
}

function calcularEstabProximo(estabelecimentos){
var latitudeGeolocation = window.localStorage.lat;												
var longitudeGeolocation = window.localStorage.lon;	
	
	var menorDistancia = "";
	var estabelecimentoMenorDistancia;
	var indice = 0;
	for(var pos=0; pos<estabelecimentos.length; pos++){
		var distancia = distLatLong(latitudeGeolocation,longitudeGeolocation,estabelecimentos[pos].latitude,estabelecimentos[pos].longitude);
		if(menorDistancia == "" && distancia<1.0){
			menorDistancia = distancia;
			estabelecimentoMenorDistancia = estabelecimentos[pos];
			indice = pos;
		}else if(distancia<menorDistancia && distancia<1.0){
			menorDistancia = distancia;
			estabelecimentoMenorDistancia = estabelecimentos[pos];
			indice = pos;
		}
	}
	
	if(menorDistancia != ""){	
		alert("O estabelecimeto mais proximo e o "+estabelecimentoMenorDistancia.nome +"\n"+ estabelecimentoMenorDistancia.bairro);					
	}
}