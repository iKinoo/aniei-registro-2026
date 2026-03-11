-- phpMyAdmin SQL Dump
-- version 5.0.4deb2+deb11u2
-- https://www.phpmyadmin.net/
--
-- Servidor: mariadb-132.wc1:3306
-- Tiempo de generación: 27-01-2026 a las 16:02:53
-- Versión del servidor: 10.1.45-MariaDB-0+deb11u1
-- Versión de PHP: 7.3.33-24+0~20250311.131+debian11~1.gbp8dc7d2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `845453_cnciic_aniei`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `accesos`
--

CREATE TABLE `accesos` (
  `id_acceso` tinyint(3) UNSIGNED NOT NULL,
  `username` varchar(30) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `contrasena` varchar(50) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `tipo` tinyint(3) UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividades`
--

CREATE TABLE `actividades` (
  `id_actividad` tinyint(3) UNSIGNED NOT NULL,
  `nombre` varchar(200) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `id_tipoactividad` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
  `id_ponente` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `id_ponente2` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `id_ponente3` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `cupo` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
  `hora_inicio` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `hora_final` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `institucion` varchar(50) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `id_sala` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
  `id_fechaevento` tinyint(3) UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Asistencia`
--

CREATE TABLE `Asistencia` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `id_actividad` tinyint(3) UNSIGNED NOT NULL,
  `fecha_ast` date DEFAULT '0000-00-00',
  `hora_ast` time DEFAULT '00:00:00'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencias`
--

CREATE TABLE `asistencias` (
  `id_ast` tinyint(3) UNSIGNED NOT NULL,
  `folio_usuario` char(6) COLLATE utf8_spanish_ci DEFAULT NULL,
  `id_actividad` tinyint(3) UNSIGNED DEFAULT NULL,
  `fecha_ast` date DEFAULT NULL,
  `hora_ast` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cargos`
--

CREATE TABLE `cargos` (
  `id_cargo` tinyint(3) UNSIGNED NOT NULL,
  `descripcion` varchar(30) COLLATE utf8_spanish_ci NOT NULL DEFAULT ''
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `cargos`
--

INSERT INTO `cargos` (`id_cargo`, `descripcion`) VALUES
(1, 'Alumno'),
(2, 'Profesor'),
(3, 'Secretario/Subdirector'),
(4, 'Jefe de Departamento'),
(5, 'Director'),
(6, 'Otro');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `costos`
--

CREATE TABLE `costos` (
  `id_costo` tinyint(3) UNSIGNED NOT NULL,
  `id_tipousuario` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
  `costo` float UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `costos`
--

INSERT INTO `costos` (`id_costo`, `id_tipousuario`, `costo`) VALUES
(1, 1, 900),
(2, 1, 1200),
(3, 1, 1390),
(4, 1, 1852),
(5, 2, 3088),
(6, 2, 1700),
(7, 2, 1700),
(8, 2, 2200),
(9, 5, 2000),
(10, 5, 3000),
(11, 5, 3000),
(12, 5, 4000),
(13, 0, 750),
(14, 0, 900),
(15, 0, 905),
(16, 0, 1100),
(17, 3, 4930),
(18, 3, 5800);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `depositos`
--

CREATE TABLE `depositos` (
  `id_deposito` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `ciudad` varchar(30) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `sucursal` varchar(30) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `hora` time NOT NULL DEFAULT '00:00:00',
  `referencia` varchar(15) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `monto` float UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `depositos`
--

INSERT INTO `depositos` (`id_deposito`, `id_usuario`, `ciudad`, `sucursal`, `fecha`, `hora`, `referencia`, `monto`) VALUES
(1, 1, 'Coacalco de Berriozabal', '246', '2023-10-11', '10:30:00', '544879', 300),
(2, 2, 'Mérida', '123', '2023-10-11', '11:11:00', '1111', 350),
(3, 3, 'Villahermosa', '6208', '2023-10-11', '18:07:00', '0739662', 150),
(4, 4, 'xalapa', 'bbva', '2023-10-12', '09:00:00', '1', 300),
(5, 5, 'Villahermosa', '0117', '2023-10-12', '12:00:00', '01', 300),
(6, 6, 'Villahermosa', '0117', '2023-10-12', '10:54:00', '662', 300),
(7, 7, 'GUADALAJARA', '3888', '2023-10-11', '10:59:00', '000010972', 2200),
(8, 8, 'Villahermosa Tabasco', '0117', '2023-10-12', '10:54:00', '0739662', 300),
(9, 9, 'Cárdenas, Tabasco', 'Lo hice por transferencia', '2023-10-12', '12:46:00', '739662', 300),
(10, 10, 'Cunduacán Tabasco', '0117', '2023-10-12', '17:43:00', '6121404753', 300),
(11, 11, 'Cunduacán Tabasco', '0117', '2023-10-12', '17:43:00', '6121404753', 150),
(12, 12, 'Cunduacán Tabasco', '0117', '2023-10-12', '17:43:00', '6121404753', 150),
(13, 13, 'Puebla', 'Tranferenciaelectrónica', '2023-10-11', '19:34:00', '6041695841', 2500),
(14, 14, 'Transferencia', 'Transferencia', '2023-10-08', '16:52:00', '5777276607', 2200),
(15, 15, 'GUADALAJARA', 'SUPERMOVIL', '2023-10-13', '09:09:00', '1225561', 2200),
(16, 16, 'San Pedro Tlaquepaque, Jalisco', 'Cajero MM 7006', '2023-10-13', '11:22:00', '7094', 2200),
(17, 17, 'San Pedro Tlaquepaque; Jalisco', 'FORUM TLAQUEPAQUE MM 7006', '2023-10-13', '11:22:00', '7094', 2200),
(18, 18, 'San Pedro Tlaquepaque; Jalisco', 'FORUM TLAQUEPAQUE MM 7006', '2023-10-13', '11:22:00', '7094', 2200),
(19, 19, 'CDMX', 'MM 8032', '2023-10-13', '10:42:00', '9810', 2200),
(20, 20, 'CDMX', 'MM 8032', '2023-10-13', '10:45:00', '9813', 2200),
(21, 21, 'ESTADO DE MEXICO', '2456', '2023-10-13', '10:30:00', '12546', 300),
(22, 22, 'Cunduacán', '0117', '2023-10-13', '17:25:00', '6206561883', 300),
(23, 23, 'Cunduacán', '0117', '2023-10-13', '17:25:00', '6206561883', 150),
(24, 24, 'Villahermosa', '64600', '2023-10-13', '20:38:00', '4378212', 150),
(25, 25, 'Cunduacan', '0117', '2023-10-13', '20:03:00', '5898', 150),
(26, 26, 'Reforma Chiapas', '0117', '2023-10-13', '09:44:00', '5439', 150),
(27, 27, 'Querétaro', 'NA', '2023-10-14', '10:10:00', '6267036860', 2200),
(28, 28, 'Tabasco', '0117', '2023-10-16', '16:30:00', '6462602019', 150),
(29, 29, 'Tenosique, Tabasco', 'Transferencia electrónica', '2023-10-14', '23:14:00', '6400457974', 2200),
(30, 30, 'TENOSIQUE', 'TRANSFERENCIA ELECTRONICA', '2023-10-18', '11:17:00', '6616658969', 200),
(31, 31, 'TENOSIQUE, TABASCO', 'Transferencia electrónica', '2023-10-18', '11:13:00', '6616401282', 200),
(32, 32, 'Tenosique, Tabasco', 'Transferencia Electrónica', '2023-10-18', '11:27:00', '181023', 200),
(33, 33, 'Tenosique Tabasco', 'Transferencia Electrónica', '2023-10-18', '11:31:00', '6617506070', 200),
(34, 34, 'Tenosique Tabasco', 'transferencia electrónica', '2023-10-18', '10:36:00', '6617788532', 200),
(35, 35, 'Tenosique, Tabasco', 'Transferencia electronica', '2023-10-18', '10:32:00', '6617535139', 200),
(36, 36, 'Tenosique Tabasco', 'Transferencia Electrónica', '2023-10-18', '11:31:00', '6617480960', 200),
(37, 37, 'Tenosique Tabasco', 'Transferencia electronica', '2023-10-18', '11:47:00', '6618426994', 200),
(38, 38, 'Tenosique Tabasco', 'Transferencia electrónica', '2023-10-18', '11:53:00', '6618832368', 200),
(39, 39, 'Tenosique, tabasco.', 'Transferencia electronica', '2023-10-18', '11:51:00', '6618709585', 200),
(40, 40, 'Tenosique, Tabasco', 'Transferencia electronica', '2023-10-18', '12:21:00', '1810232', 200),
(41, 41, 'Tenosique, Tabasco', 'Transferencia bancaria', '2023-10-18', '12:40:00', '739662', 200),
(42, 42, 'Tenosique, Tabasco', 'Transferencia electrónica', '2023-10-18', '12:46:00', '6621977613', 200),
(43, 43, 'Tenosique, Tabasco', 'Transferencia electrónica', '2023-10-18', '13:05:00', '6623131564', 200),
(44, 44, 'Tenosique, Tabasco', 'Transferencia electrónica', '2023-10-18', '13:09:00', '6623345452', 200),
(45, 45, 'Tenosique, Tabasco', 'Transferencia electrónica', '2023-10-18', '13:14:00', '6623690440', 200),
(46, 46, 'Tenosique, Tabasco', 'Transferencia electrónica', '2023-10-18', '00:00:13', '6623700785', 200),
(47, 47, 'Tenosique, Tabasco', 'Transferencia electrónica', '2023-10-18', '14:25:00', '6624305359', 300),
(48, 48, 'Tenosique, Tabasco', 'Transferencia electrónica', '2023-10-18', '14:31:00', '6624671081', 200),
(49, 49, 'Tenosique, Tabasco', 'Transferencia electrónica', '2023-10-18', '14:39:00', '12345', 200),
(50, 50, 'Tenosique, Tabasco', 'Referencia electronica', '2023-10-18', '15:00:00', '1144', 200),
(51, 51, 'Tenosique, Tabasco', 'TRANSFERENCIA ELECTRONICA', '2023-10-18', '15:18:00', '1122', 200),
(52, 52, 'XALAPA', 'Transferencia', '2023-10-15', '13:45:00', '6366310900', 1500),
(53, 53, 'Tenosique, Tabasco', 'Transferecia electrónica', '2023-10-18', '14:37:00', '1810230', 200),
(54, 54, 'XALAPA', 'Transferencia', '2023-10-14', '17:56:00', '6291383834', 1500),
(55, 55, 'Tenosique, Tabasco', 'Transferencia electrónica', '2023-10-18', '14:43:00', '6629035867', 200),
(56, 56, 'Tenosique, Tabasco', 'Transferencia Electronica', '2023-10-18', '14:49:00', '1810231', 200),
(57, 57, 'Tenosique, Tabasco', 'Transferencia interbancaria', '2023-10-18', '14:53:00', '6629597912', 200),
(58, 58, 'Tenosique, Tabasco', 'transferencia electronica', '2023-10-18', '16:04:00', '3366', 200),
(59, 59, 'Tenosique,Tabasco', 'Transferencia interbancaria', '2023-10-18', '16:09:00', '6634146941', 200),
(60, 60, 'Tenosique, Tabasco.', '0117', '2023-10-18', '11:27:00', '6617225682', 200),
(61, 61, 'Puebla', '001', '2023-10-18', '19:02:00', '6644531488', 2200),
(62, 62, 'Puebla', '001', '2023-10-18', '19:02:00', '6644531488', 2200),
(63, 63, 'Ensenada', 'Transferencia', '2023-10-18', '20:17:00', '6652631549', 400),
(64, 64, 'Tenosique, Tabasco', 'Transferencia electrónica', '2023-10-19', '07:23:00', '6692620392', 200),
(65, 65, 'Tenosique Tabasco', 'Transferencia electrónica', '2023-10-19', '08:29:00', '6692963525', 200),
(66, 66, 'Tenosique Tabasco', 'Tenosique', '2023-10-15', '23:14:00', '6400457974', 2200),
(67, 67, 'Tenosique, Tabasco', 'Transferencia electrónica', '2023-10-18', '17:37:00', '6639432055', 200),
(68, 68, 'Tenosique Tabasco', 'Tenosique', '2023-10-15', '23:14:00', '6400457974', 2200),
(69, 69, 'Tenosique, Tabasco', 'Transferencia electrónica', '2023-10-19', '09:31:00', '6696711824', 200),
(70, 70, 'Tenosique Tabasco', 'Tenosique', '2023-10-15', '23:14:00', '6400457974', 2200),
(71, 71, 'Tenosique, Tabasco', 'Transferencia electr', '2023-10-18', '16:04:00', '3366', 200),
(72, 72, 'Tenosique Tabasco', 'Tenosique', '2023-10-15', '23:14:00', '6400457974', 2200),
(73, 73, 'Tenosique, Tabasco', 'Transferencia electrónica', '2023-10-19', '10:13:00', '6699198562', 200),
(74, 74, 'Cunduacan', '0117', '2023-10-19', '10:20:00', '6699601822', 150),
(75, 75, 'Cardenas', '0117', '2023-10-19', '10:22:00', '6699754033', 150),
(76, 76, 'Tenosique, Tabasco', 'Transferencia electrónica', '2023-10-19', '10:44:00', '6701093161', 200),
(77, 77, 'Cunduacán', '0117', '2023-10-19', '12:27:00', '6707282025', 300),
(78, 78, 'Comalcalco, Tabasco', '0', '2023-10-19', '12:16:00', '6706600808', 150),
(79, 79, 'Cunduacán Tabasco', '0117', '2023-10-19', '12:52:00', '6708708358', 300),
(80, 80, '18 DE MARZO (COLONIA) CENTRO T', '0117', '2023-10-19', '12:13:00', '6706385649', 300),
(81, 81, 'Tenosique, Tabasco', 'Transferencia Electrónica', '2023-10-19', '13:07:00', '6709636821', 200),
(82, 82, 'CUNDUACÁN', '5855', '2023-10-19', '14:06:00', '6713217367', 300),
(83, 83, 'Mérida', 'Internet', '2023-10-19', '02:51:00', '0191023', 2200),
(84, 84, 'Tabasco', '0117', '2023-10-19', '14:45:00', '4896032', 300),
(85, 85, 'JOSE MARIA PINO SUÁREZ (COLONI', '0864', '2023-10-19', '14:34:00', '3966', 300),
(86, 86, 'Tenosique, Tabasco', 'Transferencia electrónica', '2023-10-19', '17:04:00', '6717424180', 200),
(87, 87, 'Tabasco', '0117', '2023-10-19', '14:45:00', '4896032', 150),
(88, 88, 'Tabasco', '0117', '2023-10-19', '14:45:00', '4896032', 150),
(89, 89, 'TENOSIQUE', 'TENOSIQUE', '2023-10-19', '15:40:00', '1910231', 2500),
(90, 90, 'TENOSIQUE', 'Tenosique', '2023-10-19', '15:58:00', '6719741622', 200),
(91, 91, '18 DE MARZO (COLONIA) CENTRO T', '0117', '2023-10-19', '12:13:00', '6706138961', 300),
(92, 92, 'Villahermosa', '5173', '2023-10-19', '16:58:00', '2739662', 150),
(93, 93, 'Cárdenas', '0117', '2023-10-19', '06:49:00', '0164273966', 150),
(94, 94, 'Guadalajara', 'Deposito Interbancario', '2023-10-18', '21:33:00', '6653621928', 2200),
(95, 95, 'Tenosique', '5852', '2023-10-19', '20:27:00', '6736073441', 2200),
(96, 96, 'Villahermosa, Tabasco', '0117', '2023-10-19', '14:34:00', '6714891514', 300),
(97, 97, 'Puebla', '3746', '2023-10-16', '11:36:00', '3104', 2200),
(98, 98, 'Villahermosa, Tabasco', 'MM 6814', '2023-10-13', '10:34:00', '7668', 2200),
(99, 99, 'San Pedro Tlaquepaque; Jalisco', 'MM 7006', '2023-10-13', '11:22:00', '7094', 2200),
(100, 100, 'Xalapa-Enríquez', '5002', '2023-10-21', '13:25:00', '000011096', 250),
(101, 101, 'Puebla', '0', '2023-10-22', '06:21:00', '6948094501', 300),
(102, 102, 'Puebla', '0', '2023-10-22', '06:23:00', '6948233239', 300),
(103, 103, 'Puebla', '0', '2023-10-22', '06:25:00', '6948348261', 300),
(104, 104, 'Puebla', '0', '2023-10-22', '06:27:00', '6948432658', 300),
(105, 105, 'Xalapa', 'suc.jalapa luci', '2023-10-22', '15:52:00', '7704', 250),
(106, 106, 'Colima', 'BBVA Mexico', '2023-10-23', '14:29:00', '7402286', 2200),
(107, 107, 'Xalapa', 'Transferencia Electrónica', '2023-10-24', '14:50:00', '7147854601', 250),
(108, 108, 'Puebla', '0', '2023-10-22', '06:27:00', '6948432658', 300),
(109, 109, 'PUEBLA', '0', '2023-10-22', '06:27:00', '6948432658', 300),
(110, 110, 'Atlacomulco', '0117', '2023-10-24', '15:19:00', '7149595174', 350),
(111, 111, 'Puebla', 'Transferencia', '2023-10-22', '06:25:00', '6948348261', 300),
(112, 112, 'Puebla', '0', '2023-10-22', '06:27:00', '6948432658', 300);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados`
--

CREATE TABLE `estados` (
  `id_entidadfederativa` tinyint(3) UNSIGNED NOT NULL,
  `nombre` varchar(21) COLLATE utf8_spanish_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `estados`
--

INSERT INTO `estados` (`id_entidadfederativa`, `nombre`) VALUES
(1, 'Ags.'),
(2, 'B. C.'),
(3, 'B. C. S.'),
(4, 'Camp.'),
(5, 'Chis.'),
(6, 'Chih.'),
(7, 'Coah.'),
(8, 'Col.'),
(9, 'CDMX'),
(10, 'Dgo.'),
(11, 'Edo. Mex.'),
(12, 'Gto.'),
(13, 'Gro.'),
(14, 'Hgo.'),
(15, 'Jal.'),
(16, 'Mich.'),
(17, 'Mor.'),
(18, 'Nay.'),
(19, 'N.L.'),
(20, 'Oax.'),
(21, 'Pue.'),
(22, 'Qro.'),
(23, 'Q. Roo'),
(24, 'S. L. P.'),
(25, 'Sin.'),
(26, 'Son.'),
(27, 'Tab.'),
(28, 'Tam.'),
(29, 'Tlax.'),
(30, 'Ver.'),
(31, 'Yuc.'),
(32, 'Zac.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturaciones`
--

CREATE TABLE `facturaciones` (
  `id_facturacion` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `razon` varchar(125) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `rfc` varchar(30) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `calle` varchar(50) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `exterior` varchar(10) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `interior` varchar(10) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `colonia` varchar(80) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `municipio` varchar(30) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `id_entidadfederativaRFC` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
  `codigo_postal` varchar(10) COLLATE utf8_spanish_ci NOT NULL DEFAULT ''
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `facturaciones`
--

INSERT INTO `facturaciones` (`id_facturacion`, `id_usuario`, `razon`, `rfc`, `calle`, `exterior`, `interior`, `colonia`, `municipio`, `id_entidadfederativaRFC`, `codigo_postal`) VALUES
(1, 1, 'ASOCIACION NACIONAL DE INSTITUCIONES', 'ANI821008SX4', 'TECAMACHALCO', '54B', '', 'LOMAS DE CHAPULTEPEC', 'MIGUEL HIDALGO', 9, '11000'),
(2, 2, 'Universidad Autónoma de Yucatán', 'UAY8409012S1', 'Calle 60 x 57', '491-A', '', 'Centro', 'Mérida', 31, '97000'),
(3, 4, 'JESUS ROLANDO RAMIREZ RUEDA', 'RARJ911201QT8', 'laureles', '119 A', '', 'Jacarandas', 'Emiliano Zapata', 30, '91637'),
(4, 14, 'UNIVERSIDAD DE GUADALAJARA', 'ROGE6910113D9', 'AVENIDA JUAREZ', '976', '', 'GUADALAJARA CENTRO', 'GUADALAJARA', 15, '44100'),
(5, 15, 'PERSONA FISICA', 'CABJ801024SE7', 'CUAUHTEMOC', '695', '', 'ANALCO', 'GUADALAJARA', 15, '44450'),
(6, 19, 'INSTITUTO POLITÉCNICO NACIONAL/ESCOM', 'IPN811229H26', 'Av. Miguel Othon de Mendizabal esq. Miguel Bernard', 'S/N', '', 'La Escalera', 'Gustavo A. Madero', 9, '07320'),
(7, 20, 'INSTITUTO POLITÉCNICO NACIONAL/ESCOM', 'IPN811229H26', 'Av. Miguel Othon de Mendizabal esq. Miguel Bernard', 'S/N', '', 'La Escalera', 'Gustavo A. Madero', 9, '07320'),
(8, 61, 'ASOCIACIÓN SINDICAL DE PERSONAL ACADÉMICO DE LA BUAP', 'ASP931105C18', 'CEDRO', '45', '', 'ARBOLEDAS DE GUADALUPE', 'PUEBLA', 21, '72260'),
(9, 94, 'UNIVERSIDAD DE GUADALAJARA', 'UGU250907MH5', 'AV. JUAREZ', '976', '', 'CENTRO', 'Guadalajara', 15, '44100'),
(10, 95, 'Universidad Juárez Autonóma de Tabasco', 'UJA-580101-4N3', 'Avenida Universidad', 's/n', '', 'Zona de la Cultura, Col. Magisterial,Villahermosa', 'Centro', 27, '86040'),
(11, 97, 'Universidad Autónoma de Puebla', 'UAP370423PP3', 'Calle 4 Sur', '104', '', 'Centro', 'Puebla', 21, '72000'),
(12, 101, 'UNIVERSIDAD AUTONOMA DE PUEBLA', 'UAP370423PP3', '4 sur', '104', '', 'Col. Centro', 'Puebla', 21, '7200'),
(13, 102, 'UNIVERSIDAD AUTONOMA DE PUEBLA', 'UAP370423PP3', '4 sur', '104', '', 'Col. Centro', 'Puebla', 21, '7200'),
(14, 103, 'UNIVERSIDAD AUTONOMA DE PUEBLA', 'UAP370423PP3', '4 sur', '104', '', 'Col. Centro', 'Puebla', 21, '7200'),
(15, 104, 'UNIVERSIDAD AUTONOMA DE PUEBLA', 'UAP370423PP3', '4 sur', '104', '', 'Col. Centro', 'Puebla', 21, '7200'),
(16, 108, 'UNIVERSIDAD AUTONOMA DE PUEBLA', 'UAP370423PP3', '4 sur', '104', '', 'Col. Centro', 'Puebla', 21, '72000'),
(17, 109, 'UNIVERSIDAD AUTONOMA DE PUEBLA', 'UAP370423PP3', '4 sur', '104', '', 'Col. Centro', 'Puebla', 21, '72000'),
(18, 111, 'UNIVERSIDAD AUTÓNOMA DE PUEBLA', 'UAP370423PP3', '4 sur', '104', '', 'Col. Centro', 'Puebla', 21, '72000'),
(19, 112, 'UNIVERSIDAD AUTONOMA DE PUEBLA', 'UAP370423PP3', '4 sur', '104', '', 'Col. Centro', 'Puebla', 21, '72000');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fecha_eventos`
--

CREATE TABLE `fecha_eventos` (
  `id_fechaevento` tinyint(3) UNSIGNED NOT NULL,
  `fecha` date NOT NULL DEFAULT '0000-00-00'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `fecha_eventos`
--

INSERT INTO `fecha_eventos` (`id_fechaevento`, `fecha`) VALUES
(1, '2023-10-25'),
(2, '2023-10-26'),
(3, '2023-10-27'),
(4, '2023-10-28');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `hackaton`
--

CREATE TABLE `hackaton` (
  `id_hackaton` tinyint(3) UNSIGNED NOT NULL,
  `nombre_equipo` varchar(125) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `nombre_repre` varchar(125) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `email_repre` varchar(80) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `nombre_partici1` varchar(125) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `email_partici1` varchar(80) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `nombre_partici2` varchar(125) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `email_partici2` varchar(80) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `nombre_partici3` varchar(125) COLLATE utf8_spanish_ci DEFAULT NULL,
  `email_partici3` varchar(80) COLLATE utf8_spanish_ci DEFAULT NULL,
  `nombre_partici4` varchar(125) COLLATE utf8_spanish_ci DEFAULT NULL,
  `email_partici4` varchar(80) COLLATE utf8_spanish_ci DEFAULT NULL,
  `nombre_partici5` varchar(125) COLLATE utf8_spanish_ci DEFAULT NULL,
  `email_partici5` varchar(80) COLLATE utf8_spanish_ci DEFAULT NULL,
  `id_institucion` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
  `fecha` date NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inscripciones`
--

CREATE TABLE `inscripciones` (
  `id_inscripcion` tinyint(3) UNSIGNED NOT NULL,
  `id_actividad` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
  `id_usuario` int(10) UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inscripcion_talleres`
--

CREATE TABLE `inscripcion_talleres` (
  `id_installeres` int(11) NOT NULL,
  `id_taller` int(11) NOT NULL,
  `folio_recibo` varchar(10) COLLATE utf8_spanish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `inscripcion_talleres`
--

INSERT INTO `inscripcion_talleres` (`id_installeres`, `id_taller`, `folio_recibo`) VALUES
(2, 10, 'C00010'),
(3, 10, 'C00011'),
(4, 10, 'C00012'),
(5, 2, 'C00030'),
(6, 3, 'C00031'),
(7, 3, 'C00032'),
(8, 3, 'C00033'),
(9, 2, 'C00034'),
(10, 3, 'C00035'),
(11, 3, 'C00036'),
(12, 2, 'C00037'),
(13, 2, 'C00038'),
(14, 2, 'C00039'),
(15, 2, 'C00040'),
(16, 2, 'C00041'),
(17, 2, 'C00042'),
(18, 3, 'C00043'),
(19, 2, 'C00044'),
(20, 2, 'C00045'),
(21, 3, 'C00046'),
(22, 2, 'C00047'),
(23, 2, 'C00048'),
(24, 2, 'C00049'),
(25, 2, 'C00050'),
(26, 2, 'C00051'),
(27, 2, 'C00053'),
(28, 2, 'C00055'),
(29, 2, 'C00056'),
(30, 1, 'C00057'),
(31, 2, 'C00058'),
(32, 2, 'C00059'),
(33, 3, 'C00060'),
(34, 1, 'C00063'),
(35, 9, 'C00063'),
(36, 12, 'C00063'),
(37, 5, 'C00064'),
(38, 5, 'C00065'),
(39, 3, 'C00067'),
(40, 3, 'C00069'),
(41, 3, 'C00071'),
(42, 1, 'C00073'),
(43, 1, 'C00076'),
(44, 7, 'C00077'),
(45, 1, 'C00078'),
(46, 7, 'C00079'),
(47, 1, 'C00080'),
(48, 1, 'C00081'),
(49, 3, 'C00082'),
(50, 8, 'C00082'),
(51, 11, 'C00082'),
(52, 1, 'C00086'),
(53, 1, 'C00091'),
(54, 1, 'C00093'),
(55, 4, 'C00093'),
(56, 6, 'C00093'),
(57, 12, 'C00100'),
(58, 12, 'C00105'),
(59, 12, 'C00107'),
(60, 9, 'C00110'),
(61, 10, 'C00110');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `instituciones`
--

CREATE TABLE `instituciones` (
  `id_institucion` tinyint(3) UNSIGNED NOT NULL,
  `nombre` varchar(100) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `abreviatura` varchar(10) COLLATE utf8_spanish_ci NOT NULL DEFAULT ''
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `instituciones`
--

INSERT INTO `instituciones` (`id_institucion`, `nombre`, `abreviatura`) VALUES
(1, 'BENEMERITA UNIVERSIDAD AUTONOMA DE PUEBLA', 'BUAP'),
(2, 'CENTRO CULTURAL UNIVERSITARIO JUSTO SIERRA', 'CCUJS'),
(3, 'CENTRO DE ENSEÑANZA TECNICA Y SUPERIOR (INSTITUTO EDUCATIVO DEL NOROESTE, AC)', 'CETYSMEX'),
(4, 'CENTRO DE ESTUDIO DE ALTA DIRECCION', 'CEAD'),
(5, 'CENTRO DE ESTUDIOS BASICOS Y SUPERIORES DEL SURESTE S.C.', 'CEBSS'),
(6, 'CENTRO DE ESTUDIOS CIENTIFICOS Y TECNOLOGICOS 14 LUIS ENRIQUE ERRO SOLER', 'CECYT 14'),
(7, 'CENTRO DE ESTUDIOS CIENTIFICOS Y TECNOLOGICOS 9 JUAN DE DIOS BATIZ', 'CECYT 9'),
(8, 'CENTRO DE ESTUDIOS SUPERIORES CTM OREILLY', 'CESCTM'),
(9, 'CENTRO DE ESTUDIOS SUPERIORES DEL ESTADO DE SONORA', 'CESES'),
(10, 'CENTRO DE INVESTIGACION EN COMPUTACION IPN', 'CIC'),
(11, 'CENTRO UNIVERSITARIO DE COATZACOALCOS', 'CUCOATZA'),
(12, 'CENTRO UNIVERSITARIO HISPANOAMERICANO S.C.', 'CUHISPANO'),
(13, 'COLEGIO DE EDUCACION PROFESIONAL TECNICA DEL ESTADO DE GUANAJUATO', 'CONALEPGUA'),
(14, 'COLEGIO DE EDUCACION PROFESIONAL TECNICA DEL ESTADO DE SAN LUIS POTOSI', 'CONALEPSLP'),
(15, 'COLEGIO NACIONAL DE EDUCACION PROFESIONAL TECNICA DEL ESTADO DE JALISCO', 'CONALEPJAL'),
(16, 'COLEGIO NACIONAL DE EDUCACION PROFESIONAL TECNICA DEL ESTADO DE MEXICO', 'CONALEPEDO'),
(17, 'COLEGIO NACIONAL DE EDUCACION PROFESIONAL TECNICA TLALPAN 1', 'CONALEPTL'),
(18, 'CONJUNTO EDUCATIVO S.C.', 'CE'),
(19, 'DIRECCION GENERAL DE EDUCACION TECNOLOGICA INDUSTRIAL', 'DGETI'),
(20, 'ESCUELA NORMAL RURAL JUSTO SIERRA MENDEZ', 'SECYD'),
(21, 'ESCUELA SUPERIOR DE COMPUTO IPN', 'ESCOM'),
(22, 'FUNDACION ARTURO ROSENBLUETH', 'FAROSENB'),
(23, 'INSTITUTO ARTEK', 'ARTEK'),
(24, 'INSTITUTO DE CIENCIAS Y ESTUDIOS SUPERIORES DE TAMAULIPAS, A.C.', 'ICESTA'),
(25, 'INSTITUTO DE ESTUDIOS SUPERIORES DE CHIAPAS CAMPUS TUXTLA GTZ', 'IESCHI'),
(26, 'INSTITUTO DE ESTUDIOS SUPERIORES DE MONTERREY CAMPUS QUERETARO', 'IESMQRO'),
(27, 'INSTITUTO DE ESTUDIOS SUPERIORES DE TAMAULIPAS, A.C.', 'IESTAMA'),
(28, 'INSTITUTO EDUCATIVO DEL NORESTE A.C.', 'CETYS MEXI'),
(29, 'INSTITUTO GALILEO DE COATZACOALCOS', 'CEUNICO'),
(30, 'INSTITUTO NACIONAL DE ASTROFISICA, OPTICA Y ELECTRONICA (INAOE)', 'INAOE'),
(31, 'INSTITUTO POLITECNICO NACIONAL (CINVESTAV)', 'CINVESTAV'),
(32, 'INSTITUTO POLITECNICO NACIONAL (UPIICSA)', 'UPIICSA'),
(33, 'INSTITUTO POLITECNICO NACIONAL (CIC)', 'CIC'),
(34, 'INSTITUTO POLITECNICO NACIONAL (ESCOM)', 'ESCOM'),
(35, 'INSTITUTO POLITECNICO NACIONAL (CECYT 9 JUAN DE DIOS BATIZ PAREDES)', 'CECYT9'),
(36, 'INSTITUTO POLITECNICO NACIONAL (CECYT 14 LUIS ENRIQUE ERRO SOLER)', 'CECT14'),
(37, 'INSTITUTO TECNOLOGICO AUTONOMO DE MEXICO ', 'ITAM'),
(38, 'INSTITUTO TECNOLOGICO DE ACAPULCO', 'ITACA'),
(39, 'INSTITUTO TECNOLOGICO DE AGUASCALIENTES', 'ITAGSC'),
(40, 'INSTITUTO TECNOLOGICO DE APIZACO', 'ITAPIZACO'),
(41, 'INSTITUTO TECNOLOGICO DE CANCUN', 'ITCANCUN'),
(42, 'INSTITUTO TECNOLOGICO DE CIUDAD VALLES', 'ITCVALLES'),
(43, 'INSTITUTO TECNOLOGICO DE CELAYA', 'ITCELAYA'),
(44, 'INSTITUTO TECNOLOGICO DE CERRO AZUL', 'ITCAZUL'),
(45, 'INSTITUTO TECNOLOGICO DE CHETUMAL', 'ITCHETUMAL'),
(46, 'INSTITUTO TECNOLOGICO DE CHIHUAHUA II', 'ITCHIHUAHU'),
(47, 'INSTITUTO TECNOLOGICO DE CIUDAD GUZMAN', 'ITCDGUZ'),
(48, 'INSTITUTO TECNOLOGICO DE CIUDAD JUAREZ', 'ITCJ'),
(49, 'INSTITUTO TECNOLOGICO DE COATZACOALCOS', 'ITCOATZ'),
(50, 'INSTITUTO TECNOLOGICO DE COMITAN', 'ITCOMITAN'),
(51, 'INSTITUTO TECNOLOGICO DE CULIACAN', 'ITCULIACAN'),
(52, 'INSTITUTO TECNOLOGICO DE ESTUDIOS SUPERIORES DE LA REGION CARBONIFERA', 'ITESRC'),
(53, 'INSTITUTO TECNOLOGICO DE ESTUDIOS SUPERIORES DE ZAMORA', 'ITESZ'),
(54, 'INSTITUTO TECNOLOGICO DE IGUALA', 'ITIGUALA'),
(55, 'INSTITUTO TECNOLOGICO DE JIQUILPAN', 'ITJIQ'),
(56, 'INSTITUTO TECNOLOGICO DE LA LAGUNA', 'ITLAGUNA'),
(57, 'INSTITUTO TECNOLOGICO DE LA PAZ', 'UTLPAZ'),
(58, 'INSTITUTO TECNOLOGICO DE LAZARO CARDENAS', 'ITLC'),
(59, 'INSTITUTO TECNOLOGICO DE LEON', 'ITLEON'),
(60, 'INSTITUTO TECNOLOGICO DE LOS MOCHIS', 'ITMOCHIS'),
(61, 'INSTITUTO TECNOLOGICO DE MATAMOROS', 'ITMATAMORO'),
(62, 'INSTITUTO TECNOLOGICO DE MERIDA', 'ITMERIDA'),
(63, 'INSTITUTO TECNOLOGICO DE MORELIA', 'ITMORELIA'),
(64, 'INSTITUTO TECNOLOGICO DE PUEBLA', 'ITPUEBLA'),
(65, 'INSTITUTO TECNOLOGICO DE PUERTO VALLARTA', 'ITPV'),
(66, 'INSTITUTO TECNOLOGICO DE QUERETARO', 'ITQRO'),
(67, 'INSTITUTO TECNOLOGICO DE SAN LUIS POTOSI', 'ITSLP'),
(68, 'INSTITUTO TECNOLOGICO DE TEHUACAN', 'ITT'),
(69, 'INSTITUTO TECNOLOGICO DE TEPIC', 'ITTEPIC'),
(70, 'INSTITUTO TECNOLOGICO DE TIJUANA', 'UTTIJ'),
(71, 'INSTITUTO TECNOLOGICO DE TLALNEPANTLA', 'ITTLA'),
(72, 'INSTITUTO TECNOLOGICO DE ZACATECAS NORTE', 'ITZN'),
(73, 'INSTITUTO TECNOLOGICO DE ZITACUARO', 'ITZITAC'),
(74, 'INSTITUTO TECNOLOGICO DEL SUR DE GUANAJUATO', 'ITSG'),
(75, 'INSTITUTO TECNOLOGICO LATINOAMERICANO (CAMPUS CENTRAL)', 'ITLAT'),
(76, 'INSTITUTO TECNOLOGICO SUPERIOR DE ACATLAN DE OSORIO', 'ITSAO'),
(77, 'INSTITUTO TECNOLOGICO SUPERIOR DE ACAYUCAN', 'ITSACAY'),
(78, 'INSTITUTO TECNOLOGICO SUPERIOR DE ALVARADO', 'ITSALV'),
(79, 'INSTITUTO TECNOLOGICO SUPERIOR DE ARANDAS JALISCO', 'ITSAJ'),
(80, 'INSTITUTO TECNOLOGICO SUPERIOR DE ATLIXCO', 'ITSATLIXCO'),
(81, 'INSTITUTO TECNOLOGICO SUPERIOR DE CENTLA', 'ITSCENTLA'),
(82, 'INSTITUTO TECNOLOGICO SUPERIOR DE COATZACOALCOS', 'ITSCOATZ'),
(83, 'INSTITUTO TECNOLOGICO SUPERIOR DE HUICHAPAN', 'ITSH'),
(84, 'INSTITUTO TECNOLOGICO SUPERIOR DE IRAPUATO', 'ITSI'),
(85, 'INSTITUTO TECNOLOGICO SUPERIOR DE LIBRES DE PUEBLA', 'ITSLPUEBLA'),
(86, 'INSTITUTO TECNOLOGICO SUPERIOR DE LOS REYES', 'ITSR'),
(87, 'INSTITUTO TECNOLOGICO SUPERIOR DE MISANTLA', 'ITSM'),
(88, 'INSTITUTO TECNOLOGICO SUPERIOR DE PUERTO VALLARTA', 'ITSPV'),
(89, 'INSTITUTO TECNOLOGICO SUPERIOR DE TEPEACA', 'ITSTEPEACA'),
(90, 'INSTITUTO TECNOLOGICO SUPERIOR DE TEPEXI DE RODRIGUEZ', 'ITSTEPEXI'),
(91, 'INSTITUTO TECNOLOGICO SUPERIOR DE URUAPAN', 'ITSU'),
(92, 'INSTITUTO TECNOLOGICO SUPERIOR DE ZACATECAS NORTE', 'ITSZN'),
(93, 'INSTITUTO TECNOLOGICO SUPERIOR DE ZAPOTLANEJO', 'ITSZAPOTLA'),
(94, 'INSTITUTO TECNOLOGICO SUPERIOR DEL SUR DE GUANAJUATO', 'UTSSG'),
(95, 'INSTITUTO TECNOLOGICO SUPERIOR EL GRULLO', 'ITSG'),
(96, 'INSTITUTO TECNOLOGICO Y DE ESTUDIOS SUPERIORES DE MONTERREY CQROO', 'ITESM QRO'),
(97, 'INSTITUTO TECNOLOGICO Y DE ESTUDIOS SUPERIORES DE MONTERREY CEM', 'ITESM CEM'),
(98, 'INSTITUTO TECNOLOGICO Y DE ESTUDIOS SUPERIORES DE MONTERREY CDMX', 'ITESM CDMX'),
(99, 'INSTITUTO TECNOLOGICO Y DE ESTUDIOS SUPERIORES DE MONTERREY MTY', 'ITESM MTY'),
(100, 'INSTITUTO TECNOLOGICO Y DE ESTUDIOS SUPERIORES DE OCCIDENTE (ITESO)', 'ITESO'),
(101, 'INSTITUTO UNIVERSITARIO DEL ESTADO DE MEXICO S.C. (UNIVERSIDAD IUEM)', 'IUEM'),
(102, 'LABORATORIO NACIONAL DE INFORMATICA AVANZADA', 'LANIA'),
(103, 'LATINOAMERICANA DE CIENCIAS Y TECNOLOGIA A.C.', 'INST.TEC.L'),
(104, 'PATRONATO PRO-CONSTRUCCION ESCUELA DE BACHILLERES Y UNIVERSIDAD DEL GOLFO DE MEXICO A.C.', 'UDGOLF'),
(105, 'SUN MICROSYSTEMS DE MEXICO S.A. DE C.V.', 'SUN'),
(106, 'TECNOLOGICO DE ESTUDIOS SUPERIORES DE COACALCO', 'TESCO'),
(107, 'TECNOLOGICO DE ESTUDIOS SUPERIORES DE CUAUTITLAN IZCALLI', 'TESCI'),
(108, 'TECNOLOGICO DE ESTUDIOS SUPERIORES DE ECATEPEC', 'TESE'),
(109, 'UNIVERSIDAD AMERICANA DE ACAPULCO', 'UAACA'),
(110, 'UNIVERSIDAD AUTONOMA DE AGUASCALIENTES', 'UAA'),
(111, 'UNIVERSIDAD AUTONOMA DE BAJA CALIFORNIA', 'UABC'),
(112, 'UNIVERSIDAD AUTONOMA DE BAJA CALIFORNIA SUR', 'UABCS'),
(113, 'UNIVERSIDAD AUTONOMA DE CAMPECHE', 'UACAM'),
(114, 'UNIVERSIDAD AUTONOMA DE CHIAPAS', 'UNACH'),
(115, 'UNIVERSIDAD AUTONOMA DE CHIHUAHUA', 'UACH'),
(116, 'UNIVERSIDAD AUTONOMA DE CIUDAD JUAREZ', 'UJCJ'),
(117, 'UNIVERSIDAD AUTONOMA DE COAHUILA', 'UACOAH'),
(118, 'UNIVERSIDAD AUTONOMA DE GUADALAJAR CAMPUS TABASCO', 'UDGTAB'),
(119, 'UNIVERSIDAD AUTONOMA DE GUERRERO', 'UAGRO'),
(120, 'UNIVERSIDAD AUTONOMA DE LA LAGUNA, A.C.', 'UALAGUNA'),
(121, 'UNIVERSIDAD AUTONOMA DE NAYARIT', 'UAN'),
(122, 'UNIVERSIDAD AUTONOMA DE NUEVO LEON FCFM', 'UANL FCFM'),
(123, 'UNIVERSIDAD AUTONOMA DE NUEVO LEON FIME', 'UANL FIME'),
(124, 'UNIVERSIDAD AUTONOMA DE QUERETARO', 'UAQRO'),
(125, 'UNIVERSIDAD AUTONOMA DE SINALOA', 'UASIN'),
(126, 'UNIVERSIDAD AUTONOMA DE TAMAULIPAS', 'UAT'),
(127, 'UNIVERSIDAD AUTONOMA DE YUCATAN', 'UADY'),
(128, 'UNIVERSIDAD AUTONOMA DEL CARMEN', 'UNACAR'),
(129, 'UNIVERSIDAD AUTONOMA DEL ESTADO DE HIDALGO', 'UAEH'),
(130, 'UNIVERSIDAD AUTONOMA DEL ESTADO DE MEXICO', 'UAEMEX'),
(131, 'UNIVERSIDAD AUONOMA DEL ESTADO DE MORELOS', 'UAEMOR'),
(132, 'UNIVERSIDAD AUTONOMA DEL NORESTE A.C.', 'UANE'),
(133, 'UNIVERSIDAD AUTONOMA METROPOLITANA', 'UAM'),
(134, 'UNIVERSIDAD DE COLIMA FCYA DE MANZANILLO', 'UCOL MANZ'),
(135, 'UNIVERSIDAD DE COLIMA FACULTAD DE TELEMATICA', 'UCOL TELE'),
(136, 'UNIVERSIDAD DE CUAUTITLAN IZCALLI', 'UCI'),
(137, 'UNIVERSIDAD DE GUADALAJARA (CC)', 'CC'),
(138, 'UNIVERSIDAD DE GUADALAJARA (CUALTOS)', 'CUALTOS'),
(139, 'UNIVERSIDAD DE GUADALAJARA (CUC)', 'CUC'),
(140, 'UNIVERSIDAD DE GUADALAJARA (CUCEA)', 'CUCEA'),
(141, 'UNIVERSIDAD DE GUADALAJARA (CUCEI)', 'CUCEI'),
(142, 'UNIVERSIDAD DE GUADALAJARA (CUCIENEGA)', 'CUCIENEGA'),
(143, 'UNIVERSIDAD DE GUADALAJARA (CUNORTE)', 'CUNORTE'),
(144, 'UNIVERSIDAD DE GUADALAJARA (CUSUR)', 'CUSUR'),
(145, 'UNIVERSIDAD DE GUADALAJARA (CUVALLES)', 'CUVALLES'),
(146, 'UNIVERSIDAD DE GUANAJUATO', 'UGTO'),
(147, 'UNIVERSIDAD DE IXTLAHUACA CUI AC', 'UICUI'),
(148, 'UNIVERSIDAD DE LA SALLE BAJIO A.C.', 'LASALLE BA'),
(149, 'UNIVERSIDAD DE LEON', 'ULEON'),
(150, 'UNIVERSIDAD DE MONTEMORELOS', 'UMONTEMORE'),
(151, 'UNIVERSIDAD DE MONTERREY', 'UM'),
(152, 'UNIVERSIDAD DE MORELIA', 'UMORELIA'),
(153, 'UNIVERSIDAD DE OCCIDENTE', 'UOCCIENTE'),
(154, 'UNIVERSIDAD DE QUINTANA ROO', 'UQRO'),
(155, 'UNIVERSIDAD DE SONORA', 'USON'),
(156, 'UNIVERSIDAD DE SOTAVENTO A.C.', 'USOTAVENTO'),
(157, 'UNIVERSIDAD DEL CARIBE', 'UCAR'),
(158, 'UNIVERSIDAD DEL MAYAB', 'UMAYAB'),
(159, 'UNIVERSIDAD DEL VALLE DE MEXICO A.C.', 'UVM'),
(160, 'UNIVERSIDAD DEL VALLE DE PUEBLA SC', 'UVP'),
(161, 'UNIVERSIDAD EMILIO CARDENAS S.C.', 'UDEC'),
(162, 'UNIVERSIDAD ESTATAL DE SONORA (CESES)', 'UES'),
(163, 'UNIVERSIDAD IBEROAMERICANA A.C. CAMPUS CD DE MEXICO', 'IBERO'),
(164, 'UNIVERSIDAD IBEROAMERICANA CAMPUS PUEBLA, CUGC, A.C.', 'IBERO PUE'),
(165, 'UNIVERSIDAD INSURGENTES, S.C. PLANTEL SUR', 'UINSURG'),
(166, 'UNIVERSIDAD INTERCONTINENTAL IIFILOSOFI?A A.C.', 'UINTC'),
(167, 'UNIVERSIDAD JUAREZ AUTONOMA DE TABASCO (DACB)', 'UJAT'),
(168, 'UNIVERSIDAD JUAREZ AUTONOMA DE TABASCO (DACYTI)', 'DACYTI'),
(169, 'UNIVERSIDAD JUAREZ AUTONOMA DE TABASCO (DAIS)', 'DAIS'),
(170, 'UNIVERSIDAD LA SALLE, A.C. CD DE MEXICO', 'ULASALLE'),
(171, 'UNIVERSIDAD LATINA DE AMERICA A.C.', 'ULATINA'),
(172, 'UNIVERSIDAD LOYOLA DEL PACIFICO', 'ULP'),
(173, 'UNIVERSIDAD MESOAMERICANA DE SAN AGUSTIN', 'UMSA'),
(174, 'UNIVERSIDAD MEXICO AMERICANA DEL NORTE A.C.', 'UMANORTE'),
(175, 'UNIVERSIDAD NACIONAL AUTONOMA DE MEXICO DGTIC', 'UNAM DGTIC'),
(176, 'UNIVERSIDAD NACIONAL AUTONOMA DE MEXICO FACULTAD DE CIENCIAS', 'UNAM FC'),
(177, 'UNIVERSIDAD NACIONAL AUTONOMA DE MEXICO FES CUAUTITLAN', 'UNAM FCUA'),
(178, 'UNIVERSIDAD NACIONAL AUTONOMA DE MEXICO FES ACATLAN', 'UNAM FESAC'),
(179, 'UNIVERSIDAD NACIONAL AUTONOMA DE MEXICO FES ARAGON', 'UNAM FESAR'),
(180, 'UNIVERSIDAD PABLO GUARDADO CHAVEZ S.C.', 'UPGC'),
(181, 'UNIVERSIDAD PANAMERICANA', 'UP'),
(182, 'UNIVERSIDAD POLITECNICA DE AGUASCALIENTES', 'UPA'),
(183, 'UNIVERSIDAD POLITECNICA DE SAN LUIS POTOSI', 'UPSLP'),
(184, 'UNIVERSIDAD POLITECNICA DE ZACATECAS', 'UPZ'),
(185, 'UNIVERSIDAD POLITECNICA METROPOLITANA DE HIDALGO', 'UPMH'),
(186, 'UNIVERSIDAD POPULAR AUTONOMA DEL ESTADO DE PUEBLA A.C.', 'UPAEP'),
(187, 'UNIVERSIDAD REGIOMONTANA A.C. (UR)', 'UR'),
(188, 'UNIVERSIDAD REGIONAL DEL SURESTE A.C.', 'URSE'),
(189, 'UNIVERSIDAD SIMON BOLIVAR CENTROS CULTURALES S.C.', 'USBCC'),
(190, 'UNIVERSIDAD TECNOLOGICA AMERICANA', 'UTAME'),
(191, 'UNIVERSIDAD TECNOLOGICA DE CALVILLO', 'UTCAL'),
(192, 'UNIVERSIDAD TECNOLOGICA DE CAMPECHE', 'UTCAM'),
(193, 'UNIVERSIDAD TECNOLOGICA DE CANCUN', 'UTCAN'),
(194, 'UNIVERSIDAD TECNOLOGICA DE HUEJOTZINGO', 'UTHUEJ'),
(195, 'UNIVERSIDAD TECNOLOGICA DE JALISCO', 'UTJAL'),
(196, 'UNIVERSIDAD TECNOLOGICA DE LA MIXTECA', 'UTM'),
(197, 'UNIVERSIDAD TECNOLOGICA DE LA SELVA', 'UTS'),
(198, 'UNIVERSIDAD TECNOLOGICA DE LA SIERRA HIDALGUENSE', 'UTSH'),
(199, 'UNIVERSIDAD TECNOLOGICA DE LEON', 'UTLEON'),
(200, 'UNIVERSIDAD TECNOLOGICA DE ORIZABA', 'UTO'),
(201, 'UNIVERSIDAD TECNOLOGICA DE MEXICO', 'UTMEX'),
(202, 'UNIVERSIDAD TECNOLOGICA DE MORELIA', 'UTMOR'),
(203, 'UNIVERSIDAD TECNOLOGICA DE NEZAHUALCOYOTL', 'UTNEZ'),
(204, 'UNIVERSIDAD TECNOLOGICA DE PUEBLA', 'UTPUE'),
(205, 'UNIVERSIDAD TECNOLOGICA DE TABASCO', 'UTTAB'),
(206, 'UNIVERSIDAD TECNOLOGICA DE TULANCINGO', 'UTTUL'),
(207, 'UNIVERSIDAD TECNOLOGICA DE TULA-TEPEJI', 'UTTT'),
(208, 'UNIVERSIDAD TECNOLOGICA DE XICOTEPEC DE JUAREZ', 'UTXJ'),
(209, 'UNIVERSIDAD TECNOLOGICA DEL ESTADO DE ZACATECAS', 'UTEZ'),
(210, 'UNIVERSIDAD TECNOLOGICA DEL SUROESTE DE GUANAJUATO', 'UTSEG'),
(211, 'UNIVERSIDAD TECNOLOGICA DEL NORTE DE AGUASCALIENTES', 'UTNA'),
(212, 'UNIVERSIDAD TECNOLOGICA DEL NORTE DE GUANAJUATO', 'UTNG'),
(213, 'UNIVERSIDAD TECNOLOGICA DEL VALLE DEL MEZQUITAL', 'UTVM'),
(214, 'UNIVERSIDAD TECNOLOGICA FIDEL VELAZQUEZ', 'UTFV'),
(215, 'UNIVERSIDAD TECNOLOGICA TULA-TEPEJI', 'UTTT'),
(216, 'UNIVERSIDAD VALLE DEL GRIJALVA A.C.', 'UVG'),
(217, 'UNIVERSIDAD VASCO DE QUIROGA A.C.', 'UVQ'),
(218, 'UNIVERSIDAD VERACRUZANA (CAMPUS COATZACOALCOS)', 'UV CCOAT'),
(219, 'UNIVERSIDAD VERACRUZANA (FACULTAD DE ESTADISTICA E INFORMATICA)', 'UV FEI'),
(220, 'UNIVERSIDAD DE IXTLAHUACA UI-CUI', 'UICUI');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lideres`
--

CREATE TABLE `lideres` (
  `clv_lider` char(3) COLLATE utf8_spanish_ci NOT NULL,
  `usr_lider` varchar(30) COLLATE utf8_spanish_ci DEFAULT NULL,
  `pwd_lider` varchar(30) COLLATE utf8_spanish_ci DEFAULT NULL,
  `tipo` char(20) COLLATE utf8_spanish_ci DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `precios`
--

CREATE TABLE `precios` (
  `id_precio` tinyint(3) UNSIGNED NOT NULL,
  `precio` float UNSIGNED NOT NULL DEFAULT '0',
  `fecha_limite` date NOT NULL DEFAULT '0000-00-00',
  `socio` char(1) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `id_tipousuario` tinyint(4) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recibos`
--

CREATE TABLE `recibos` (
  `iFolio` int(10) UNSIGNED NOT NULL,
  `dtotal` float NOT NULL DEFAULT '0',
  `id_asistente` char(15) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `idFolioAsistente` int(11) NOT NULL DEFAULT '0',
  `dtFecha` date NOT NULL DEFAULT '0000-00-00',
  `cHora` char(8) COLLATE utf8_spanish_ci NOT NULL DEFAULT ''
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `talleres`
--

CREATE TABLE `talleres` (
  `id_taller` int(11) NOT NULL,
  `nom_taller` varchar(128) COLLATE utf8_spanish_ci NOT NULL,
  `cupo` int(11) NOT NULL,
  `horario` varchar(30) COLLATE utf8_spanish_ci NOT NULL,
  `dias` varchar(50) COLLATE utf8_spanish_ci NOT NULL,
  `nameradio` varchar(30) COLLATE utf8_spanish_ci NOT NULL,
  `institucion` varchar(256) COLLATE utf8_spanish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `talleres`
--

INSERT INTO `talleres` (`id_taller`, `nom_taller`, `cupo`, `horario`, `dias`, `nameradio`, `institucion`) VALUES
(1, 'Machine Learning con Python\r\n', 10, '16:00-18:00', 'MIER', 'horario1', 'Dr. Óscar Alonso Ramírez-UV\r\n'),
(2, 'Ciencia de datos y estadistica: saber que dicen los datos en la vida submarina\r\n', 0, '16:00-18:00', 'MIER', 'horario2', 'Dra. Cecilia Cruz López-UV\r\n'),
(3, 'Arquitectura de los dispositivos IoT', 0, '16:00-18:00', 'MIER', 'horario3', 'Dr. Juan Manuel Gutierrez Mendez-UV\r\n'),
(4, 'Fundamentos de Spark SQL: Una Mirada al Tratamiento de Grandes Volumenes de Datos\r\n', 24, '16:00 a 18:00 ,17:00 a 19:00', 'MIER,JUE ', 'horario4', 'Mtro. Omar Méndoza González-UNAM-FES Acatlán'),
(5, 'Pensamiento algoritmico con PSEINT', 23, '16:00 a 18:00 ,17:00 a 19:00', 'MIER,JUE ', 'horario5', 'Christian Carlos Delgado Elizondo-UNAM-FES Acatlán'),
(6, 'Videos matematicos con Python Manim\r\n', 24, '16:00 a 18:00 ,17:00 a 19:00', 'MIER,JUE ', 'horario6', 'María del Carmen Gonzalez Videgaray y Ruben Romero Ruiz-UNAM FES ACATLAN\r\n'),
(7, 'Calidad de Servicio (QoS) en Redes de Computo: Configuracion basica\r\n', 18, '08:00-10:00', 'JUE', 'horario7', 'Mtra. Martha Elizabet Domínguez Barcenas-UV\r\n'),
(8, 'Haciendo que una maquina aprenda: arboles de decision\r\n', 19, '08:00-10:00', 'JUE', 'horario8', 'Dr. Saúl Domínguez Isidro-UV'),
(9, 'Introduccion a la clasificacion de imagenes a traves de redes neuronales\r\n', 18, '08:00-10:00', 'JUE', 'horario9', 'Dr. Niels Martínez Guevara-UV'),
(10, 'Medicion de la Satisfaccion de Clientes de Software\r\n', 16, '12:00-14:00', 'VIE', 'horario10', 'Dra. Judith Guadalupe Montero Mora-UV'),
(11, 'Mineria de Procesos en Ambiente Educativos \r\n', 19, '12:00-14:00', 'VIE', 'horario11', 'Mtra. Yesenia Zavaleta Sánchez-UV\r\n'),
(12, 'Diseno de UX/UI Sostenible\r\n', 16, '12:00-14:00', 'VIE', 'horario12', 'Mtra. Alessandra Reyes Flores-UV\r\n'),
(13, 'Criptografia y Esteganografia: El arte de ocultar la informacion\r\n', 20, '12:00-14:00', 'VIE', 'horario13', 'Mtro. Carlos Alberto Ochoa Rivera-UV\r\n'),
(14, 'Creacion de documentos cientificos con LaTeX y Overleaf\r\n', 20, '12:00-14:00', 'VIE', 'horario14', 'UV'),
(15, 'Tecnicas Avanzadas para Presentaciones Profesionales con LaTeX\r\n', 20, '12:00-14:00', 'VIE', 'horario15', 'UV'),
(16, 'Edicion y redaccion de articulos en formatos especializados para publicaciones científicas con LaTeX\r\n', 20, '12:00-14:00', 'VIE', 'horario16', 'UV'),
(17, 'Introduccion a la estructuracion de una Revision Sistematica de la Literatura con Parsifal', 20, '08:00-10:00', 'JUE', 'horario17', 'UV'),
(18, 'Método de Revisión Sistemática de la Literatura y gestión de artículos con Mendeley', 20, '08:00-10:00', 'JUE', 'horario18', 'UV');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipoactividad`
--

CREATE TABLE `tipoactividad` (
  `id_tipoactividad` tinyint(3) UNSIGNED NOT NULL,
  `descripcion` varchar(25) COLLATE utf8_spanish_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `tipoactividad`
--

INSERT INTO `tipoactividad` (`id_tipoactividad`, `descripcion`) VALUES
(1, 'Taller'),
(2, 'Seminario'),
(3, 'Conferencia Magistral'),
(4, 'Conferencia Simultanea'),
(5, 'Videoconferencias'),
(6, 'Mesas de Trabajo'),
(7, 'Concurso'),
(8, 'Ponencia'),
(9, 'Tesis'),
(10, 'Conferencia Invitada'),
(11, 'Hackatón'),
(12, 'Certificación '),
(13, 'Inaguración'),
(14, 'X');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipousuario`
--

CREATE TABLE `tipousuario` (
  `id_tipo` tinyint(3) UNSIGNED NOT NULL,
  `descripcion` varchar(20) COLLATE utf8_spanish_ci NOT NULL DEFAULT ''
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `tipousuario`
--

INSERT INTO `tipousuario` (`id_tipo`, `descripcion`) VALUES
(1, 'Alumno'),
(2, 'Académico'),
(3, 'Directivo'),
(5, 'Ponente'),
(6, 'Externo'),
(4, 'Instructor');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `titulos`
--

CREATE TABLE `titulos` (
  `id_titulo` tinyint(3) UNSIGNED NOT NULL,
  `descripcion` varchar(15) COLLATE utf8_spanish_ci NOT NULL DEFAULT ''
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `titulos`
--

INSERT INTO `titulos` (`id_titulo`, `descripcion`) VALUES
(1, 'Bachillerato'),
(2, 'Pasante'),
(3, 'Licenciatura'),
(4, 'Maestro'),
(5, 'Ingeniero'),
(6, 'Doctorado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `folio_recibo` varchar(6) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `titulo` varchar(30) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `nombre` varchar(125) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `apellido` varchar(256) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `id_cargo` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
  `id_tipo` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
  `carrera` varchar(128) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `id_institucion` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
  `institucion` varchar(128) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `dependencia` varchar(128) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `id_entidadfederativa` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
  `correo` varchar(80) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `lada` varchar(10) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `telefono` varchar(10) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `extension` varchar(10) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `codigo_barras` varchar(30) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `grupo_padre` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `asistio` char(1) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `genero` char(1) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `verifico` char(1) COLLATE utf8_spanish_ci NOT NULL DEFAULT '',
  `fecha_registro` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `id_costo` tinyint(3) UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `folio_recibo`, `titulo`, `nombre`, `apellido`, `id_cargo`, `id_tipo`, `carrera`, `id_institucion`, `institucion`, `dependencia`, `id_entidadfederativa`, `correo`, `lada`, `telefono`, `extension`, `codigo_barras`, `grupo_padre`, `asistio`, `genero`, `verifico`, `fecha_registro`, `id_costo`) VALUES
(1, 'C00001', 'Lic', 'Ana Lilia', 'Gonzalez', 1, 0, 'Licenciatura', 133, '', 'Azcapotzalco', 9, 'ana110881@gmail.com', '55', '5552020852', '', '', 0, '', 'F', '', '2023-10-11 13:34:16', 0),
(2, 'C00002', 'MTI.', 'Julio César', 'Díaz Mendoza', 2, 0, 'Maestría en Tecnologías de Información', 127, '', 'Facultad de Matemáticas', 31, 'julio.diaz@correo.uady.mx', '999', '9999423140', '67224', '', 0, '', 'M', '', '2023-10-11 14:17:29', 0),
(3, 'C00003', '', 'Marco Paulo', 'Mellado Cruz', 1, 0, 'Ingeniería en Sistemas Computacionales', 168, '', 'Unidad Chontalpa', 27, '192h17056@alumno.ujat.mx', '993', '3471610', '+52', '', 0, '', 'M', '', '2023-10-11 19:36:37', 0),
(4, 'C00004', 'Sintesis de programas Interact', 'Jesus Rolando', 'Ramirez Rueda', 1, 0, 'Maestro en Sistemas Interactivos Centrados en el U', 219, '', 'Estadistica e informatica', 30, 'jesusrolandorr@gmail.com', '922', '1578408', '', '', 0, '', 'M', '', '2023-10-12 00:00:39', 0),
(5, 'C00005', 'Alumno ', 'Fernando de Jesús', 'Ascencio Hernández', 1, 0, '', 168, '', '', 27, 'fernandondjesus2001@gmail.com', '52', '9931628236', '', '', 0, '', 'M', '', '2023-10-12 11:38:08', 0),
(6, 'C00006', 'Alumno ', 'Fernando de Jesús', 'Ascencio Hernández', 1, 0, '', 168, '', '', 27, 'fernandondjesus2001@gmail.com', '52', '9931628236', '', '', 0, '', 'M', '', '2023-10-12 11:55:58', 0),
(7, 'C00007', 'MTRO.', 'ABELARDO', 'GÓMEZ ANDRADE', 2, 0, 'MAESTRO EN ANÁLISIS DE SISTEMAS INDUSTRIALES', 141, '', 'CENTRO UNIVERSITARIO DE CIENCIAS EXACTAS E INGENIERÍAS', 15, 'abelardo.gandrade@academicos.udg.mx', '33', '3339470405', '', '', 0, '', 'M', '', '2023-10-12 12:36:56', 0),
(8, 'C00008', 'Alumno ', 'Fernando de Jesús', 'Ascencio Hernández', 1, 0, '', 168, '', '', 27, 'fernandondjesus2001@gmail.com', '+52', '9931628236', '', '', 0, '', 'M', '', '2023-10-12 13:47:07', 0),
(9, 'C00009', 'Alumno', 'Cristhian Jair', 'Loreto Pérez', 1, 0, 'Estudiante', 168, '', 'Campus Chontalpa', 27, 'loretoperezcristhianjair@gmail.com', '937', '1751020', '+52', '', 0, '', 'M', '', '2023-10-12 14:02:32', 0),
(10, 'C00010', 'ING ', 'Yuridiana', 'Almeida Jiménez', 1, 0, 'Ingeniera en informática administrativa', 168, '', 'Chontalpa', 27, 'yuanaalji@gmail.com', '+52', '9141402914', '', '', 0, '', 'F', '', '2023-10-12 21:16:52', 0),
(11, 'C00011', 'ING ', 'Yuridiana', 'Almeida Jiménez', 1, 0, 'Ingeniera en informática administrativa', 168, '', 'Chontalpa', 27, 'yuanaalji@gmail.com', '+52', '9141402914', '', '', 0, '', 'F', '', '2023-10-12 21:17:24', 0),
(12, 'C00012', 'ING.', 'Yuridiana', 'Almeida Jiménez', 1, 0, 'Ingeniería en informática administrativa', 168, '', 'Chontalpa', 27, 'yuanaalji@gmail.com', '+52', '9141402914', '', '', 0, '', 'F', '', '2023-10-12 21:37:32', 0),
(13, 'C00013', 'Maestra en Ciencias', 'Alba Maribel', 'Sánchez Gálvez', 2, 0, 'Maestra en Ciencias', 1, '', 'Computación', 21, 'alba.sanchez@correo.buap.mx', '222', '1187430', '', '', 0, '', 'F', '', '2023-10-12 23:06:48', 0),
(14, 'C00014', 'Mtra.', 'María Elena', 'Romero Gastelú', 2, 0, 'Maestría en Sistemas de Información', 141, '', 'CUCEI', 15, 'elena.romero@academicos.udg.mx', '33', '37232615', '', '', 0, '', 'F', '', '2023-10-13 00:21:12', 0),
(15, 'C00015', 'DOCTORADO', 'JANETTE ARACELI', 'CASTELLANOS BARAJAS', 2, 0, 'DOCTORA EN COMPETENCIAS EDUCATIVAS', 141, '', 'CUCEI', 15, 'janette.castellanos@academicos.udg.mx', '33', '3310814773', '', '', 0, '', 'F', '', '2023-10-13 10:18:33', 0),
(16, 'C00016', 'Dra.', 'Patricia', 'Sánchez Rosario', 2, 0, 'Doctorado', 141, '', 'Centro Universitario de Ciencias Exactas e Ingenierías', 15, 'patricia.srosario@academicos.udg.mx', '33', '10071813', '', '', 0, '', 'F', '', '2023-10-13 13:08:38', 0),
(17, 'C00017', 'Dra.', 'Patricia', 'Sánchez Rosario', 2, 0, 'Doctorado', 141, '', 'Centro Universitario de Ciencias Exactas e Ingenierías', 15, 'patricia.srosario@academicos.udg.mx', '33', '10071813', '', '', 0, '', 'F', '', '2023-10-13 14:02:15', 0),
(18, 'C00018', 'Dra.', 'Patricia', 'Sánchez Rosario', 2, 0, 'Doctorado', 141, '', 'Centro Universitario de Ciencias Exactas e Ingenierías', 15, 'patricia.srosario@academicos.udg.mx', '33', '10071813', '', '', 0, '', 'F', '', '2023-10-13 14:09:22', 0),
(19, 'C00019', 'M. EN C.', 'RUBEN', 'PEREDO VALDERRAMA', 2, 0, 'M. EN C.', 21, '', 'ZACATENCO', 9, 'rubenperedo@hotmail.com', '55', '57296000', '52039', '', 0, '', 'M', '', '2023-10-13 14:27:14', 0),
(20, 'C00020', 'M. EN C.', 'RUBEN', 'PEREDO VALDERRAMA', 2, 0, 'M. EN C.', 21, '', 'ZACATENCO', 9, 'rubenperedo@hotmail.com', '55', '57296000', '52039', '', 0, '', 'M', '', '2023-10-13 14:30:09', 0),
(21, 'C00021', 'Lic', 'ANA', 'FRAGOSO', 1, 0, 'Licenciatura', 133, '', 'Azcapotzalco', 9, 'ana110881@gmail.com', '', '5552020852', '', '', 0, '', 'F', '', '2023-10-13 14:34:25', 0),
(22, 'C00022', '', 'Mónica Janeth', 'Gómez Broca', 1, 0, '', 168, '', '', 27, '212h16016@alumno.ujat.mx', '', '', '', '', 0, '', 'F', '', '2023-10-13 18:27:18', 0),
(23, 'C00023', '', 'Mónica Janeth', 'Gómez Broca', 1, 0, '', 168, '', 'Chontalpa', 27, '212h16016@alumno.ujat.mx', '', '', '', '', 0, '', 'F', '', '2023-10-13 18:37:49', 0),
(24, 'C00024', 'Estudiante', 'Juan Carlos', 'Cabrera Gonzalez', 1, 0, '', 0, '', 'DIVISION DE CIENCIAS Y TECNOLOGIAS DE LA INFORMACION', 27, 'carloscbgn@gmail.com', '993', '9931066157', '', '', 0, '', 'M', '', '2023-10-13 22:08:32', 0),
(25, 'C00025', '', 'ANIA SCARLETH', 'TORRES VASCONCELOS', 1, 0, '', 168, '', 'CHONTALPA', 27, '212H16018@alumno.ujat.mx', '', '', '', '', 0, '', 'F', '', '2023-10-13 22:21:31', 0),
(26, 'C00026', '', 'Danny Yajahira', 'Mendoza Sevilla', 1, 0, '', 168, '', 'campus Chontalpa', 27, '212H16041@alumnos.ujat.mx', '', '', '', '', 0, '', 'F', '', '2023-10-13 23:20:49', 0),
(27, 'C00027', 'Dr.', 'Mauricio Arturo', 'Ibarra Corona', 2, 0, 'Doctor en Innovación en Tecnología Educativa', 124, '', 'FACULTAD DE INFORMÁTICA', 22, 'mauricio.ibarra@uaq.mx', '442', '3435518', '', '', 0, '', 'M', '', '2023-10-16 08:25:16', 0),
(28, 'C00028', '', 'David Eduardo', 'Ramos Estrada', 1, 0, '', 168, '', 'DACYTI', 27, 'david_ed01@hotmail.com', '+52', '9141064935', '', '', 0, '', 'M', '', '2023-10-16 17:31:30', 0),
(29, 'C00029', 'M.A.P.', 'Edy del Jesús', 'Pérez Vera', 2, 0, 'LICENCIATURA EN INFORMÁTICA ADMINISTRATIVA', 168, '', 'DIVISIÓN ACADÉMICA MULTIDISCIPLINARIA DE LOS RÍOS', 27, 'edypv78@gmail.com', '934', '1074394', '', '', 0, '', 'M', '', '2023-10-17 13:45:17', 0),
(30, 'C00030', 'Est.', 'Luis Eduardo', 'Hernández Ávila', 1, 0, '', 168, '', 'DIVISION ACADEMICA MULTIDISCIPLINARIA DE LOS RIOS', 27, 'luishavla3@gmail.com', '934', '1308661', '', '', 0, '', 'M', '', '2023-10-18 12:27:41', 0),
(31, 'C00031', 'Est', 'Brenda berenis', 'Torres chan', 1, 0, '', 168, '', 'División Académica Multidisciplinaria De Los Ríos', 27, 'btorreschan19@gmail.com', '934', '1126415', '', '', 0, '', 'F', '', '2023-10-18 12:37:46', 0),
(32, 'C00032', 'Est', 'Eduardo', 'Sandoval Zavala', 1, 0, '', 168, '', 'División Académica Multidisciplinaria De Los Rios', 27, 'lalinsando94@gmail.com', '934', '1148435', '', '', 0, '', 'M', '', '2023-10-18 12:41:53', 0),
(33, 'C00033', 'Est', 'Eduardo Emmanuel', 'Alamilla Miranda', 1, 0, '', 168, '', 'Division Académica Multidisciplinaria de los Rios', 27, 'kkrotolalo@gmail.com', '', '9341345321', '', '', 0, '', 'M', '', '2023-10-18 12:42:37', 0),
(34, 'C00034', 'Estudiante', 'David', 'Ortiz Gutiérrez', 1, 0, '', 168, '', 'División Académica Multidisciplinaria de los Ríos', 27, 'barmenia.31@gmail.com', '+52', '9341180845', '', '', 0, '', 'M', '', '2023-10-18 12:42:45', 0),
(35, 'C00035', 'Est', 'Pedro Javier', 'Gómez Sanchez', 1, 0, '', 168, '', 'División académica multidisciplinaria de los rios', 27, 'karenroi669@gmail.com', '52', '9341217778', '', '', 0, '', 'M', '', '2023-10-18 12:42:47', 0),
(36, 'C00036', 'Diana ', 'Cristel', 'Galicia Ruiz', 1, 0, '', 168, '', 'División Académica Multidisciplinaria De Los Ríos', 27, 'dianagalicia960@gmail.com', '+52', '9341071793', '', '', 0, '', 'F', '', '2023-10-18 12:46:07', 0),
(37, 'C00037', 'Estudiante', 'Cristobal Jesus', 'Jimenez Olan', 1, 0, '', 168, '', 'División Académica Multidisciplinaria de los Ríos', 27, 'crisolan538@gmail.com', '+52', '9341142376', '', '', 0, '', 'M', '', '2023-10-18 12:48:21', 0),
(38, 'C00038', 'Estudiante', 'Francisco de Jesus', 'Jiménez Noriega', 1, 0, '', 168, '', 'División Académica Multidisciplinaria de los Ríos', 27, 'pac.12345.98@gmail.com', '+52', '9341039900', '', '', 0, '', 'M', '', '2023-10-18 12:59:10', 0),
(39, 'C00039', 'Est.', 'Yaret', 'Hernandez jimenez', 1, 0, '', 168, '', 'División académica multidisciplinaria de los ríos', 27, 'yaretdun344@gmail.com', '+52', '9341119697', '', '', 0, '', 'F', '', '2023-10-18 13:02:16', 0),
(40, 'C00040', 'Est.', 'Jared', 'Barahona Garcia', 1, 0, '', 168, '', 'Division Academica Multidisciplinaria', 27, 'jared_18_00@hotmail.com', '+52', '9341218091', '', '', 0, '', 'M', '', '2023-10-18 13:23:55', 0),
(41, 'C00041', 'Est.', 'Gerardo de Jesús', 'Castillejos Hernández', 1, 0, '', 168, '', 'Division Academica Multidisciplinaria', 27, 'castillejosgerardo013@gmail.com', '+52', '9341129156', '', '', 0, '', 'M', '', '2023-10-18 13:41:34', 0),
(42, 'C00042', 'Estudiante', 'Betsabe', 'De Los Santos Machín', 1, 0, '', 168, '', 'División Académica Multidisciplinar de los Ríos', 27, 'betsabedelossantosmachin@gmail.com', '+52', '9371167794', '', '', 0, '', 'F', '', '2023-10-18 13:55:24', 0),
(43, 'C00043', 'Est', 'Emmanuel', 'González Chan', 0, 0, '', 168, '', 'División Académica Multidisciplinaria De Los Ríos', 27, 'gonzalezemmanuel517@gmail.com', '52', '9341298560', '', '', 0, '', 'M', '', '2023-10-18 14:11:42', 0),
(44, 'C00044', 'Est', 'Aurelia Magdalena', 'Corrales Hernández', 1, 0, '', 168, '', 'Division Academica Multidisciplinaria de los Ríos', 27, 'aureliacorralesh@gmail.com', '934', '1189055', '', '', 0, '', 'F', '', '2023-10-18 14:14:47', 0),
(45, 'C00045', 'Est.', 'Yonder Yafet', 'Guzmán Rodríguez', 1, 0, '', 168, '', 'Division Academica Multidisciplinaria de los Ríos', 27, 'yonderyafet@gmail.com', '934', '1178408', '', '', 0, '', 'M', '', '2023-10-18 14:22:15', 0),
(46, 'C00046', 'Est', 'Ronny jazniel', 'Trinidad Peralta', 1, 0, '', 168, '', '', 27, 'peraltajazniel@gmail.com', '', '9341030475', '', '', 0, '', 'M', '', '2023-10-18 14:23:42', 0),
(47, 'C00047', 'Est.', 'Jorge Luis', 'Estrada Rivera', 1, 0, '', 168, '', 'Division Academica Multidisciplinaria de los Ríos', 27, 'wofnic@gmail.com', '502', '41402250', '', '', 0, '', 'M', '', '2023-10-18 14:29:43', 0),
(48, 'C00048', 'Est.', 'Jorddy', 'López Méndez', 1, 0, '', 168, '', 'Division Academica Multidisciplinaria de los Ríos', 27, 'jorddylm@gmail.com', '934', '1228946', '', '', 0, '', 'M', '', '2023-10-18 14:34:12', 0),
(49, 'C00049', 'Est.', 'Felipe', 'Sánchez López', 1, 0, '', 168, '', 'Division Academica Multidisciplinaria de los Ríos', 27, 'sanchezlopezfelipe76@gmail.com', '934', '1036795', '', '', 0, '', 'M', '', '2023-10-18 14:45:29', 0),
(50, 'C00050', 'Est.', 'Misheel Azelleb', 'Sanchez de la Torre', 1, 0, '', 168, '', 'Division Academica Multidisciplinaria de los Ríos', 27, 'misheelsanchez140@gmail.com', '934', '1833033', '', '', 0, '', 'F', '', '2023-10-18 15:02:49', 0),
(51, 'C00051', 'Est.', 'Ricardo De Jesús', 'Galicia Bolón', 1, 0, '', 168, '', 'Division Academica Multidisciplinaria de los Ríos', 27, 'ricardogb0905@gmail.com', '+52', '9341273988', '', '', 0, '', 'M', '', '2023-10-18 15:21:06', 0),
(52, 'C00052', 'Dra.', 'Cecilia', 'Cruz López', 2, 0, 'Doctora en Investigación Educativa', 219, '', 'Xalapa', 30, 'ceccruz@uv.mx', '228', '8422700', '14186', '', 0, '', 'F', '', '2023-10-18 15:37:17', 0),
(53, 'C00053', 'Est.', 'Jose Guadalupe', 'Guzman Garduza', 1, 0, '', 168, '', 'Division Academica Multidisciplinaria de los Ríos', 27, 'guzmangarduzajose19@gmail.com', '917', '1171159', '', '', 0, '', 'M', '', '2023-10-18 15:44:11', 0),
(54, 'C00054', 'Dra.', 'Julia Aurora', 'Montano Rivas', 2, 0, 'Doctora en Matemáticas', 219, '', 'Xalapa', 30, 'julmontano@uv.mx', '228', '8422700', '14186', '', 0, '', 'F', '', '2023-10-18 15:44:54', 0),
(55, 'C00055', 'Estudiante ', 'Jose Adrián', 'Rosado Torres', 1, 0, '', 168, '', 'División académica multidisciplinar de los Ríos', 27, 'torresrthdtn@gmail.com', '+52', '9341291719', '', '', 0, '', 'M', '', '2023-10-18 15:51:11', 0),
(56, 'C00056', 'Est.', 'Rogelio', 'Uco Sanchez', 1, 0, '', 168, '', 'Division Academica Multidisciplinaria de los Ríos', 27, 'rogelio_tauro98@hotmail.com', '934', '1175102', '', '', 0, '', 'M', '', '2023-10-18 15:57:41', 0),
(57, 'C00057', 'Estudiante ', 'Ronaldo', 'Nolasco Villa', 1, 0, '', 168, '', 'División académica multidisciplinaria de los ríos', 27, 'Ronalddo_18@hotmail.com', '+52', '9341035661', '', '', 0, '', 'M', '', '2023-10-18 15:58:35', 0),
(58, 'C00058', 'Est.', 'Yareli Marisol', 'Aguilar Torres', 1, 0, '', 168, '', 'Division Academica Multidisciplinaria de los Ríos', 27, 'yareliaguilartorres60@gmail.com', '934', '3445913', '', '', 0, '', 'F', '', '2023-10-18 16:07:44', 0),
(59, 'C00059', 'Estudiante ', 'Rodrigo Aarón', 'Rodríguez Solís', 1, 0, '', 168, '', 'División Académica Multidisciplinaria De Los Ríos', 27, 'rodrigo.rodriguerz@gmail.com', '+52', '9343486082', '', '', 0, '', 'M', '', '2023-10-18 17:13:33', 0),
(60, 'C00060', '', 'Maria Laura', 'León Corona', 1, 0, '', 168, '', 'División Académica Multidisciplinaria de los Ríos', 27, 'marialauraleoncorona31@gmail.com', '', '9341117287', '', '', 0, '', 'F', '', '2023-10-18 19:26:28', 0),
(61, 'C00061', 'M. en C.', 'María del Carmen', 'Santiago Díaz', 2, 0, 'Maestro en Ciencias de la Computación', 1, '', 'Ciudad Unkiversitaria', 21, 'marycarmen.santiago@correo.buap.mx', '012', '222080519', '', '', 0, '', 'F', '', '2023-10-18 20:13:43', 0),
(62, 'C00062', 'Dr.', 'Gustavo Trinidad', 'Rubín Linares', 2, 0, 'Doctorado en ciencias', 1, '', 'Facultad de Ciencias de la Computación', 21, 'gustavo.rubin@correo.buap.mx', '012', '2221583178', '', '', 0, '', 'M', '', '2023-10-18 20:21:04', 0),
(63, 'C00063', '', 'Jorge', 'Marquez Luna', 1, 0, 'Estudiante', 111, '', 'Facultad de Ciencias', 2, 'jorge.marquez.luna@uabc.edu.mx', '646', '1244957', '+52', '', 0, '', 'M', '', '2023-10-18 22:20:32', 0),
(64, 'C00064', 'Estudiante', 'Carlos Enrique', 'Espadas Landero', 1, 0, '', 168, '', 'División académica multidisciplinaria de los ríos', 27, 'carlosespadas141@gmail.com', '+52', '9342625392', '', '', 0, '', 'M', '', '2023-10-19 09:27:05', 0),
(65, 'C00065', 'Estudiante', 'Abisai', 'Ramírez Guzmán', 1, 0, '', 168, '', 'División Académica Multidisciplinaria de los Rios', 27, 'abisailopez10248@gmail.com', '+52', '9341306797', '', '', 0, '', 'M', '', '2023-10-19 09:42:16', 0),
(66, 'C00066', 'M.A.', 'Irlanda Yanet', 'Ordoñez Sánchez', 2, 0, 'Maestra en Administración', 168, '', 'División Académica Multidisciplinaria de los Ríos', 27, 'irlanda.ordonez@ujat.mx', '934', '1217804', '', '', 0, '', 'F', '', '2023-10-19 10:19:13', 0),
(67, 'C00067', 'Est.', 'Daniela', 'Suy Cuj', 1, 0, '', 168, '', 'División Académica Multidisciplinaria de los Ríos', 27, 'danielasuy.17@gmail.com', '934', '1235607', '', '', 0, '', 'F', '', '2023-10-19 10:49:26', 0),
(68, 'C00068', 'Dra. ', 'Sandra', 'Aguilar Hernández', 2, 0, 'Doctora en Administración', 168, '', 'División Académica Multidisciplinaria de los Ríos', 27, 'sandra.aguilar@ujat.mx', '934', '1028128', '', '', 0, '', 'F', '', '2023-10-19 10:51:35', 0),
(69, 'C00069', 'Est.', 'Karla Citlali', 'Jiménez Cruz', 1, 0, '', 168, '', 'División Académica Multidisciplinaria de los Ríos', 27, 'karlajmnzcrz@gmail.com', '934', '1021876', '', '', 0, '', 'F', '', '2023-10-19 10:53:25', 0),
(70, 'C00070', 'Dra. ', 'Martha Julia', 'Macosay Cruz', 2, 0, 'Doctora en Educación', 168, '', 'División Académica Multidisciplinaria de los Ríos', 27, 'martha.macosay@ujat.mx', '934', '1043207', '', '', 0, '', 'F', '', '2023-10-19 10:56:31', 0),
(71, 'C00071', 'Est.', 'Yareli Marisol', 'Aguilar Torres', 1, 0, '', 168, '', 'División Académica Multidisciplinaria de los Ríos', 27, 'yareliaguilartorres60@gmail.com', '934', '3445913', '', '', 0, '', 'F', '', '2023-10-19 10:56:51', 0),
(72, 'C00072', 'Dr.', 'Gilberto Eduardo', 'Domínguez García', 2, 0, 'Doctor en Administración', 168, '', 'División Académica Multidisciplinaria de los Ríos', 27, 'gilberto.dominguez@ujat.mx', '934', '1185503', '', '', 0, '', 'M', '', '2023-10-19 11:02:00', 0),
(73, 'C00073', 'Est.', 'Javier Francisco', 'Rodríguez Suárez', 1, 0, '', 168, '', 'División Académica Multidisciplinaria de los Ríos', 27, 'rodriguezsuarezjavier8@gmail.com', '934', '1290345', '', '', 0, '', 'M', '', '2023-10-19 11:17:35', 0),
(74, 'C00074', '', 'Raúl Gilberto', 'Arriaga juarez', 1, 0, '', 168, '', 'Chontalpa', 27, 'kyraul76@gmail.com', '52', '9371378164', '', '', 0, '', 'M', '', '2023-10-19 11:27:53', 0),
(75, 'C00075', '', 'Noel', 'Martínez Vázquez', 1, 0, '', 168, '', 'DACYTI Campus Chontalpa', 27, '192H17029@alumno.ujat.mx', '937', '1425526', '', '', 0, '', 'M', '', '2023-10-19 11:32:35', 0),
(76, 'C00076', 'Est.', 'Gabriel Jesús', 'Hernández Rodríguez', 1, 0, '', 168, '', 'División Académica Multidisciplinaria de los Ríos', 27, 'gabriel2003.hr@gmail.com', '934', '1149833', '', '', 0, '', 'M', '', '2023-10-19 12:03:00', 0),
(77, 'C00077', '', 'Omar', 'Sánchez Santana', 1, 0, 'Ing. Informática Administrativa', 168, '', 'División Académica de Ciencias y Tecnologías de la Información', 27, '192h16002@alumno.ujat.mx', '52', '9371227172', '', '', 0, '', 'M', '', '2023-10-19 13:29:29', 0),
(78, 'C00078', '', 'Nohemi Jazmin', 'Brito Cordova', 1, 0, '', 168, '', 'Campus Chontalpa', 27, 'njazmin.britoc@gmail.com', '', '9331077228', '', '', 0, '', 'F', '', '2023-10-19 13:34:14', 0),
(79, 'C00079', '', 'Valencia', 'Valencia Saraoz', 1, 0, 'Ingeniera en Sistemas Computacionales', 168, '', 'División Académica de Ciencias y Tecnologías de la Información', 27, '182H17034@alumno.ujat.mx', '+52', '9934227208', '', '', 0, '', 'M', '', '2023-10-19 13:54:18', 0),
(80, 'C00080', '', 'Patricia', 'Pérez', 1, 0, 'Ingeniería en sistemas computacionales (ISC)', 168, '', 'Campus chontalpa', 27, 'darckersita.zero@gmail.com', '', '9932109964', '', '', 0, '', 'F', '', '2023-10-19 14:06:46', 0),
(81, 'C00081', 'Estudiante', 'Jesús Gustavo', 'Rodríguez Flores', 1, 0, '', 168, '', 'División Académica Multidisciplinaria de los Rios', 27, 'zomberzexs@gmail.com', '+52', '9341072715', '', '', 0, '', 'M', '', '2023-10-19 14:15:54', 0),
(82, 'C00082', 'Ingeniera', 'Nayeli', 'Castañeda González', 6, 0, 'Ingeniería en informática administrativa', 168, '', 'Campus Chontalpa', 27, 'nayelicastanedag@gmail.com', '993', '9934308868', '', '', 0, '', 'F', '', '2023-10-19 15:46:20', 0),
(83, 'C00083', 'Dr.', 'Víctor Hugo', 'Menéndez Domínguez', 2, 0, 'Doctor en Tecnologías Informáticas Avanzadas', 127, '', 'Facultad de Matemáticas', 31, 'mdoming@correo.uady.mx', '999', '9423140', '', '', 0, '', 'M', '', '2023-10-19 16:01:31', 0),
(84, 'C00084', '', 'Keila Azucena', 'Custodio García', 1, 0, '', 168, '', 'Campus Chontalpa', 27, '182h17067@alumno.ujat.mx', '+52', '9141244663', '', '', 0, '', 'F', '', '2023-10-19 16:10:16', 0),
(85, 'C00085', 'Ingeniera', 'Beatriz', 'Diaz Mendez', 1, 0, 'Ingeniera informática administrativa', 168, '', 'Cunduacán', 27, 'ariel.81.bdm@gmail.com', '52', '9933425797', '', '', 0, '', 'F', '', '2023-10-19 16:27:26', 0),
(86, 'C00086', 'Est.', 'Fernando', 'Velasco López', 1, 0, '', 168, '', 'División Académica Multidisciplinaria de los Ríos', 27, 'nando.velesco.lopez@gmail.com', '934', '1312156', '', '', 0, '', 'M', '', '2023-10-19 16:27:56', 0),
(87, 'C00087', '', 'Keila Azucena', 'Custodio García', 1, 0, '', 168, '', 'Campus Chontalpa', 27, '182h17067@alumno.ujat.mx', '+52', '9141244663', '', '', 0, '', 'F', '', '2023-10-19 16:29:40', 0),
(88, 'C00088', '', 'Keila Azucena', 'Custodio García', 1, 0, '', 168, '', 'Campus Chontalpa', 27, '182h17067@alumno.ujat.mx', '+52', '9141244663', '', '', 0, '', 'F', '', '2023-10-19 16:36:50', 0),
(89, 'C00089', '32', 'Eddy Santiago', 'Hernández Cárdenas', 1, 0, '', 168, '', '', 27, 'emendoza1978@hotmail.com', '', '9341150478', '', '', 0, '', 'M', '', '2023-10-19 16:50:17', 0),
(90, 'C00090', '', 'Eloisa', 'Mendoza Vázquez', 2, 0, '', 168, '', '', 27, 'emendoza1978@hotmail.com', '', '9341150478', '', '', 0, '', 'F', '', '2023-10-19 17:02:07', 0),
(91, 'C00091', '', 'Patricia', 'Pérez', 1, 0, 'Ingeniería en sistemas computacionales (ISC)', 168, '', 'Campus Chontalpa', 27, '182H17079@alumno.ujat.mx', '', '9932109964', '', '', 0, '', 'F', '', '2023-10-19 17:38:19', 0),
(92, 'C00092', 'ISC', 'Dulce María', 'Montejo Cortázar', 1, 0, 'Ingeniero en Sistemas Computacionales', 168, '', 'División Académica de Ciencias y Tecnologías de la Información', 27, 'dulcemariamontejo05@gmail.com', '914', '1299463', '', '', 0, '', 'F', '', '2023-10-19 18:53:40', 0),
(93, 'C00093', 'ING ', 'Lesly Alejandra', 'Romero León', 1, 0, 'Ingenieria en sistemas computacionales', 168, '', 'División academia de ciencias y tecnología de la información', 27, 'leslyalejandra.romero.leon@gmail.com', '937', '9372700952', '', '', 0, '', 'F', '', '2023-10-19 19:55:43', 0),
(94, 'C00094', 'Mtro', 'Juan José', 'López Cisneros', 2, 0, 'Maestro en Tecnologías para el Aprendizaje', 141, '', 'Centro Universitario de Ciencias Exactas e Ingenierías', 15, 'juan.lopez@academicos.udg.mx', '', '3314434759', '', '', 0, '', 'M', '', '2023-10-19 20:51:12', 0),
(95, 'C00095', 'Maestra', 'ELIZABETH', 'TORRES GUILLERMO', 2, 0, 'Mastro en Sitemas de Información', 168, '', 'División Academica Multidisciplinaria de los Ríos', 27, 'beti_tg@hotmail.com', '', '9341185445', '', '', 0, '', 'F', '', '2023-10-19 21:51:43', 0),
(96, 'C00096', 'Ingeniera ', 'Beatriz', 'Díaz Méndez', 1, 0, 'INGENIERIA INFORMATICA ADMINISTRATIVA', 168, '', 'Chontalpa', 27, 'ariel.81.bdm@gmail.com', '52', '9933425797', '', '', 0, '', 'F', '', '2023-10-19 21:52:01', 0),
(97, 'C00097', 'Dr.', 'Mario', 'Anzures García', 2, 0, 'Doctor', 1, '', 'Facultad de Ciencias de la Computación', 21, 'mario.anzures@correo.buap.mx', '', '2225882936', '', '', 0, '', 'M', '', '2023-10-19 22:38:23', 0),
(98, 'C00098', 'Dr.', 'Nelson Javier', 'Cetz Canche', 2, 0, 'Doctor en Sistemas Computacionales', 168, '', 'División Académica de Ciencias y Tecnonologías de la Información', 27, 'nelson.cetz@ujat.mx', '993', '1964038', '', '', 0, '', 'M', '', '2023-10-20 00:38:13', 0),
(99, 'C00099', 'Dra.', 'Patricia', 'Sánchez Rosario', 2, 0, 'Doctorado', 141, '', 'Centro Universitario de Ciencias Exactas e Ingenierías', 15, 'patricia.srosario@academicos.udg.mx', '', '3310071813', '', '', 0, '', 'F', '', '2023-10-20 17:22:53', 0),
(100, 'C00100', '', 'Eva Lissette', 'Paredes Cabrera', 1, 0, 'Licenciatura en Ingeniería Mecatrónica', 219, '', 'Facultad de Estadística e Informática', 30, 'lissette.epc@gmail.com', '52', '2281082197', '', '', 0, '', 'F', '', '2023-10-21 15:02:11', 0),
(101, 'C00101', '', 'Hector Yoav', 'Ugarte Ramirez', 1, 0, '', 1, '', 'Facultad de Ciencias de la Computación', 21, 'hector_ugarter@hotmail.com', '+52', '2229654485', '', '', 0, '', 'M', '', '2023-10-22 12:54:42', 0),
(102, 'C00102', '', 'Saul', 'Martínez Maldonado', 1, 0, '', 1, '', 'Facultad de Ciencias de la Computación', 21, 'bros_z1@hotmail.com', '+52', '2213709512', '', '', 0, '', 'M', '', '2023-10-22 13:01:42', 0),
(103, 'C00103', '', 'Luis Angel', 'Cruz Olea', 1, 0, '', 1, '', 'Facultad de Ciencias de la Computación', 21, 'luisc1462@gmail.com', '+52', '22-26-84-8', '', '', 0, '', 'M', '', '2023-10-22 13:04:40', 0),
(104, 'C00104', '', 'Diego', 'Domínguez Palacios', 1, 0, '', 1, '', 'Facultad de Ciencias de la Computación', 21, 'diego.dominguezpa@alumno.buap.mx', '+52', '222 416 26', '', '', 0, '', 'M', '', '2023-10-22 14:12:02', 0),
(105, 'C00105', 'Licenciado', 'Hazan Javier', 'Orrico Argüello', 1, 0, 'Licenciado en Tecnologías Computacionales', 219, '', 'Facultad Estadística e Informatica', 30, 'hazan05naruto@gmail.com', '52', '2281630842', '', '', 0, '', 'M', '', '2023-10-22 19:46:31', 0),
(106, 'C00106', '', 'Ramón Alejandro', 'Aguirre Romero', 1, 0, '', 135, '', 'Facultad de telemática', 8, 'ramonlexaguirre@gmail.com', '+52', '3131', '032788', '', 0, '', 'M', '', '2023-10-23 15:32:34', 0),
(107, 'C00107', 'Lic', 'Luz Marisol', 'Falfán Hernández', 1, 0, 'Licenciada en Tecnologías Computacionales', 219, '', 'Xalapa', 30, 'falfanluz2@gmail.com', '228', '3595532', '', '', 0, '', 'F', '', '2023-10-24 16:07:01', 0),
(108, 'C00108', '', 'DIEGO', 'DOMINGUEZ PALACIOS', 1, 0, '', 1, '', 'FACULTAD DE CIENCIAS DE LA COMPUTACIÓN', 21, 'dmgzpa@outlook.com', '222', '416', '2691', '', 0, '', 'M', '', '2023-10-24 17:39:04', 0),
(109, 'C00109', '', 'DIEGO', 'DOMINGUEZ PALACIOS', 1, 0, '', 1, '', 'FACULTAD DE CIENCIAS DE LA COMPUTACIÓN', 21, 'dmgzpa@outlook.com', '222', '416', '2691', '', 0, '', 'M', '', '2023-10-24 17:44:42', 0),
(110, 'C00110', '', 'José Daniel', 'Granados García', 1, 0, '', 220, '', 'Facultad de ingeniería', 11, 'daniel.granados@uicui.edu.mx', '', '7121783222', '', '', 0, '', 'M', '', '2023-10-24 19:02:15', 0),
(111, 'C00111', '', 'Luis Angel', 'Cruz Olea', 1, 0, '', 1, '', 'Facultad de Ciencias de la Computación', 21, 'subcero139@hotmail.com', '222', '6848429', '', '', 0, '', 'M', '', '2023-10-24 21:44:14', 0),
(112, 'C00112', '', 'Diego', 'Domínguez Palacios', 1, 0, '', 1, '', 'Facultad de Ciencias de la Computación', 21, 'hthor123@hotmail.com', '+52', '2224162691', '', '', 0, '', 'M', '', '2023-10-24 22:10:55', 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `accesos`
--
ALTER TABLE `accesos`
  ADD PRIMARY KEY (`id_acceso`,`username`);

--
-- Indices de la tabla `actividades`
--
ALTER TABLE `actividades`
  ADD PRIMARY KEY (`id_actividad`);

--
-- Indices de la tabla `Asistencia`
--
ALTER TABLE `Asistencia`
  ADD PRIMARY KEY (`id_usuario`,`id_actividad`),
  ADD UNIQUE KEY `id_usuario` (`id_usuario`),
  ADD UNIQUE KEY `id_usuario_2` (`id_usuario`),
  ADD UNIQUE KEY `id_usuario_3` (`id_usuario`);

--
-- Indices de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD PRIMARY KEY (`id_ast`);

--
-- Indices de la tabla `cargos`
--
ALTER TABLE `cargos`
  ADD PRIMARY KEY (`id_cargo`);

--
-- Indices de la tabla `costos`
--
ALTER TABLE `costos`
  ADD PRIMARY KEY (`id_costo`);

--
-- Indices de la tabla `depositos`
--
ALTER TABLE `depositos`
  ADD PRIMARY KEY (`id_deposito`);

--
-- Indices de la tabla `estados`
--
ALTER TABLE `estados`
  ADD PRIMARY KEY (`id_entidadfederativa`);

--
-- Indices de la tabla `facturaciones`
--
ALTER TABLE `facturaciones`
  ADD PRIMARY KEY (`id_facturacion`);

--
-- Indices de la tabla `fecha_eventos`
--
ALTER TABLE `fecha_eventos`
  ADD PRIMARY KEY (`id_fechaevento`);

--
-- Indices de la tabla `hackaton`
--
ALTER TABLE `hackaton`
  ADD PRIMARY KEY (`id_hackaton`);

--
-- Indices de la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  ADD PRIMARY KEY (`id_inscripcion`);

--
-- Indices de la tabla `inscripcion_talleres`
--
ALTER TABLE `inscripcion_talleres`
  ADD PRIMARY KEY (`id_installeres`);

--
-- Indices de la tabla `instituciones`
--
ALTER TABLE `instituciones`
  ADD UNIQUE KEY `id_institucion` (`id_institucion`);

--
-- Indices de la tabla `lideres`
--
ALTER TABLE `lideres`
  ADD PRIMARY KEY (`clv_lider`);

--
-- Indices de la tabla `precios`
--
ALTER TABLE `precios`
  ADD PRIMARY KEY (`id_precio`);

--
-- Indices de la tabla `recibos`
--
ALTER TABLE `recibos`
  ADD PRIMARY KEY (`iFolio`);

--
-- Indices de la tabla `talleres`
--
ALTER TABLE `talleres`
  ADD PRIMARY KEY (`id_taller`),
  ADD KEY `id_taller` (`id_taller`);

--
-- Indices de la tabla `tipoactividad`
--
ALTER TABLE `tipoactividad`
  ADD PRIMARY KEY (`id_tipoactividad`),
  ADD UNIQUE KEY `id_tipoactividad` (`id_tipoactividad`);

--
-- Indices de la tabla `tipousuario`
--
ALTER TABLE `tipousuario`
  ADD PRIMARY KEY (`id_tipo`);

--
-- Indices de la tabla `titulos`
--
ALTER TABLE `titulos`
  ADD PRIMARY KEY (`id_titulo`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `id_usuario` (`id_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `accesos`
--
ALTER TABLE `accesos`
  MODIFY `id_acceso` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=256;

--
-- AUTO_INCREMENT de la tabla `actividades`
--
ALTER TABLE `actividades`
  MODIFY `id_actividad` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  MODIFY `id_ast` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cargos`
--
ALTER TABLE `cargos`
  MODIFY `id_cargo` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `costos`
--
ALTER TABLE `costos`
  MODIFY `id_costo` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `depositos`
--
ALTER TABLE `depositos`
  MODIFY `id_deposito` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT de la tabla `estados`
--
ALTER TABLE `estados`
  MODIFY `id_entidadfederativa` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `facturaciones`
--
ALTER TABLE `facturaciones`
  MODIFY `id_facturacion` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `fecha_eventos`
--
ALTER TABLE `fecha_eventos`
  MODIFY `id_fechaevento` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `hackaton`
--
ALTER TABLE `hackaton`
  MODIFY `id_hackaton` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  MODIFY `id_inscripcion` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT de la tabla `inscripcion_talleres`
--
ALTER TABLE `inscripcion_talleres`
  MODIFY `id_installeres` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT de la tabla `precios`
--
ALTER TABLE `precios`
  MODIFY `id_precio` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `recibos`
--
ALTER TABLE `recibos`
  MODIFY `iFolio` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `talleres`
--
ALTER TABLE `talleres`
  MODIFY `id_taller` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `tipoactividad`
--
ALTER TABLE `tipoactividad`
  MODIFY `id_tipoactividad` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `tipousuario`
--
ALTER TABLE `tipousuario`
  MODIFY `id_tipo` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `titulos`
--
ALTER TABLE `titulos`
  MODIFY `id_titulo` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
