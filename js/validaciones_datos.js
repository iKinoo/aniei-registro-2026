/*************************************************************************************************************************/
/* Validación de campos numericos                                                                                        */
/*************************************************************************************************************************/

//la funcion \"IsInteger(YourNumber)\" chequea si \"YourNumber\" es un numero entero con o sin signo valido
//La variable \"YourNumber\" es una cadena de caracteres
function IsInteger(YourNumber){
	var Template = /^[+|-]?d+$/ //Formato de numero entero
	return (Template.test(YourNumber)) ? 1 : 0 //Compara \"YourNumber\" con el formato \"Template\" y si coincidevuelve verdadero si no devuelve falso
}

//la funcion \"IsSignedInteger(YourNumber)\" chequea si \"YourNumber\" es un numero entero con signo valido
//La variable \"YourNumber\" es una cadena de caracteres
function IsSignedInteger(YourNumber){
	var Template = /^[+|-]d+$/ //Formato de numero entero con signo
	return (Template.test(YourNumber)) ? 1 : 0 //Compara \"YourNumber\" con el formato \"Template\" y si coincidevuelve verdadero si no devuelve falso
}

//la funcion \"IsUnsignedInteger(YourNumber)\" chequea si \"YourNumber\" es un numero entero sin signo valido
//La variable \"YourNumber\" es una cadena de caracteres
function IsUnsignedInteger(YourNumber){
	var Template = /^d+$/ //Formato de numero entero sin signo
	return (Template.test(YourNumber)) ? 1 : 0 //Compara \"YourNumber\" con el formato \"Template\" y si coincidevuelve verdadero si no devuelve falso
}

//la funcion \"IsReal(YourNumber)\" chequea si \"YourNumber\" es un numero real con o sin signo valido
//La variable \"YourNumber\" es una cadena de caracteres
function IsReal(YourNumber){
	var Template = /^(([+|-]?d+(.d*)?)|([+|-]?(d*.)?d+))$/ //Formato de numero real con signo
	return (Template.test(YourNumber)) ? 1 : 0 //Compara \"YourNumber\" con el formato \"Template\" y si coincidevuelve verdadero si no devuelve falso
}

//la funcion \"IsSignedReal(YourNumber)\" chequea si \"YourNumber\" es un numero real con signo valido
//La variable \"YourNumber\" es una cadena de caracteres
function IsSignedReal(YourNumber){
	var Template = /^(([+|-]d+(.d*)?)|([+|-](d*.)?d+))$/ //Formato de numero real con signo
	return (Template.test(YourNumber)) ? 1 : 0 //Compara \"YourNumber\" con el formato \"Template\" y si coincidevuelve verdadero si no devuelve falso
}

//la funcion \"IsUnsignedReal(YourNumber)\" chequea si \"YourNumber\" es un numero real sin signo valido
//La variable \"YourNumber\" es una cadena de caracteres
function IsUnsignedReal(YourNumber){
	var Template = /^((d+(.d*)?)|((d*.)?d+))$/ //Formato de numero real sin signo
	return (Template.test(YourNumber)) ? 1 : 0 //Compara \"YourNumber\" con el formato \"Template\" y si coincidevuelve verdadero si no devuelve falso
}




/*************************************************************************************************************************/
/* Validación de campos cadena de caracteres                                                                             */
/*************************************************************************************************************************/

//la funcion \"IsChar(YourChar)\" chequea si \"YourChar\" es una letra valida
//La variable \"YourChar\" es una cadena de caracteres
function IsChar(YourChar){
	var Template = /^[a-zA-Z]$/i //Formato de letra
	return (Template.test(YourChar)) ? 1 : 0 //Compara \"YourChar\" con el formato \"Template\" y si coincidevuelve verdadero si no devuelve falso
}

