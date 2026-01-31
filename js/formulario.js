	// Removes leading whitespaces
	function LTrim( value ) {
		var re = /\s*((\S+\s*)*)/;
		return value.replace(re, "$1");
		
	}
	// Removes ending whitespaces
	function RTrim( value ) {	
		var re = /((\s*\S+)*)\s*/;
		return value.replace(re, "$1");
	}
	
	// Removes leading and ending whitespaces
	function trim( value ) {
		return LTrim(RTrim(value));
	}
	
	function ValidaForm(f){
		for (i=0; i<f.elements.length; i++) {
			objeto = f.elements[i];
			// Verificamos si el elemento es obligatorio
			if(objeto.id.search(/\*/) > 0){
				// Si es tipo de texto, entonces no debe estar vacio
				if (objeto.type == "text" || objeto.type == "password" || objeto.type == "textarea") {
					objeto.value = trim(objeto.value);
					if(trim(objeto.value) == ""){ // verificamos que no este vacio
						if(objeto.alt == "undefined" || objeto.alt == ""){
							alert("Todos los campos marcados con un asterisco tienen que tener valor.");
						} else { alert(objeto.alt); }
						if(objeto.tab != "" && objeto.tab != "undefined"){ 
							$("#example > ul").tabs("select", "#"+objeto.tab);
						} else {
							objeto.select();
							objeto.focus();
						}
						return false;
					} else { // Validamos que no tenga codigo javascript
						if(objeto.value.indexOf("<script") >= 0){
							alert("No se permite código javascript");
							if(objeto.tab != "" && objeto.tab != "undefined"){ 
								$("#example > ul").tabs("select", "#"+objeto.tab);
							} else {
								objeto.select();
								objeto.focus();
							}
							return false;
						}
						if(objeto.name == "correo"){ // verificamos si sintaxis de un correo
							if(objeto.value.search(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ig)){
								alert("La cuenta de correo electrónico es incorrecta, debes escribirla de forma: nombre@servidor.dominio");
								if(objeto.tab != "" && objeto.tab != "undefined"){ 
									$("#example > ul").tabs("select", "#"+objeto.tab);
								} else {
									objeto.select();
									objeto.focus();
								}
								return false;
							}
						}
					}
				}
				// Verificamos que los <SELECT> tengan seleccionado una opcion
				if(objeto.type == "select-one" && objeto.value == "0"){
					if(objeto.alt == "undefined" || objeto.alt == ""){
						alert("Tienes que seleccionar una opcion");
					} else {
						alert(objeto.alt);
					}
					if(objeto.tab != "" && objeto.tab != "undefined"){ 
						$("#example > ul").tabs("select", "#"+objeto.tab);
					} else {
						objeto.focus();
					}
					return false;
				}
				// Verificamos si las contraseñas escritas son iguales
				if(objeto.name == "contrasena_n"){
					if(objeto.value != document.getElementById("contrasena_r*").value){
						if(objeto.alt == "undefined" || objeto.alt == ""){
							alert("Las contraseñas escritas son diferentes.");
						} else {
							alert(objeto.alt);
						}
						objeto.value = "";
						document.getElementById("contrasena_r*").value = "";
						if(objeto.tab != "" && objeto.tab != "undefined"){ 
							$("#example > ul").tabs("select", "#"+objeto.tab);
						} else {
							objeto.select();
							objeto.focus();
						}
						return false;
					}
				}
				if(objeto.type == "checkbox" && objeto.checked == false){
					if(objeto.alt == "undefined" || objeto.alt == "") {
						alert("Tienes que activar esta opción.");
					} else {
						alert(objeto.alt);
					}
					if(objeto.tab != "" && objeto.tab != "undefined"){ 
						$("#example > ul").tabs("select", "#"+objeto.tab);
					} else {
						objeto.focus();
					}
					return false;
				}
				
				if(objeto.type == "radio"){
					var inputs = document.getElementsByName(objeto.name);
					var unRadioActivado = false;
					for(var j=0; j<inputs.length; j++){
						if(inputs[j].checked == true && inputs[j].type == "radio"){
							unRadioActivado = true;
						}
					}
					
					if(unRadioActivado == false){
						if(inputs[0].alt == "undefined" || inputs[0].alt == ""){
							alert("Tienes que seleccionar al menos una opción.");
						} else {
							alert(inputs[0].alt);
						}
						if(objeto.tab != "" && objeto.tab != "undefined"){ 
							$("#example > ul").tabs("select", "#"+objeto.tab);
						} // else {
						//objeto.select();
						//objeto.focus();
						return false;
					}
				}
				if(objeto.type == "file"){
					if(trim(objeto.value) == ""){
						if(objeto.alt == "undefined" || objeto.alt == ""){
							alert("Falta proporcionar un archivo.");
						} else {
							alert(objeto.alt);
						}
						if(objeto.tab != "" && objeto.tab != "undefined"){ 
							$("#example > ul").tabs("select", "#"+objeto.tab);
						} else {
							objeto.select();
							objeto.focus();
						}
						return false;
					} else {
						if(typeof(objeto.validos) != "undefined" && objeto.validos != ""){
							var expreg = new RegExp(".("+objeto.validos+")/i");
							if(objeto.value.search(objeto.validos)<2){
								var t = objeto.validos;
								alert("Solo se aceptan archivos: "+ t.replace(/\|/g, ", "));
								if(objeto.tab != "" && objeto.tab != "undefined"){ 
									$("#example > ul").tabs("select", "#"+objeto.tab);
								} else {
									objeto.select();
									objeto.focus();
								}
								return false;
							}
						}
						if(typeof(objeto.novalidos) != "undefined" && objeto.novalidos != ""){
							var expreg = new RegExp (".("+objeto.novalidos+")/i");
							if(objeto.value.search(objeto.novalidos) > 0){
								var t = objeto.novalidos;
								alert("NO se aceptan archivos: "+ t.replace(/\|/g, ", "));
								if(objeto.tab != "" && objeto.tab != "undefined"){ 
									$("#example > ul").tabs("select", "#"+objeto.tab);
								} else {
									objeto.select();
									objeto.focus();
								}
								return false;
							}
						}
					}
				}
			}
		}
		return true;
	}
	
	function iniForm() {
		if(document.forms[0]){
			var inputs = document.forms[0].elements; var i=0;
			// Verificamos que los primeros campos no sean de type=hidden, porque NO se puede hacer un FOCUS() a estos objetos
			while(inputs[i].type.toLowerCase() == "hidden"){ i++; }
			// Luego hacemos el FOCUS() al primero objeto
			inputs[i].focus();
			// Si es de tipo SELECT, SUBMIT, RESET o BUTTON, entonces NO podemos hacerle un SELECT()
			if(inputs[i].tagName.toUpperCase() != "SELECT" && 
				inputs[i].type.toLowerCase() != "button" && 
				inputs[i].type.toLowerCase() != "submit" && 
				inputs[i].type.toLowerCase() != "reset" ){
				inputs[i].select();
			}
		}
	}
	
	addLoadEvent(iniForm);