function Validar2(forma) {
	if ( trim(forma.rfc.value) != "") {
		if ( trim(forma.razon.value) == "") {
			alert("Debes escribir la razón social de tu RFC.");
			if(objeto.tab != "" && objeto.tab != "undefined"){ $("#example > ul").tabs("select", "#"+objeto.tab); } else { forma.razon.focus(); }
			return false;
		}
		if ( trim(forma.calle.value) == "") {
			alert("Debes escribir la calle de la dirección de tu RFC.");
			if(objeto.tab != "" && objeto.tab != "undefined"){ $("#example > ul").tabs("select", "#"+objeto.tab); } else { forma.calle.focus(); }
			return false;
		}
		if ( trim(forma.num_ext.value) == "") {
			alert("Debes escribir el número de la dirección de tu RFC.");
			if(objeto.tab != "" && objeto.tab != "undefined"){ $("#example > ul").tabs("select", "#"+objeto.tab); } else { forma.num_ext.focus(); }
			return false;
		}
		if ( trim(forma.colonia.value) == "") {
			alert("Debes escribir la colonia de la dirección de tu RFC.");
			if(objeto.tab != "" && objeto.tab != "undefined"){ $("#example > ul").tabs("select", "#"+objeto.tab); } else { forma.colonia.focus(); }
			return false;
		}
		if ( trim(forma.municipio.value) == "") {
			alert("Debes escribir el municipio de la dirección de tu RFC.");
			if(objeto.tab != "" && objeto.tab != "undefined"){ $("#example > ul").tabs("select", "#"+objeto.tab); } else {  forma.municipio.focus(); }
			return false;
		}
		if ( trim(forma.postal.value) == "") {
			alert("Debes escribir el código postal de la dirección de tu RFC.");
			if(objeto.tab != "" && objeto.tab != "undefined"){ $("#example > ul").tabs("select", "#"+objeto.tab); } else { forma.postal.focus(); }
			return false;
		}
		indice = forma.select.selectedIndex;
	    if(indice == null || indice == 0){
			alert("Debes seleccionar un estado en los datos de facturación.");
			if(objeto.tab != "" && objeto.tab != "undefined"){ $("#example > ul").tabs("select", "#"+objeto.tab); } else { forma.select.focus(); }
			return false;
	    }
	}
	
	
	if ( trim(forma.monto.value) != "") {
		if ( trim(forma.referencia_dep.value ) == "") {
			alert("Debes escribir el número de referencia del depósito.");
			if(objeto.tab != "" && objeto.tab != "undefined"){ $("#example > ul").tabs("select", "#"+objeto.tab); } else {  forma.referencia_dep.focus(); }
			return false;
		}
		if( trim(forma.fecha_dep.value) == ""){
			   alert("Debes escribir la fecha del depósito.");
				if(objeto.tab != "" && objeto.tab != "undefined"){ $("#example > ul").tabs("select", "#"+objeto.tab); } else {  forma.fecha_dep.select();
				forma.fecha_dep.focus(); }
				return false;
		}
		if ( trim(forma.monto.value) == ""){
			alert("Debes escribir el monto del depósito.");
			if(objeto.tab != "" && objeto.tab != "undefined"){ $("#example > ul").tabs("select", "#"+objeto.tab); } else {  forma.monto.focus(); }
			return false;
		} else {
			if(isNaN(forma.monto.value)){
				alert("El monto no es un valor numérico.");
				if(objeto.tab != "" && objeto.tab != "undefined"){ $("#example > ul").tabs("select", "#"+objeto.tab); } else {  forma.monto.select();
				forma.monto.focus(); }
				return false;
			} else {
			  	if(forma.monto.value.search(/^(?:\+|-)?\d+\.\d*$/i)){
				  	alert("El formato de número es incorrecto para el monto.");
				  	if(objeto.tab != "" && objeto.tab != "undefined"){ $("#example > ul").tabs("select", "#"+objeto.tab); } else {  forma.monto.select();
				  	forma.monto.focus(); }
				  	return false;
				}
			}
		}
	}
	return true;
}

function ActivaTitular(forma){
	forma.titular.disabled=forma.check_editar.checked;
}