//la funcion \"IsAlphaNumeric(YourAlphaNumeric)\" chequea si \"YourAlphaNumeric\" es una letra valida
//La variable \"YourAlphaNumeric\" es una cadena de caracteres
function IsAlphaNumeric(YourAlphaNumeric){
	var Template = /^[a-zA-Z0-9]+$/i //Formato de alfanumerico
	return (Template.test(YourAlphaNumeric)) ? 1 : 0 //Compara \"YourAlphaNumeric\" con el formato \"Template\" y si coincidevuelve verdadero si no devuelve falso
}

//la funcion \"IsMail(YourMail)\" chequea si \"YourMail\" es una direccion de correo electronico valida
//La variable \"YourMail\" es una cadena de caracteres
function IsMail(YourMail){
	var Template = /^[a-z][a-z-_0-9.]+@[a-z-_=>0-9.]+.[a-z]{2,3}$/i //Formato de direccion de correo electronico
	return (Template.test(YourMail)) ? 1 : 0 //Compara \"YourMail\" con el formato \"Template\" y si coincidevuelve verdadero si no devuelve falso
}

//la funcion \"IsNIF(YourNIF)\" chequea si \"YourNIF\" es un DNI valido
//La variable \"YourNIF\" es una cadena de caracteres
function IsNIF(YourNIF){
	if (YourNIF.length != 9) return 0 //Si la longitud de \"YourNIF\" es menor que 9 devuelve falso
	else if (!IsUnsignedInteger(YourNIF.substring(0, 8))) return 0 //Si los ocho primeros digitos no forman un numero entero sin signo valido devuelve falso
	else if (!IsChar(YourNIF.substring(8, 9))) return 0 //Si el ultimo digito no es una letra valida devuelve falso
	else
	{
		var ControlValue = 0 //Control de calculos segun el criterio de correccion
		var NIFCharIndex = 0 //Almacenara la posicion de la letra correpondiente a la parte numerica del DNI con respecto al array \"NIFChars\"
		//El siguiente array \"NIFChars\" contiene las letras de DNI ordenadas segun el criterio de correccion
		var NIFChars = new Array("T", "R", "W", "A", "G", "M", "Y", "F", "P", "D", "X", "B", "N", "J", "Z", "S", "Q", "V", "H", "L", "C", "K", "E")
		var NIFNumber = YourNIF.substring(0, 8) //Almacenanos la parte numerica del DNI en \"NIFNumber\"
		var NIFChar = YourNIF.substring(8, 9) //Almacenamos la letra del DNI en \"NIFChar\"
		NIFChar = NIFChar.toUpperCase() //Pasamos la letra del DNI a mayusculas por si acaso estaba en minusculas
		//Los siguientes 4 calculos sirven para calcular la posicion de la letra correspondiente al la parte numerica del DNI \"NIFNumber\" en en array \"NIFChars\"
		ControlValue = NIFNumber / NIFChars.length
		ControlValue = Math.floor(ControlValue);
		ControlValue = ControlValue * NIFChars.length
		NIFCharIndex = NIFNumber - ControlValue
		return (NIFChar == NIFChars[NIFCharIndex]) ? 1 : 0 //Si la letra coincide con la letra dada devuelve verdadero si no devuelve falso
	}
}




/*************************************************************************************************************************/
/* Validación de campos fecha                                                                                            */
/*************************************************************************************************************************/

//El array \"DaysInMonth\" contiene los dias que tiene cada mes
var DaysInMonth = new Array()
DaysInMonth[0] = 31  //Los dias que tiene Enero
DaysInMonth[1] = 29  //Los dias que tiene Febrero se calculan mas adelante por si el año es bisiesto
DaysInMonth[2] = 31  //Los dias que tiene Marzo
DaysInMonth[3] = 30  //Los dias que tiene Abril
DaysInMonth[4] = 31  //Los dias que tiene Mayo
DaysInMonth[5] = 30  //Los dias que tiene Junio
DaysInMonth[6] = 31  //Los dias que tiene Julio
DaysInMonth[7] = 31  //Los dias que tiene Agosto
DaysInMonth[8] = 30  //Los dias que tiene Septiembre
DaysInMonth[9] = 31  //Los dias que tiene Octubre
DaysInMonth[10] = 30 //Los dias que tiene Noviembre
DaysInMonth[11] = 31 //Los dias que tiene Diciembre

