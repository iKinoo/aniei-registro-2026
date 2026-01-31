	var n = 0;
	
	function AgregarFila(){
		var num = n++;
		pepe = document.getElementById("tabla"); 
		fila = document.createElement("tr");
		fila.id="f"+pepe.rows.length;
		
		celda = document.createElement("td"); 
		fila.appendChild(celda);       
		descrip=document.createElement("input");
		descrip.id = "grupo_nombre" + num +"*";
		descrip.name="grupo_nombre[]";
		descrip.alt = "Olvidaste escribir un NOMBRE de un elemento del grupo.";
		celda.appendChild(descrip); 
		pepe.appendChild(fila);
		
		celda = document.createElement("td"); 
		fila.appendChild(celda);       
		descrip=document.createElement("input");
		descrip.id = "grupo_apellido" + num +"*";
		descrip.name="grupo_apellido[]"; 
		descrip.alt = "Olvidaste escribir un APELLIDO de un elemento del grupo.";
		celda.appendChild(descrip); 
		pepe.appendChild(fila);
		
		celda = document.createElement("td");
		fila.appendChild(celda);       
		descrip=document.createElement("select");
		descrip.id = "grupo_genero[]" + num +"*";
		descrip.name="grupo_genero[]";
		descrip.options[descrip.length] = new Option("Elija", "0");
		descrip.options[descrip.length] = new Option("Masculino", "M");
		descrip.options[descrip.length] = new Option("Femenino", "F");
		descrip.alt = "Olvidaste seleccionar el GÉNERO de un elemento del grupo.";
		celda.appendChild(descrip); 
		pepe.appendChild(fila);
		
		celda = document.createElement("td");
		fila.appendChild(celda);       
		descrip=document.createElement("input");
		descrip.type = "button";
		descrip.id = "grupo_genero[]" + num +"*";
		descrip.name="button[]";
		descrip.value = "Mostrar/Ocultar";
		descrip.onclick = function(){
			$("ul#listaActividades"+num).animate({ height: 'toggle'}, 'slow');
		}
		celda.appendChild(descrip); 
		pepe.appendChild(fila);
		
		celda = document.createElement("td"); 
		fila.appendChild(celda);       
		descrip=document.createElement("img");
		descrip.src = "../img/eliminar.png";
		descrip.alt = "Eliminar";
		descrip.style.cursor = "pointer";
		descrip.onclick = function() { BorrarFila(this); }
		celda.appendChild(descrip);
		
		fila = document.createElement("tr");
		fila.id="f"+pepe.rows.length;
		celda = document.createElement("td");
		celda.colSpan = "5";
		fila.appendChild(celda);
		descrip=document.getElementById("listaActividades");
		lista = descrip.cloneNode(true);
		lista.id = "listaActividades"+num;
		lista.name = "grupo_talleres["+num+"]";
		celda.appendChild(lista);
		pepe.appendChild(fila);
		var t = document.getElementsBySelector("ul#listaActividades"+num+" input[type=checkbox]");
		for(var i=0; i<=t.length; i++){ t[i].name = "grupo_talleres["+num+"][]"; }
		
		return false;
	}
	
	function BorrarFila(obj) {
		tab = document.getElementById('tabla');
		while (obj.tagName != 'TR') { obj = obj.parentNode; }
		for (i=1; ele=tab.getElementsByTagName('tr')[i]; i++) { 
			if(ele==obj) { 
				var num=i;
			}
		}
		tab.deleteRow(num);
		return false;
	}
	
	//addLoadEvent(AgregarFila);