//La funcion \"IsDay(YourDay, YourMonth)\" chequea si \"YourDay\" es un numero de dia valido para el mes \"YourMonth\"
//Las variables \"YourDay\" y \"YourMonth\" son cadenas de caracteres
function IsDay(YourDay, YourMonth){
	if (IsUnsignedInteger(YourDay) && IsMonth(YourMonth)){ //Si \"YourDay\" es un numero entero sin signo valido y \"YourMonth\" es un numero de mes valido
		return (parseInt(YourDay) > 0 && parseInt(YourDay) <= DaysInMonth[YourMonth - 1]) ? 1 : 0 //Si \"YourDay\" esta entre 1 y los dias que tiene el mes \"YourMonth\" devuelve verdadero si no devuelve falso
	} else {
		return 0 //Si \"YourDay\" no es un numero entero sin signo valido o \"YourMonth\" no es un numero de mes valido devuelve falso
	}
}

//La funcion \"IsMonth(YourMonth)\" chequea si \"YourMonth\" es un numero de mes valido
//La variable \"YourMonth\" es una cadena de caracteres
function IsMonth(YourMonth){
	if (IsUnsignedInteger(YourMonth)){ //Si \"YourMonth\" es un número entero sin signo valido
		return (parseInt(YourMonth) > 0 && parseInt(YourMonth) <= 12) ? 1 : 0 //Si \"YourMonth\" esta entre 1 y 12 devuelve verdadero si no devuelve falso
	} else {
		return 0 //Si \"YourMonth\" no es un numero entero sin signo valido devuelve falso
	}
}

//La funcion \"IsYear(YourYear)\" chequea si \"YourYear\" es un numero de año valido
//La variable \"YourYear\" es una cadena de caracteres
function IsYear(YourYear){
	YourYear+=2000;
	if (IsUnsignedInteger(YourYear)){ //Si \"YourYear\" es un numero entero sin signo valido
		return (parseInt(YourYear) > 1900 && parseInt(YourYear) < 3000) ? 1 : 0 //Si \"YourYear\" es mayor que 1900 y menor que 3000 devuelve verdadero si no devuelve falso
	} else { 
		return 0 //Si \"YourYear\" no es un numero entero sin signo valido devuelve falso
	}
}

//La funcion \"IsLeapYear(YourYear)\" chequea si \"YourYear\" es un año es bisiesto
//La variable \"YourYear\" es una cadena de caracteres
function IsLeapYear(YourYear){
	if (IsUnsignedInteger(YourYear)){ //Si \"YourYear\" es un numero entero sin signo valido
		return ((YourYear % 4 == 0 && YourYear % 100 != 0) || (YourYear % 400 == 0)) ? 1 : 0// Si \"YourYear\" es un año es bisiesto devuelve verdadero si no devuelve falso
	} else {
		return 0 //Si \"YourYear\" no es un numero entero sin signo valido devuelve falso
	}
}

//La funcion \"IsDate(YourDate, YourDateSeparator)\" chequea si \"YourDate\" es una fecha valida con el separador de fecha \"YourDateSeparator\"
//Las variables \"YourDate\" y \"YourDateSeparator\" son cadenas de caracteres
function IsDate(YourDate, YourDateSeparator){
	var IsAllOK = 1; //Variable iniciada como verdadera para saber si todas las validaciones fueron correctas
	var YourDateParts = new Array(); //Variable donde se almacenaran las partes de la fecha (dia, mes y año) tras haber eliminado el separador de la fecha
	YourDateParts = YourDate.split(YourDateSeparator); //Se crean las partes de la fecha (dia, mes y año) eliminando el separador de la fecha
	var Day = YourDateParts[0]; //El dia corresponde al primer elemento del array
	var Month = YourDateParts[1]; //El mes corresponde al segundo elemento del array
	var Year = YourDateParts[2]; //El año corresponde al tercer elemento del array
	if (IsYear(Year) && !IsLeapYear(Year)){ //Si \"Year\" es un numero de año valido y no es bisiesto
		DaysInMonth[1] = 28; //Como \"Year\" no es bisiesto Febrero tiene entonces 28 dias
	} else {
		if (IsYear(Year) && IsLeapYear(Year)){ //Si \"Year\" es un numero de año valido y es bisiesto
			DaysInMonth[1] = 29; //Como \"Year\" es bisiesto Febrero tiene entonces 29 dias
		} else {
			IsAllOK = 0; //Si \"Year\" no es un numero de año valido la variable pasa a ser falsa
		}
	}
	IsAllOK = (IsMonth(Month)) ? IsAllOK : 0; //Si \"Month\" es un numero de mes valido la variable se queda como esta si no pasa a ser falsa
	IsAllOK = (IsDay(Day, Month)) ? IsAllOK : 0; //Si \"Day\" es un numero de dia valido para el mes \"Month\" la variable se queda como esta si no pasa a ser falsa
	return IsAllOK; //Finalmente se devuelve el valor de la variable como verdadero o falso
}




/*************************************************************************************************************************/
/* Validación de campos codigo postal y telefono segun provincia                                                         */
/*************************************************************************************************************************/

//El array \"PostalCodeInitInit\" contiene los primeros digitos del codigo postal de una provincia
var PostalCodeInit = new Array()
PostalCodeInit[0] = "01"  //Primeros digitos del codigo postal de Álava
PostalCodeInit[1] = "02"  //Primeros digitos del codigo postal de Albacete
PostalCodeInit[2] = "03"  //Primeros digitos del codigo postal de Alicante
PostalCodeInit[3] = "04"  //Primeros digitos del codigo postal de Almería
PostalCodeInit[4] = "33"  //Primeros digitos del codigo postal de Asturias
PostalCodeInit[5] = "05"  //Primeros digitos del codigo postal de Ávila
PostalCodeInit[6] = "06"  //Primeros digitos del codigo postal de Badajoz
PostalCodeInit[7] = "08"  //Primeros digitos del codigo postal de Barcelona
PostalCodeInit[8] = "09"  //Primeros digitos del codigo postal de Burgos
PostalCodeInit[9] = "10"  //Primeros digitos del codigo postal de Cáceres
PostalCodeInit[10] = "11" //Primeros digitos del codigo postal de Cádiz
PostalCodeInit[11] = "39" //Primeros digitos del codigo postal de Cantabria
PostalCodeInit[12] = "12" //Primeros digitos del codigo postal de Castellón de la Plana
PostalCodeInit[13] = "51" //Primeros digitos del codigo postal de Ceuta
PostalCodeInit[14] = "13" //Primeros digitos del codigo postal de Ciudad Real
PostalCodeInit[15] = "14" //Primeros digitos del codigo postal de Córdoba
PostalCodeInit[16] = "15" //Primeros digitos del codigo postal de Coruña, A
PostalCodeInit[17] = "16" //Primeros digitos del codigo postal de Cuenca
PostalCodeInit[18] = "17" //Primeros digitos del codigo postal de Girona
PostalCodeInit[19] = "18" //Primeros digitos del codigo postal de Granada
PostalCodeInit[20] = "19" //Primeros digitos del codigo postal de Guadalajara
PostalCodeInit[21] = "20" //Primeros digitos del codigo postal de Guipúzcoa
PostalCodeInit[22] = "21" //Primeros digitos del codigo postal de Huelva
PostalCodeInit[23] = "22" //Primeros digitos del codigo postal de Huesca
PostalCodeInit[24] = "07" //Primeros digitos del codigo postal de Illes Balears
PostalCodeInit[25] = "23" //Primeros digitos del codigo postal de Jaén
PostalCodeInit[26] = "24" //Primeros digitos del codigo postal de León
PostalCodeInit[27] = "25" //Primeros digitos del codigo postal de Lleida
PostalCodeInit[28] = "27" //Primeros digitos del codigo postal de Lugo
PostalCodeInit[29] = "28" //Primeros digitos del codigo postal de Madrid
PostalCodeInit[30] = "29" //Primeros digitos del codigo postal de Málaga
PostalCodeInit[31] = "52" //Primeros digitos del codigo postal de Melilla
PostalCodeInit[32] = "30" //Primeros digitos del codigo postal de Murcia
PostalCodeInit[33] = "31" //Primeros digitos del codigo postal de Navarra
PostalCodeInit[34] = "32" //Primeros digitos del codigo postal de Ourense
PostalCodeInit[35] = "34" //Primeros digitos del codigo postal de Palencia
PostalCodeInit[36] = "35" //Primeros digitos del codigo postal de Palmas, Las
PostalCodeInit[37] = "36" //Primeros digitos del codigo postal de Pontevedra
PostalCodeInit[38] = "26" //Primeros digitos del codigo postal de Rioja, La
PostalCodeInit[39] = "37" //Primeros digitos del codigo postal de Salamanca
PostalCodeInit[40] = "38" //Primeros digitos del codigo postal de Santa Cruz de Tenerife
PostalCodeInit[41] = "40" //Primeros digitos del codigo postal de Segovia
PostalCodeInit[42] = "41" //Primeros digitos del codigo postal de Sevilla
PostalCodeInit[43] = "42" //Primeros digitos del codigo postal de Soria
PostalCodeInit[44] = "43" //Primeros digitos del codigo postal de Tarragona
PostalCodeInit[45] = "44" //Primeros digitos del codigo postal de Teruel
PostalCodeInit[46] = "45" //Primeros digitos del codigo postal de Toledo
PostalCodeInit[47] = "46" //Primeros digitos del codigo postal de Valencia
PostalCodeInit[48] = "47" //Primeros digitos del codigo postal de Valladolid
PostalCodeInit[49] = "48" //Primeros digitos del codigo postal de Vizcaya
PostalCodeInit[50] = "49" //Primeros digitos del codigo postal de Zamora
PostalCodeInit[51] = "50" //Primeros digitos del codigo postal de Zaragoza

//El array \"Prefix\" contiene el prefijo telefonico de una provincia
var Prefix = new Array()
Prefix[0] = "945"  //Prefijo telefonico de Álava
Prefix[1] = "967"  //Prefijo telefonico de Albacete
Prefix[2] = "96"   //Prefijo telefonico de Alicante
Prefix[3] = "950"  //Prefijo telefonico de Almería
Prefix[4] = "98"   //Prefijo telefonico de Asturias
Prefix[5] = "920"  //Prefijo telefonico de Ávila
Prefix[6] = "924"  //Prefijo telefonico de Badajoz
Prefix[7] = "93"   //Prefijo telefonico de Barcelona
Prefix[8] = "947"  //Prefijo telefonico de Burgos
Prefix[9] = "927"  //Prefijo telefonico de Cáceres
Prefix[10] = "956" //Prefijo telefonico de Cádiz
Prefix[11] = "942" //Prefijo telefonico de Cantabria
Prefix[12] = "964" //Prefijo telefonico de Castellón de la Plana
Prefix[13] = "956" //Prefijo telefonico de Ceuta
Prefix[14] = "926" //Prefijo telefonico de Ciudad Real
Prefix[15] = "957" //Prefijo telefonico de Córdoba
Prefix[16] = "981" //Prefijo telefonico de Coruña, A
Prefix[17] = "969" //Prefijo telefonico de Cuenca
Prefix[18] = "972" //Prefijo telefonico de Girona
Prefix[19] = "957" //Prefijo telefonico de Granada
Prefix[20] = "949" //Prefijo telefonico de Guadalajara
Prefix[21] = "943" //Prefijo telefonico de Guipúzcoa
Prefix[22] = "959" //Prefijo telefonico de Huelva
Prefix[23] = "974" //Prefijo telefonico de Huesca
Prefix[24] = "971" //Prefijo telefonico de Illes Balears
Prefix[25] = "953" //Prefijo telefonico de Jaén
Prefix[26] = "987" //Prefijo telefonico de León
Prefix[27] = "973" //Prefijo telefonico de Lleida
Prefix[28] = "982" //Prefijo telefonico de Lugo
Prefix[29] = "91"  //Prefijo telefonico de Madrid
Prefix[30] = "95"  //Prefijo telefonico de Málaga
Prefix[31] = "95"  //Prefijo telefonico de Melilla
Prefix[32] = "968" //Prefijo telefonico de Murcia
Prefix[33] = "948" //Prefijo telefonico de Navarra
Prefix[34] = "988" //Prefijo telefonico de Ourense
Prefix[35] = "979" //Prefijo telefonico de Palencia
Prefix[36] = "928" //Prefijo telefonico de Palmas, Las
Prefix[37] = "986" //Prefijo telefonico de Pontevedra
Prefix[38] = "941" //Prefijo telefonico de Rioja, La
Prefix[39] = "923" //Prefijo telefonico de Salamanca
Prefix[40] = "922" //Prefijo telefonico de Santa Cruz de Tenerife
Prefix[41] = "921" //Prefijo telefonico de Segovia
Prefix[42] = "95"  //Prefijo telefonico de Sevilla
Prefix[43] = "975" //Prefijo telefonico de Soria
Prefix[44] = "977" //Prefijo telefonico de Tarragona
Prefix[45] = "978" //Prefijo telefonico de Teruel
Prefix[46] = "925" //Prefijo telefonico de Toledo
Prefix[47] = "96"  //Prefijo telefonico de Valencia
Prefix[48] = "983" //Prefijo telefonico de Valladolid
Prefix[49] = "94"  //Prefijo telefonico de Vizcaya
Prefix[50] = "980" //Prefijo telefonico de Zamora
Prefix[51] = "976" //Prefijo telefonico de Zaragoza

//La funcion \"IsPostalCode(YourPostalCode, YourProvinceIndex)\" chequea si \"YourPostalCode\" es el codigo postal de la provincia \"YourProvinceIndex\"
//Las variables \"YourPostalCode\" y \"YourProvinceIndex\" son cadenas de caracteres
function IsPostalCode(YourPostalCode, YourProvinceIndex){
	if (YourPostalCode.length != 5) return 0 //Si la longitud de \"YourPostalCode\" es diferente de 5 devuelve falso
	else if (!IsUnsignedInteger(YourPostalCode) || !IsUnsignedInteger(YourProvinceIndex)) return 0 //Si \"YourPostalCode\" o \"YourProvinceIndex\" no son numeros enteros sin signo validos devuelve falso
	else return (YourPostalCode.substring(0, 2) == PostalCodeInit[YourProvinceIndex]) ? 1 : 0 //Si los 2 primeros digitos de \"YourPostalCode\" coinciden con el valor de \"PostalCodeInit[YourProvinceIndex]\" devuelve verdadero si no devuelve falso
}

//La funcion \"IsPhoneNumber(YourPhoneNumber, YourProvinceIndex)\" chequea si \"YourPhoneNumber\" es un telefono valido de la provincia \"YourProvinceIndex\"
//Las variables \"YourPhoneNumber\" y \"YourProvinceIndex\" son cadenas de caracteres
function IsPhoneNumber(YourPhoneNumber, YourProvinceIndex){
	if (YourPhoneNumber.length != 9) return 0 //Si la longitud de \"YourPhoneNumber\" es diferente de 9 devuelve falso
	else if (!IsUnsignedInteger(YourPhoneNumber) || !IsUnsignedInteger(YourProvinceIndex)) return 0 //Si \"YourPhoneNumber\" o \"YourProvinceIndex\" no son numeros enteros sin signo validos devuelve falso
	else return (YourPhoneNumber.substring(0, Prefix[YourProvinceIndex].length) == Prefix[YourProvinceIndex]) ? 1 : 0 //Si el prefijo de \"YourPhoneNumber\" coincide con el de \"Prefix[YourProvinceIndex]\" devuelve verdadero si no devuelve falso
}