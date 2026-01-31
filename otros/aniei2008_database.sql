-- phpMyAdmin SQL Dump
-- version 2.11.4
-- http://www.phpmyadmin.net
--
-- Servidor: localhost
-- Tiempo de generación: 22-09-2008 a las 23:48:11
-- Versión del servidor: 5.0.51
-- Versión de PHP: 5.2.5

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Base de datos: `aniei2007`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `accesos`
--

DROP TABLE IF EXISTS `accesos`;
CREATE TABLE IF NOT EXISTS `accesos` (
  `id_acceso` tinyint(3) unsigned NOT NULL auto_increment,
  `username` varchar(30) collate latin1_general_ci NOT NULL default '',
  `contrasena` varchar(50) collate latin1_general_ci NOT NULL,
  `tipo` tinyint(3) unsigned NOT NULL default '0',
  PRIMARY KEY  (`id_acceso`,`username`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=14 ;

--
-- Volcar la base de datos para la tabla `accesos`
--

INSERT INTO `accesos` (`id_acceso`, `username`, `contrasena`, `tipo`) VALUES
(1, 'root', 'aniei6', 1),
(2, 'admin', 'aniei2007', 1),
(3, 'user', 'user', 1),
(4, 'asistente', 'asistencia', 1),
(5, 'lector', 'pulsera', 0),
(6, 'A00032', 'c384362b216404fd9300accd3632f2', 0),
(7, 'A00033', 'd45601b70de87949b34e62f5501e6c', 0),
(8, 'A00034', 'c84f65bc05fcf03718cf857a964971', 0),
(9, 'A00000', 'bc1d8b42db038ec0dec35de64d8e0e', 0),
(10, 'A00035', 'f9a71225b1ccfe73b8a69a1984e851', 0),
(11, 'A00036', '5334e2c178201056560680c33549f3', 0),
(12, 'A00037', 'b9251a51c0a6b3a7d371a9da7eb27b67', 0),
(13, 'A00038', '01066772304f9e917453a23ac14c7df5', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividades`
--

DROP TABLE IF EXISTS `actividades`;
CREATE TABLE IF NOT EXISTS `actividades` (
  `id_actividad` tinyint(3) unsigned NOT NULL auto_increment,
  `nombre` varchar(200) collate latin1_general_ci NOT NULL default '',
  `id_tipoactividad` tinyint(3) unsigned NOT NULL default '0',
  `id_ponente` int(10) unsigned NOT NULL,
  `id_ponente2` int(10) unsigned NOT NULL,
  `id_ponente3` int(10) unsigned NOT NULL,
  `cupo` tinyint(3) unsigned NOT NULL default '0',
  `hora_inicio` datetime NOT NULL,
  `hora_final` datetime NOT NULL,
  `institucion` varchar(50) collate latin1_general_ci NOT NULL default '',
  `id_sala` tinyint(3) unsigned NOT NULL default '0',
  `id_fechaevento` tinyint(3) unsigned NOT NULL default '0',
  PRIMARY KEY  (`id_actividad`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=229 ;

--
-- Volcar la base de datos para la tabla `actividades`
--

INSERT INTO `actividades` (`id_actividad`, `nombre`, `id_tipoactividad`, `id_ponente`, `id_ponente2`, `id_ponente3`, `cupo`, `hora_inicio`, `hora_final`, `institucion`, `id_sala`, `id_fechaevento`) VALUES
(128, 'Taller de PHP', 2, 9, 0, 0, 10, '2007-10-24 00:00:00', '2007-10-24 00:00:00', 'Universidad Autónma de Yucatán', 1, 1),
(129, 'Next Generation e-learning and Collaboration', 2, 4, 0, 0, 40, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(130, 'Análisis y Simulación de Sistemas con MathLab', 2, 2, 0, 0, 40, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(131, 'Desarrollo de habilidades para el emprendimiento en tecnologia', 3, 10, 0, 0, 100, '2007-10-24 00:00:00', '2007-10-24 00:00:00', 'Universidad de Berkeley', 1, 1),
(132, 'Sistemas abiertos', 0, 31, 30, 29, 100, '2008-10-01 00:00:00', '2008-10-01 00:00:00', 'Sun Mycrosistems', 1, 1),
(133, 'neumatica aplicada', 1, 4, 0, 0, 15, '2007-10-24 00:00:00', '2007-10-24 00:00:00', 'Universidad Autónoma de Chihuahua', 1, 1),
(134, 'neumatica aplicada', 1, 9, 0, 0, 15, '2007-10-24 00:00:00', '2007-10-24 00:00:00', 'Universidad Autónoma de Chihuahua', 1, 1),
(135, '¿Ya me gradué, y ahora?', 2, 1, 0, 0, 40, '2007-10-24 00:00:00', '2007-10-24 00:00:00', 'Universidad Iberoamericana', 1, 1),
(136, 'Eficiente Scalable Algorithms for Large Scale ', 3, 4, 0, 0, 100, '2007-10-24 00:00:00', '2007-10-24 00:00:00', 'Universidad de Reading, Inglaterra', 1, 1),
(137, 'Utilización Del Brazo Robot Motoman', 1, 6, 0, 0, 12, '2007-10-25 00:00:00', '2007-10-25 00:00:00', 'Universidad Autónoma de Chihuahua', 1, 2),
(138, 'Web 2.0', 2, 8, 0, 0, 40, '2007-10-25 00:00:00', '2007-10-25 00:00:00', 'ITESM Campus Monterrey', 1, 2),
(139, 'Proyectos y Tecnologías para el Estudiante', 3, 3, 0, 0, 100, '2007-10-25 00:00:00', '2007-10-25 00:00:00', 'Microsoft Latinoamérica', 1, 2),
(140, 'Software Engineering', 3, 9, 0, 0, 100, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(141, 'Programacio de Robots Lego', 1, 6, 0, 0, 20, '2007-10-25 00:00:00', '2007-10-25 00:00:00', 'Universidad Autónoma de Chihuahua', 1, 2),
(142, 'Introducción al control visual de robots', 2, 2, 0, 0, 40, '2007-10-25 00:00:00', '2007-10-25 00:00:00', 'CUCEI Universidad de Guadalajara', 1, 2),
(143, 'La Competitividad en la Industria de TI', 3, 3, 0, 0, 100, '2007-10-25 00:00:00', '2007-10-25 00:00:00', 'Secretaría de Economía', 1, 2),
(144, 'Configuración y uso de Routers CISCO', 1, 1, 0, 0, 24, '2007-10-24 00:00:00', '2007-10-24 00:00:00', 'Universidad Autónoma de Chihuahua', 1, 1),
(145, 'Information Security', 3, 5, 0, 0, 100, '2007-10-25 00:00:00', '2007-10-25 00:00:00', 'New Mexico Tech', 1, 2),
(146, 'Practicas de LabView', 1, 2, 0, 0, 19, '2007-10-24 00:00:00', '2007-10-24 00:00:00', 'Universidad Autónoma de Chihuahua', 1, 1),
(147, 'El Quehacer del Congreso de la Unión', 3, 3, 0, 0, 100, '2007-10-26 00:00:00', '2007-10-26 00:00:00', 'Cámara  de Diputados', 1, 3),
(148, 'Cómo posicionar al mercado de TI mexicano en el  mundo ', 9, 9, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 0, 2),
(149, 'Estrategias y estándares necesarios para', 3, 9, 0, 0, 100, '2007-10-26 00:00:00', '2007-10-26 00:00:00', 'AMECE', 1, 3),
(150, 'Capacidades en el Proceso de Desarrollo de Software', 11, 5, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', 'Gerente de la Unidad de Verificación Moprosoft NYC', 1, 1),
(151, 'Instalación y Configuracion de un PBX con Asterisk', 1, 9, 0, 0, 19, '2007-10-24 00:00:00', '2007-10-24 00:00:00', 'Universidad Veracruzana', 1, 1),
(152, 'La evolución de la investigación y el tic en norte america', 3, 8, 0, 0, 100, '2007-10-26 00:00:00', '2007-10-26 00:00:00', 'Universidad del Paso Texas', 1, 3),
(153, 'Como posicionar al mercado de TI mexicano en el mundo ', 9, 5, 0, 0, 1, '2007-10-26 00:00:00', '2007-10-26 00:00:00', '', 0, 3),
(154, 'Panorama general de la Industria del Software', 11, 1, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', 'LDI', 1, 1),
(155, 'La aplicación de TI para eficientar el catastro', 3, 10, 0, 0, 100, '2007-10-26 00:00:00', '2007-10-26 00:00:00', 'Gobierno del Estado de Chihuahua', 1, 3),
(156, 'Objetivos de Aprendizaje', 1, 5, 0, 0, 19, '2007-10-25 00:00:00', '2007-10-25 00:00:00', 'Universidad Autónoma de Aguascalientes', 1, 2),
(157, 'UML', 1, 7, 0, 0, 19, '2007-10-24 00:00:00', '2007-10-24 00:00:00', 'Benemérita Universidad Autonoma de Puebla', 1, 1),
(158, 'Innovacion Tecnologica: Construyendo el Futuro', 11, 9, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', 'Microsoft', 1, 1),
(159, 'ANADIC una propuesta de valor', 11, 5, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', 'ANADIC', 1, 1),
(160, 'SQL Server 2005', 1, 7, 0, 0, 19, '2007-10-25 00:00:00', '2007-10-25 00:00:00', 'Universidad de Guadalajara', 1, 2),
(161, 'Programación de Aplicaciones Distribuidas con Java (RMI)', 1, 1, 0, 0, 20, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(162, 'Las Nuevas Tecnologias Multi-Core y el Impacto de la Industria del Software', 11, 5, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', 'Intel Guadalajara', 1, 2),
(163, 'Solución Integral de Control EScolar y Administrativo', 11, 2, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', 'Carol Technologies', 1, 2),
(164, 'Visión de SUN en la Educación', 11, 3, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', 'SUN', 1, 2),
(165, 'Certificación de Centros de Cómputo', 11, 4, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', 'ICREA', 1, 2),
(166, 'Diseño Web, La Moderna Cara de la Publicidad', 10, 3, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(167, 'On the Provision of Support for Continuous Assessment in an Augmented Classroom', 8, 2, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(168, 'Detector de coordenadas de impacto de un rayo láser.', 8, 2, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(169, 'Modelo de proceso incremental para la evolucion del estudiante formado en el modelo centrado en el aprendizaje', 4, 2, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(170, 'Diseño y Construcción de un Podómetro de principio capacitivo basado en un Microcontrolador', 8, 7, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(171, 'Combining two communication models to improve a Nanorobots Navigation in a Complex Environment', 8, 9, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(172, 'Diseño de una arquitectura de informacion basada en normas para el intercambio de datos en empresas extendidas.', 4, 5, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(173, 'Optimización de procesos en aplicaciones de Software Libre para Infraestructuras de Claves Públicas', 8, 5, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(174, 'Implementación de un protocolo de seguridad WPA2 con método de autenticación PEAP para mantener una WLAN con alta seguridad y confiabilidad en la UACSyT', 8, 10, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(175, 'Tecnica de temporizacion para encriptacion de paginas de memoria en microprocesadores seguros.', 4, 5, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(176, 'Callejero de la ciudad de Tepic, Nayarit', 8, 6, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(177, 'Aplicacion Web para desarrollo de contenidos usando el paradigma de  programacion orientado a componentes para educacion basada en Web', 4, 5, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(178, 'Proceso integral del desarrollo de objetos de aprendizaje: modelo prescriptivo de preceso evolutivo', 4, 9, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(179, 'Aplicación de algoritmos de clustering desarrollados en el entorno FIR a la predicción de la concentración de ozono', 8, 8, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(180, 'Análisis de un evento de riesgo utilizando razonamiento distribuido ', 4, 3, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(181, 'Aplicaciones Web Multilingües - Caso de estudio OPENCONF', 8, 2, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(182, 'Density By Objective: Una alternativa en la asignación de densidad para algoritmos evolutivos multi-objetivo', 8, 9, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(183, 'Sistema Online de Firma Electrónica multiplataforma basado en Software Libre', 8, 9, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(184, 'zero detected flags: Una tecnica para reducir el consumo de energia en el banco de registros', 4, 8, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(185, 'E-learning de sistemas operativos', 4, 4, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(186, 'Herramienta Educativa Basada en Componentes para Manipular Material Didáctico-Digital', 8, 6, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(187, 'Proyecciones multidimensionales', 8, 10, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(188, 'Modelado y prediccion de la concentracion de ozono con la metodologia de razonamiento inductivo difuso', 4, 9, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(189, 'Polinomios interpolantes para el análisis de ECG', 8, 5, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(190, 'InAge: Una herramienta para el desarrollo y simulacion ', 4, 7, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(191, 'Diseño de un marcapasos externo a demanda basado en el dsPIC30F4013', 8, 10, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(193, 'Diseño de un oximetro portatil controlado por un pda, que se implementera en la unidad de reanimacion del servicio de urgencias del hospital de traumatologia magdalena de las salinas', 8, 9, 0, 0, 100, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(194, 'Construcción de un data Warehouse', 8, 6, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(195, 'Experiencias en la implementacion de la RTSJ sobre un sistema operativo de tiempo real para sistemas empotrados', 4, 1, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(196, 'Base de Datos Natural BDN', 8, 9, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(197, 'propuesta computacional para el desarrollo de un sistema de monitoreo implementado via web a traves del empleo de software libre', 8, 3, 0, 0, 100, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(198, 'Metodología basada en secuencias para la clasificación de relojes digitales empleando memorias asociativas', 8, 9, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(199, 'Usos de modelos computacionales de optimizacion aplicados a la industria manofacturera', 4, 4, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(200, 'Speech Recognition and Synthesis for information in airlines flights', 8, 2, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(202, 'Ejemplificacion de M-Learning : Diseño e implementacion de un videojuego 3D educativo ', 4, 8, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(203, 'Determination of power spectrum density  Welch?s  algorithm  based in a  digital signal processor 2', 8, 3, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(204, 'Desarrollo de un simulador para el entrenamiento de un robot virtual y construcción de grafos en el modelo GT', 8, 3, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(205, 'la importancia de la ingenieria del software en el desarrollo del software educativo', 8, 4, 0, 0, 100, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(206, 'Herramienta en linea para la evaluacion de plataformas E-Learning', 4, 1, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 0, 2),
(207, 'El Aula Multimedia de la  UAM-Xochimilco: Espacio de difusión de cultura digital universitaria', 8, 5, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(208, 'aplicacion de una metodologia ligera en la elaboracion de objetos de aprendizaje', 8, 3, 0, 0, 100, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(209, 'Avances en el Diseño de una Interfaz para Controlar un Robot Móvil empleando Telepresencia vía Internet', 8, 7, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(210, 'analisis de recibos telefonicos mediante la construccion de una bodega de datos', 8, 8, 0, 0, 100, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(211, 'Ambiente de aprendizaje e-training para capacitacion de profesionales informaticos en competencias de lectura en ingles', 3, 6, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(212, 'Metodología y Software para Evaluar Técnicamente Calidad de Productos de Software para Ambientes Visuales. Casos de Estudio: Visual Studio.Net, Eclipse y Netbeans.', 8, 10, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(213, 'sistema por vision maquina para el control de una silla de ruedas operada por reconocimiento de imagenes de instrucciones gestuales', 8, 9, 0, 0, 100, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(214, 'Modelo conceptual de un sistema de filtrado de información para apoyar a una comunidad Universitaria', 8, 5, 0, 0, 1, '2007-10-24 00:00:00', '2007-10-24 00:00:00', '', 1, 1),
(215, 'Verificacion de metadatos en base a IMS Global Learning Consortium y SCORM para objetos de aprendizaje', 4, 9, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 0, 2),
(216, 'Masa critica de profesionistas y sus repercursion en los principales polos de la industria mexicana de software', 4, 10, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(217, 'Sistemas Curricular Catedraticos de la Facultad de Ingenieria UACH', 4, 1, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(218, 'El uso de los algoritmos genericos parla optimizacion de un proceso: Planificacion de un horario escolar ', 4, 5, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(219, 'Optimizacion  mediante Colonias de Hormigas ', 4, 3, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(220, 'Software educativo FIBAS para apoyar el proceso Enseñanza-Aprendizaje en la Facultad De Ingenieria UACH', 4, 9, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(221, 'Una aproximacion a la programacion orientada a Aspectos ', 4, 8, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 0, 2),
(222, 'Modelado de los servicios Diferenciales e Integrales y aplicacion en GNU/Linux ', 4, 3, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(223, 'ITIL- Great Solutioins For Small and Medium Enterprises', 4, 8, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 0, 2),
(224, 'Lenguajes de Programacion Minimalista Orientado a Roles y E ventos ', 4, 5, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(225, 'Quizzes y Viewlest pbjetos de aprendizaje integrables a Moodle', 4, 8, 0, 0, 1, '2007-10-25 00:00:00', '2007-10-25 00:00:00', '', 1, 2),
(226, 'actividad de prueba', 5, 6, 0, 0, 50, '2008-10-02 00:00:00', '2008-10-02 00:00:00', 'Facultad de Matemáticas', 1, 2),
(228, 'actividad de prueba dmeo', 5, 7, 0, 0, 50, '2008-10-02 00:00:00', '2008-10-02 00:00:00', 'Facultad de Matemáticas', 1, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cargos`
--

DROP TABLE IF EXISTS `cargos`;
CREATE TABLE IF NOT EXISTS `cargos` (
  `id_cargo` tinyint(3) unsigned NOT NULL auto_increment,
  `descripcion` varchar(20) collate latin1_general_ci NOT NULL default '',
  PRIMARY KEY  (`id_cargo`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=7 ;

--
-- Volcar la base de datos para la tabla `cargos`
--

INSERT INTO `cargos` (`id_cargo`, `descripcion`) VALUES
(1, 'Alumno'),
(2, 'Profesor'),
(3, 'Secretario'),
(4, 'Jefe de departamento'),
(5, 'Director'),
(6, 'Otro');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `costos`
--

DROP TABLE IF EXISTS `costos`;
CREATE TABLE IF NOT EXISTS `costos` (
  `id_costo` tinyint(3) unsigned NOT NULL auto_increment,
  `id_tipousuario` tinyint(3) unsigned NOT NULL,
  `costo` float unsigned NOT NULL default '0',
  PRIMARY KEY  (`id_costo`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=17 ;

--
-- Volcar la base de datos para la tabla `costos`
--

INSERT INTO `costos` (`id_costo`, `id_tipousuario`, `costo`) VALUES
(1, 1, 800),
(2, 1, 825),
(3, 1, 850),
(4, 1, 900),
(5, 2, 1000),
(6, 2, 1025),
(7, 2, 1050),
(8, 2, 1100),
(9, 5, 1650),
(10, 5, 1700),
(11, 5, 1750),
(12, 5, 1850),
(13, 0, 775),
(14, 0, 800),
(15, 0, 825),
(16, 0, 850);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `depositos`
--

DROP TABLE IF EXISTS `depositos`;
CREATE TABLE IF NOT EXISTS `depositos` (
  `id_deposito` int(10) unsigned NOT NULL auto_increment,
  `id_usuario` int(10) unsigned NOT NULL,
  `ciudad` varchar(30) collate latin1_general_ci NOT NULL default '',
  `sucursal` varchar(30) collate latin1_general_ci NOT NULL default '',
  `fecha` date NOT NULL default '0000-00-00',
  `hora` time NOT NULL default '00:00:00',
  `referencia` varchar(10) collate latin1_general_ci NOT NULL default '',
  `monto` float unsigned NOT NULL default '0',
  PRIMARY KEY  (`id_deposito`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=10 ;

--
-- Volcar la base de datos para la tabla `depositos`
--

INSERT INTO `depositos` (`id_deposito`, `id_usuario`, `ciudad`, `sucursal`, `fecha`, `hora`, `referencia`, `monto`) VALUES
(1, 1, 'Mérida', '2374', '2008-08-11', '17:00:00', '720', 2000),
(2, 31, 'México DF', '3653', '2008-08-16', '10:00:00', '456', 1300),
(3, 32, 'Mérida', '2374', '2008-09-20', '17:00:00', '720', 1000),
(4, 33, 'Mérida', '2374', '2008-09-20', '17:00:00', '720', 1000),
(5, 34, 'Mérida', '2374', '2008-09-20', '17:00:00', '720', 1000),
(6, 0, 'México DF', '3653', '2008-09-21', '15:30:00', '456', 1200),
(7, 35, 'México DF', '2374', '2008-09-21', '10:00:00', '456', 1950),
(8, 36, 'Mérida', '3653', '2008-09-21', '10:00:00', '456', 1200),
(9, 38, 'Mérida', '2374', '2008-10-21', '10:00:00', '456', 950);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados`
--

DROP TABLE IF EXISTS `estados`;
CREATE TABLE IF NOT EXISTS `estados` (
  `id_entidadfederativa` tinyint(3) unsigned NOT NULL auto_increment,
  `nombre` varchar(21) collate latin1_general_ci NOT NULL default '',
  PRIMARY KEY  (`id_entidadfederativa`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=36 ;

--
-- Volcar la base de datos para la tabla `estados`
--

INSERT INTO `estados` (`id_entidadfederativa`, `nombre`) VALUES
(1, 'Aguascalientes'),
(2, 'Baja California Norte'),
(3, 'Baja California Sur'),
(4, 'Campeche'),
(5, 'Chiapas'),
(6, 'Chihuahua'),
(7, 'Coahuila'),
(8, 'Colima'),
(9, 'Distrito Federal'),
(10, 'Durango'),
(11, 'Estado de México'),
(12, 'Guanajuato'),
(13, 'Guerrero'),
(14, 'Hidalgo'),
(15, 'Jalisco'),
(16, 'Michoacán'),
(17, 'Morelos'),
(18, 'Nayarit'),
(19, 'Nuevo León'),
(20, 'Oaxaca'),
(21, 'Puebla'),
(22, 'Querétaro'),
(23, 'Quintana Roo'),
(24, 'San Luis Potosí'),
(25, 'Sinaloa'),
(26, 'Sonora'),
(27, 'Tabasco'),
(28, 'Tamaulipas'),
(29, 'Tlaxcala'),
(30, 'Veracruz'),
(31, 'Yucatán'),
(32, 'Zacatecas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturaciones`
--

DROP TABLE IF EXISTS `facturaciones`;
CREATE TABLE IF NOT EXISTS `facturaciones` (
  `id_facturacion` int(10) unsigned NOT NULL auto_increment,
  `id_usuario` int(10) unsigned NOT NULL,
  `razon` varchar(50) collate latin1_general_ci NOT NULL,
  `rfc` varchar(30) collate latin1_general_ci NOT NULL,
  `calle` varchar(50) collate latin1_general_ci NOT NULL,
  `exterior` varchar(10) collate latin1_general_ci NOT NULL,
  `interior` varchar(10) collate latin1_general_ci NOT NULL,
  `colonia` varchar(50) collate latin1_general_ci NOT NULL,
  `municipio` varchar(30) collate latin1_general_ci NOT NULL,
  `id_entidadfederativaRFC` tinyint(3) unsigned NOT NULL,
  `codigo_postal` varchar(10) collate latin1_general_ci NOT NULL,
  PRIMARY KEY  (`id_facturacion`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=12 ;

--
-- Volcar la base de datos para la tabla `facturaciones`
--

INSERT INTO `facturaciones` (`id_facturacion`, `id_usuario`, `razon`, `rfc`, `calle`, `exterior`, `interior`, `colonia`, `municipio`, `id_entidadfederativaRFC`, `codigo_postal`) VALUES
(7, 1, 'Rodrigo Alejandro Sevilla Blanco', 'SEBR830525TD3', '31D por 22 y 24', '266', '', 'Miguel Alemán', 'Mérida', 31, '97148'),
(8, 31, 'Congreso ANIEI', 'SEBR830525TD3', '31D por 22 y 24', '266', '', 'Miguel Alemán', 'Mérida', 31, '97148'),
(9, 32, '', 'SEBR830525TD3', '', '', '', '', '', 0, ''),
(10, 33, '', 'SEBR830525TD3', '', '', '', '', '', 0, ''),
(11, 34, '', 'SEBR830525TD3', '', '', '', '', '', 0, '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fecha_eventos`
--

DROP TABLE IF EXISTS `fecha_eventos`;
CREATE TABLE IF NOT EXISTS `fecha_eventos` (
  `id_fechaevento` tinyint(3) unsigned NOT NULL auto_increment,
  `fecha` date NOT NULL default '0000-00-00',
  PRIMARY KEY  (`id_fechaevento`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=4 ;

--
-- Volcar la base de datos para la tabla `fecha_eventos`
--

INSERT INTO `fecha_eventos` (`id_fechaevento`, `fecha`) VALUES
(1, '2008-10-01'),
(2, '2008-10-02'),
(3, '2008-10-03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inscripciones`
--

DROP TABLE IF EXISTS `inscripciones`;
CREATE TABLE IF NOT EXISTS `inscripciones` (
  `id_inscripcion` tinyint(3) unsigned NOT NULL auto_increment,
  `id_actividad` tinyint(3) unsigned NOT NULL default '0',
  `id_usuario` int(10) unsigned NOT NULL,
  PRIMARY KEY  (`id_inscripcion`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=12 ;

--
-- Volcar la base de datos para la tabla `inscripciones`
--

INSERT INTO `inscripciones` (`id_inscripcion`, `id_actividad`, `id_usuario`) VALUES
(1, 150, 12),
(2, 134, 32),
(3, 130, 32),
(4, 134, 33),
(5, 130, 33),
(6, 134, 34),
(7, 130, 34),
(8, 141, 0),
(11, 133, 38),
(10, 156, 36);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `instituciones`
--

DROP TABLE IF EXISTS `instituciones`;
CREATE TABLE IF NOT EXISTS `instituciones` (
  `id_institucion` tinyint(3) unsigned NOT NULL auto_increment,
  `nombre` varchar(100) collate latin1_general_ci NOT NULL default '',
  PRIMARY KEY  (`id_institucion`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=133 ;

--
-- Volcar la base de datos para la tabla `instituciones`
--

INSERT INTO `instituciones` (`id_institucion`, `nombre`) VALUES
(1, 'BENEMÉRITA UNIVERSIDAD AUTÓNOMA DE PUEBLA'),
(2, 'CENTRO DE ESTUDIO DE ALTA DIRECCION'),
(3, 'CENTRO DE ESTUDIOS BÁSICOS Y SUPERIORES DEL SURESTE S.C.'),
(4, 'CENTRO DE ESTUDIOS CIENTÍFICOS Y TECNOLÓGICOS 14 LUÍS ENRIQUE ERRO SOLER'),
(5, 'CENTRO DE ESTUDIOS CIENTÍFICOS Y TECNOLÓGICOS 9 JUAN DE DIOS BATÍZ SEP'),
(6, 'CENTRO DE ESTUDIOS SUPERIORES DEL ESTADO DE SONORA (CESUES)'),
(7, 'CENTRO DE INVESTIGACIÓN EN COMPUTACIÓN IPN CIC'),
(8, 'CENTRO UNIVERSITARIO HISPANOAMERICANO S.C. UNIVERSIDAD HISPANOAMERICANA'),
(9, 'COLEGIO DE EDUCACIÓN PROFESIONAL TÉCNICA DEL ESTADO DE GUANAJUATO'),
(10, 'COLEGIO DE EDUCACION PROFESIONAL TECNICA DEL ESTADO DE SAN LUIS POTOSI'),
(11, 'COLEGIO NACIONAL DE EDUCACIÓN PROFESIONAL TÉCNICA DEL ESTADO DE JALISCO'),
(12, 'COLEGIO NACIONAL DE EDUCACIÓN PROFESIONAL TÉCNICA DEL ESTADO DE MÉXICO'),
(13, 'COLEGIO NACIONAL DE EDUCACIÓN PROFESIONAL TÉCNICA TLALPAN 1'),
(14, 'CONJUNTO EDUCATIVO S.C.'),
(15, 'DIRECCIÓN GENERAL DE EDUCACIÓN TECNOLÓGICA INDUSTRIAL'),
(16, 'ESCUELA NORMAL RURAL JUSTO SIERRA MENDEZ (SECRETARIA DE EDUCACIÓN CULTURA Y DEPORTE)'),
(17, 'ESCUELA SUPERIOR DE COMPUTO IPN ESCOM'),
(18, 'FUNDACIÓN ARTURO ROSENBLUETH'),
(19, 'INSTITUTO DE CIENCIAS Y ESTUDIOS SUPERIORES DE TAMAULIPAS, A.C. (ICEST)'),
(20, 'INSTITUTO DE ESTUDIOS SUPERIORES DE MONTERREY CAMPUS QUERETARO'),
(21, 'INSTITUTO DE ESTUDIOS SUPERIORES DE TAMAULIPAS, A.C. (IEST)'),
(22, 'INSTITUTO EDUCATIVO DEL NORESTE A.C.(CETYS MEXICALI)'),
(23, 'INSTITUTO GALILEO DE COATZACOALCOS CEUNICO'),
(24, 'INSTITUTO NACIONAL DE ASTROFÍSICA, ÓPTICA Y ELECTRÓNICA (INAOE)'),
(25, 'INSTITUTO POLITÉCNICO NACIONAL (UPIICSA)'),
(26, 'INSTITUTO TECNOLÓGICO AUTÓNOMO DE MÉXICO (ITAM)'),
(27, 'INSTITUTO TECNOLOGICO DE CANCUN'),
(28, 'INSTITUTO TECNOLÓGICO DE CERRO AZUL'),
(29, 'INSTITUTO TECNOLÓGICO DE CHETUMAL, SEP (ITCHETUMAL)'),
(30, 'INSTITUTO TECNOLÓGICO DE CHIHUAHUA II'),
(31, 'INSTITUTO TECNOLÓGICO DE CIUDAD GUZMÁN (ITCDGUZMAN)'),
(32, 'INSTITUTO TECNOLÓGICO DE COATZACOALCOS'),
(33, 'INSTITUTO TECNOLÓGICO DE COMITÁN, SEP (ITCOMITAN)'),
(34, 'INSTITUTO TECNOLÓGICO DE ESTUDIOS SUPERIORES DE ZAMORA (TECZAMORA)'),
(35, 'INSTITUTO TECNOLÓGICO DE LA LAGUNA (ITLALAGUNA)'),
(36, 'INSTITUTO TECNOLÓGICO DE LEÓN, SEP (ITLEON)'),
(37, 'INSTITUTO TECNOLÓGICO DE LOS MOCHIS, SEP (ITMOCHIS)'),
(38, 'INSTITUTO TECNOLÓGICO DE MATAMOROS (ITMATAMOROS)'),
(39, 'INSTITUTO TECNOLÓGICO DE MÉRIDA (ITMERIDA)'),
(40, 'INSTITUTO TECNOLÓGICO DE MORELIA'),
(41, 'INSTITUTO TECNOLÓGICO DE PUEBLA (ITPUEBLA)'),
(42, 'INSTITUTO TECNOLÓGICO DE PURTO VALLARTA'),
(43, 'INSTITUTO TECNOLÓGICO DE QUERÉTARO (ITQ)'),
(44, 'INSTITUTO TECNOLÓGICO DE TEPIC, SEP (ITTEPIC)'),
(45, 'INSTITUTO TECNOLÓGICO DE TLALNEPANTLA, SEP (ITTLA)'),
(46, 'INSTITUTO TECNOLÓGICO DE ZITACUARO, SEP (ITZIT)'),
(47, 'INSTITUTO TECNOLÓGICO SUPERIOR DE ACATLAN DE OSORIO (ITSAO)'),
(48, 'INSTITUTO TECNOLÓGICO SUPERIOR DE ATLIXCO (ITSATLIXCO)'),
(49, 'INSTITUTO TECNOLÓGICO SUPERIOR DE IRAPUATO (ITESI)'),
(50, 'INSTITUTO TECNOLOGICO SUPERIOR DE PUERTO VALLARTA'),
(51, 'INSTITUTO TECNOLÓGICO SUPERIOR ZACATECAS NORTE (ITSZN)'),
(52, 'INSTITUTO TECNOLÓGICO Y DE ESTUDIOS SUPERIORES DE MONTERREY (C QRO)'),
(53, 'INSTITUTO TECNOLÓGICO Y DE ESTUDIOS SUPERIORES DE MONTERREY CEM'),
(54, 'INSTITUTO TECNOLÓGICO Y DE ESTUDIOS SUPERIORES DE MONTERREY CM'),
(55, 'INSTITUTO TECNOLÓGICO Y DE ESTUDIOS SUPERIORES DE MONTERREY CQ'),
(56, 'INSTITUTO TECNOLÓGICO Y DE ESTUDIOS SUPERIORES DE OCCIDENTE (ITESO)'),
(57, 'INSTITUTO UNIVERSITARIO DEL ESTADO DE MÉXICO S.C. (IUEM)'),
(58, 'LATINOAMERICANA DE CIENCIAS Y TECNOLOGÍA A.C. (ITLA) INST.TEC.LATINOAMERICANO'),
(59, 'PATRONATO PRO-CONSTRUCCIÓN ESCUELA DE BACHILLERES Y UNIVERSIDAD DEL GOLFO DE MÉXICO A.C.'),
(60, 'SECRETARIA DE EDUCACIÓN CULTURA Y DEPORTE (Esc. Normal Rural Justo Sierra M?ndez)'),
(61, 'SUN MICROSYSTEMS DE MÉXICO S.A. DE C.V.'),
(62, 'TECNOLÓGICO DE ESTUDIOS SUPERIORES DE CUAUTITLAN IZCALLI (TESCI)'),
(63, 'TECNOLÓGICO DE ESTUDIOS SUPERIORES DE ECATEPEC (TESE)'),
(64, 'UNIVERSIDAD AMERICANA DE ACAPULCO'),
(65, 'UNIVERSIDAD AUTÓNOMA DE AGUASCALIENTES (UAA)'),
(66, 'UNIVERSIDAD AUTÓNOMA DE BAJA CALIFORNIA (UABC)'),
(67, 'UNIVERSIDAD AUTÓNOMA DE CHIAPAS (UNACH)'),
(68, 'UNIVERSIDAD AUTÓNOMA DE CHIHUAHUA (UACH)'),
(69, 'UNIVERSIDAD AUTÓNOMA DE CIUDAD JUÁREZ (UACJ)'),
(70, 'UNIVERSIDAD AUTÓNOMA DE COAHUILA (UAC)'),
(71, 'UNIVERSIDAD AUTÓNOMA DE GUADALAJAR (UAG) CAMPUS TABASCO'),
(72, 'UNIVERSIDAD AUTONOMA DE GUADALAJARA ( CAMPUS TABASCO)'),
(73, 'UNIVERSIDAD AUTÓNOMA DE LA LAGUNA, A.C. (UAL)'),
(74, 'UNIVERSIDAD AUTÓNOMA DE NAYARIT (UAN)'),
(75, 'UNIVERSIDAD AUTÓNOMA DE NUEVO LEÓN FCFM'),
(76, 'UNIVERSIDAD AUTÓNOMA DE NUEVO LEÓN FIME'),
(77, 'UNIVERSIDAD AUTÓNOMA DE QUERÉTARO (UAQ)'),
(78, 'UNIVERSIDAD AUTÓNOMA DE SINALOA (UAS)'),
(79, 'UNIVERSIDAD AUTÓNOMA DE TAMAULIPAS ( FACULTAD DE COMERCIO Y ADMINISTRACION Y CIENCIAS SOCIALES DE NU'),
(80, 'UNIVERSIDAD AUTÓNOMA DE TAMAULIPAS (CAMPUS MATAMOROS)'),
(81, 'UNIVERSIDAD AUTÓNOMA DE TAMAULIPAS (CAMPUS NUEVO LAREDO)'),
(82, 'UNIVERSIDAD AUTÓNOMA DE TAMAULIPAS (UAT) CAMPUS MATAMOROS'),
(83, 'UNIVERSIDAD AUTÓNOMA DE TAMAULIPAS (UAT) CAMPUS NUEVO LAREDO'),
(84, 'UNIVERSIDAD AUTÓNOMA DE TAMAULIPAS( UNIDAD ACADEMICA DE CIENCIAS DE LA SALUD Y TECNOLOGIA MATAMOROS)'),
(85, 'UNIVERSIDAD AUTÓNOMA DE YUCATÁN (UADY)'),
(86, 'UNIVERSIDAD AUTÓNOMA DEL ESTADO DE MÉXICO (UAEM)'),
(87, 'UNIVERSIDAD AUTÓNOMA DEL NORESTE A.C. (UANE)'),
(88, 'UNIVERSIDAD AUTÓNOMA METROPOLITANA (UAM)'),
(89, 'UNIVERSIDAD DE COLIMA FACULTAD DE CONTABILIDAD Y ADMÓN. DE MANZANILLO'),
(90, 'UNIVERSIDAD DE COLIMA FACULTAD DE TELEMÁTICA'),
(91, 'UNIVERSIDAD DE CUAUTITLÁN IZCALLI (UDECI)'),
(92, 'UNIVERSIDAD DE GUADALAJARA CUCIENEGA'),
(93, 'UNIVERSIDAD DE GUADALAJARA CUSEI'),
(94, 'UNIVERSIDAD DE GUADALAJARA CUSUR'),
(95, 'UNIVERSIDAD DE MONTEMORELOS, A.C.'),
(96, 'UNIVERSIDAD DE MONTERREY (UDEM)'),
(97, 'UNIVERSIDAD DE MORELIA'),
(98, 'UNIVERSIDAD DE SOTAVENTO A.C. (UNISOTAVENTO)'),
(99, 'UNIVERSIDAD DEL CARIBE'),
(100, 'UNIVERSIDAD DEL MAYAB (UNIMAYAB)'),
(101, 'UNIVERSIDAD DEL VALLE DE MÉXICO A.C.'),
(102, 'UNIVERSIDAD EMILIO CÁRDENAS S.C. (UDEC)'),
(103, 'UNIVERSIDAD IBEROAMERICANA A.C. CAMPUS CD DE MÉXICO'),
(104, 'UNIVERSIDAD IBEROAMERICANA CAMPUS PUEBLA, COMUNIDAD UNIVERSITARIA DEL GOLFO CENTRO, A.C.'),
(105, 'UNIVERSIDAD INSURGENTES, S.C. PLANTEL SUR '),
(106, 'UNIVERSIDAD INTERCONTINENTAL (UIC) INSTITUTO INTERNACIONAL DE FILOSOFÍA A.C.'),
(107, 'UNIVERSIDAD JUÁREZ AUTÓNOMA DE TABASCO (UJAT)'),
(108, 'UNIVERSIDAD LA SALLE, A.C. CD DE MÉXICO (ULSA)'),
(109, 'UNIVERSIDAD LATINA DE AMÉRICA A.C. MORELIA (UNLA)'),
(110, 'UNIVERSIDAD LOYOLA DEL PACIFICO (LOYOLA)'),
(111, 'UNIVERSIDAD MÉXICO AMERICANA DEL NORTE A.C. (UMAN)'),
(112, 'UNIVERSIDAD NACIONAL AUTÓNOMA DE MÉXICO FACULTAD DE CIENCIAS'),
(113, 'UNIVERSIDAD NACIONAL AUTÓNOMA DE MÉXICO FES ACATLAN'),
(114, 'UNIVERSIDAD NACIONAL AUTÓNOMA DE MÉXICO NEZAHUALCOYOLT FES ARAGÓN'),
(115, 'UNIVERSIDAD PABLO GUARDADO CHÁVEZ S.C. (UPGCH)'),
(116, 'UNIVERSIDAD POPULAR AUTÓNOMA DEL ESTADO DE PUEBLA A.C. (UPAEP)'),
(117, 'UNIVERSIDAD REGIOMONTANA A.C. (UR)'),
(118, 'UNIVERSIDAD REGIONAL DEL SURESTE A.C.'),
(119, 'UNIVERSIDAD SIMÓN BOLÍVAR (USB) CENTROS CULTURALES S.C.'),
(120, 'UNIVERSIDAD TECNOLÓGICA AMERICANA'),
(121, 'UNIVERSIDAD TECNOLÓGICA DE CANCéN (UTCANCUN)'),
(122, 'UNIVERSIDAD TECNOLÓGICA DE LA SIERRA HIDALGUENSE (UTSH)'),
(123, 'UNIVERSIDAD TECNOLÓGICA DE MÉXICO'),
(124, 'UNIVERSIDAD TECNOLÓGICA DE MORELIA'),
(125, 'UNIVERSIDAD TECNOLÓGICA DE NEZAHUALCOYOTL (UTN)'),
(126, 'UNIVERSIDAD TECNOLÓGICA DE PUEBLA (UTP)'),
(127, 'UNIVERSIDAD TECNOLÓGICA DEL NORTE DE GUANAJUATO (UTNG)'),
(128, 'UNIVERSIDAD TECNOLÓGICA DEL VALLE DEL MEZQUITAL'),
(129, 'UNIVERSIDAD TECNOLÓGICA FIDEL VELÁZQUEZ (UTFV)'),
(130, 'UNIVERSIDAD TECNOLÓGICA TULA-TEPEJI (UTTT)'),
(131, 'UNIVERSIDAD VALLE DEL GRIJALVA A.C. (UVG)'),
(132, 'UNIVERSIDAD VERACRUZANA (UV)');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `precios`
--

DROP TABLE IF EXISTS `precios`;
CREATE TABLE IF NOT EXISTS `precios` (
  `id_precio` tinyint(3) unsigned NOT NULL auto_increment,
  `precio` float unsigned NOT NULL,
  `fecha_limite` date NOT NULL,
  `socio` char(1) NOT NULL,
  `id_tipousuario` tinyint(4) NOT NULL,
  PRIMARY KEY  (`id_precio`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=17 ;

--
-- Volcar la base de datos para la tabla `precios`
--

INSERT INTO `precios` (`id_precio`, `precio`, `fecha_limite`, `socio`, `id_tipousuario`) VALUES
(1, 800, '2008-09-17', '1', 0),
(2, 1000, '2008-09-17', '1', 1),
(3, 1650, '2008-09-17', '1', 2),
(4, 775, '2008-09-17', '1', 3),
(5, 825, '2008-09-17', '0', 2),
(6, 1025, '2008-09-17', '0', 2),
(7, 1700, '2008-09-17', '0', 2),
(8, 800, '2008-09-17', '0', 2),
(9, 850, '2008-10-04', '1', 0),
(10, 1050, '2008-10-04', '1', 1),
(11, 1750, '2008-10-04', '1', 2),
(12, 825, '2008-10-04', '1', 3),
(13, 900, '2008-10-04', '0', 0),
(14, 1100, '2008-10-04', '0', 1),
(15, 1850, '2008-10-04', '0', 2),
(16, 850, '2008-10-04', '0', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recibos`
--

DROP TABLE IF EXISTS `recibos`;
CREATE TABLE IF NOT EXISTS `recibos` (
  `iFolio` int(10) unsigned NOT NULL auto_increment,
  `dtotal` float NOT NULL default '0',
  `id_asistente` char(15) collate latin1_general_ci NOT NULL,
  `idFolioAsistente` int(11) NOT NULL,
  `dtFecha` date NOT NULL,
  `cHora` char(8) collate latin1_general_ci NOT NULL,
  PRIMARY KEY  (`iFolio`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci PACK_KEYS=1 DELAY_KEY_WRITE=1 COMMENT='Tabla para almacenar los recibos del evento.' AUTO_INCREMENT=1 ;

--
-- Volcar la base de datos para la tabla `recibos`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `salas`
--

DROP TABLE IF EXISTS `salas`;
CREATE TABLE IF NOT EXISTS `salas` (
  `id_sala` tinyint(3) unsigned NOT NULL auto_increment,
  `nombre` varchar(100) collate latin1_general_ci NOT NULL default '',
  `ubicacion` varchar(100) collate latin1_general_ci NOT NULL default '',
  PRIMARY KEY  (`id_sala`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=2 ;

--
-- Volcar la base de datos para la tabla `salas`
--

INSERT INTO `salas` (`id_sala`, `nombre`, `ubicacion`) VALUES
(1, 'Centro de Convenciones', 'Sala General');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipoactividad`
--

DROP TABLE IF EXISTS `tipoactividad`;
CREATE TABLE IF NOT EXISTS `tipoactividad` (
  `id_tipoactividad` tinyint(3) unsigned NOT NULL auto_increment,
  `descripcion` varchar(25) collate latin1_general_ci NOT NULL default '',
  PRIMARY KEY  (`id_tipoactividad`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=12 ;

--
-- Volcar la base de datos para la tabla `tipoactividad`
--

INSERT INTO `tipoactividad` (`id_tipoactividad`, `descripcion`) VALUES
(1, 'Taller'),
(2, 'Seminario'),
(3, 'Conferencia Magistral'),
(4, 'Conferencia Simultánea'),
(5, 'Videoconferencias'),
(6, 'Mesas de Trabajo'),
(7, 'Pósters'),
(8, 'Ponencia'),
(9, 'X'),
(10, 'Tesis'),
(11, 'Conferencia Invitada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipousuario`
--

DROP TABLE IF EXISTS `tipousuario`;
CREATE TABLE IF NOT EXISTS `tipousuario` (
  `id_tipo` tinyint(3) unsigned NOT NULL auto_increment,
  `descripcion` varchar(20) collate latin1_general_ci NOT NULL default '',
  PRIMARY KEY  (`id_tipo`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=10 ;

--
-- Volcar la base de datos para la tabla `tipousuario`
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

DROP TABLE IF EXISTS `titulos`;
CREATE TABLE IF NOT EXISTS `titulos` (
  `id_titulo` tinyint(3) unsigned NOT NULL auto_increment,
  `descripcion` varchar(15) collate latin1_general_ci NOT NULL default '',
  PRIMARY KEY  (`id_titulo`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=7 ;

--
-- Volcar la base de datos para la tabla `titulos`
--

INSERT INTO `titulos` (`id_titulo`, `descripcion`) VALUES
(1, 'Bachiller'),
(2, 'Pasante'),
(3, 'Licenciatura'),
(4, 'Maestría'),
(5, 'Ingeniero'),
(6, 'Doctorado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int(10) unsigned NOT NULL auto_increment,
  `folio_recibo` varchar(6) collate latin1_general_ci NOT NULL,
  `titulo` varchar(30) collate latin1_general_ci NOT NULL,
  `nombre` varchar(50) collate latin1_general_ci NOT NULL,
  `apellido` varchar(50) collate latin1_general_ci NOT NULL,
  `id_cargo` tinyint(3) unsigned NOT NULL,
  `id_tipo` tinyint(3) unsigned NOT NULL,
  `carrera` varchar(50) collate latin1_general_ci NOT NULL,
  `id_institucion` tinyint(3) unsigned NOT NULL,
  `institucion` varchar(50) collate latin1_general_ci NOT NULL,
  `dependencia` varchar(100) collate latin1_general_ci NOT NULL,
  `id_entidadfederativa` tinyint(3) unsigned NOT NULL,
  `correo` varchar(30) collate latin1_general_ci NOT NULL,
  `lada` varchar(10) collate latin1_general_ci NOT NULL,
  `telefono` varchar(10) collate latin1_general_ci NOT NULL,
  `extension` varchar(10) collate latin1_general_ci NOT NULL,
  `codigo_barras` varchar(30) collate latin1_general_ci NOT NULL,
  `grupo_padre` int(10) unsigned NOT NULL,
  `asistio` char(1) collate latin1_general_ci NOT NULL,
  `genero` char(1) collate latin1_general_ci NOT NULL,
  `verifico` char(1) collate latin1_general_ci NOT NULL,
  `fecha_registro` datetime NOT NULL,
  `id_costo` char(1) collate latin1_general_ci NOT NULL,
  PRIMARY KEY  (`id_usuario`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=39 ;

--
-- Volcar la base de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `folio_recibo`, `titulo`, `nombre`, `apellido`, `id_cargo`, `id_tipo`, `carrera`, `id_institucion`, `institucion`, `dependencia`, `id_entidadfederativa`, `correo`, `lada`, `telefono`, `extension`, `codigo_barras`, `grupo_padre`, `asistio`, `genero`, `verifico`, `fecha_registro`, `id_costo`) VALUES
(1, 'A00001', 'LCC', 'Rodrigo Alejandro', 'Sevilla Blanco', 1, 1, 'Licenciatura en Ciencias de la Computación', 85, '', 'Facultad de Matemáticas', 31, 'rodrigosevilla2000@hotmail.com', '999', '9261291', '', '', 0, '0', 'M', '0', '0000-00-00 00:00:00', ''),
(2, 'A00002', '', 'Carlos', 'Tello Arcila', 0, 1, 'Licenciatura en Ciencias de la Computación', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 1, '0', 'M', '0', '0000-00-00 00:00:00', ''),
(3, 'A00003', '', 'Jesús', 'Loría', 0, 1, 'Licenciatura en Ciencias de la Computación', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 1, '0', 'M', '0', '0000-00-00 00:00:00', ''),
(4, 'A00004', '', 'Shender', 'Avila', 0, 1, 'Licenciatura en Ciencias de la Computación', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 1, '0', 'F', '0', '0000-00-00 00:00:00', ''),
(5, 'A00005', '', 'Maylie', 'Vázques', 0, 1, 'Licenciatura en Ciencias de la Computación', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 1, '0', 'F', '0', '0000-00-00 00:00:00', ''),
(6, 'A00006', '', 'Enriqueta', 'Bolaños', 0, 1, 'Licenciatura en Ciencias de la Computación', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 1, '0', 'F', '0', '0000-00-00 00:00:00', ''),
(7, 'A00007', 'LCC', 'Rodrigo Alejandro', 'Sevilla Blanco', 1, 0, '', 85, '', '', 31, 'rodrigosevilla2000@hotmail.com', '999', '9261291', '', '', 0, '0', 'M', '0', '0000-00-00 00:00:00', ''),
(8, 'A00008', '', '1', '2', 0, 1, '', 85, '', '', 31, '', '', '', '', '', 7, '0', '', '0', '0000-00-00 00:00:00', ''),
(9, 'A00009', '', '3', '4', 0, 1, '', 85, '', '', 31, '', '', '', '', '', 7, '0', '', '0', '0000-00-00 00:00:00', ''),
(10, 'A00010', '', '5', '6', 0, 1, '', 85, '', '', 31, '', '', '', '', '', 7, '0', '', '0', '0000-00-00 00:00:00', ''),
(11, 'A00011', '', '7', '8', 0, 1, '', 85, '', '', 31, '', '', '', '', '', 7, '0', '', '0', '0000-00-00 00:00:00', ''),
(12, 'A00012', '', '9', '10', 0, 1, '', 85, '', '', 31, '', '', '', '', '', 7, '0', '', '0', '0000-00-00 00:00:00', ''),
(13, 'A00013', 'LCC', 'Rodrigo Alejandro', 'Sevilla Blanco', 1, 0, '', 85, '', 'Facultad de Matemáticas', 31, 'rodrigosevilla2000@hotmail.com', '999', '9261291', '', '', 0, '0', 'M', '0', '0000-00-00 00:00:00', ''),
(14, 'A00014', '', '1', '2', 0, 1, '', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 13, '0', '', '0', '0000-00-00 00:00:00', ''),
(15, 'A00015', '', '3', '4', 0, 1, '', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 13, '0', '', '0', '0000-00-00 00:00:00', ''),
(16, 'A00016', '', '5', '6', 0, 1, '', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 13, '0', '', '0', '0000-00-00 00:00:00', ''),
(17, 'A00017', '', '7', '8', 0, 1, '', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 13, '0', '', '0', '0000-00-00 00:00:00', ''),
(18, 'A00018', '', '9', '10', 0, 1, '', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 13, '0', '', '0', '0000-00-00 00:00:00', ''),
(19, 'A00019', 'LCC', 'Rodrigo Alejandro', 'Sevilla Blanco', 1, 0, '', 85, '', 'Facultad de Matemáticas', 31, 'rodrigosevilla2000@hotmail.com', '999', '9261291', '', '', 0, '0', 'M', '0', '0000-00-00 00:00:00', ''),
(20, 'A00020', '', '1', '2', 0, 1, '', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 19, '0', '', '0', '0000-00-00 00:00:00', ''),
(21, 'A00021', '', '3', '4', 0, 1, '', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 19, '0', '', '0', '0000-00-00 00:00:00', ''),
(22, 'A00022', '', '5', '6', 0, 1, '', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 19, '0', '', '0', '0000-00-00 00:00:00', ''),
(23, 'A00023', '', '7', '8', 0, 1, '', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 19, '0', '', '0', '0000-00-00 00:00:00', ''),
(24, 'A00024', '', '9', '10', 0, 1, '', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 19, '0', '', '0', '0000-00-00 00:00:00', ''),
(25, 'A00025', 'LCC', 'Rodrigo Alejandro', 'Sevilla Blanco', 1, 0, '', 85, '', 'Facultad de Matemáticas', 31, 'rodrigosevilla2000@hotmail.com', '999', '9261291', '', '', 0, '0', 'M', '0', '0000-00-00 00:00:00', ''),
(26, 'A00026', '', '1', '2', 0, 1, '', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 25, '0', '', '0', '0000-00-00 00:00:00', ''),
(27, 'A00027', '', '3', '4', 0, 1, '', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 25, '0', '', '0', '0000-00-00 00:00:00', ''),
(28, 'A00028', '', '5', '6', 0, 1, '', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 25, '0', '', '0', '0000-00-00 00:00:00', ''),
(29, 'A00029', '', '7', '8', 0, 5, '', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 25, '0', '', '0', '0000-00-00 00:00:00', ''),
(30, 'A00030', '', '9', '10', 0, 5, '', 85, '', 'Facultad de Matemáticas', 31, '', '', '', '', '', 25, '0', '', '0', '0000-00-00 00:00:00', ''),
(31, 'A00031', 'TR', 'Desiderio Rodolfo', 'Díaz Euán', 1, 5, 'Terapista Respiratorio', 85, '', 'Facultad de Medicina', 31, 'rsmxdedr@gmail.com', '999', '9123456', '', '', 0, '0', 'M', '0', '0000-00-00 00:00:00', ''),
(32, 'A00032', '', 'Rodrigo Alejandro', 'Sevilla Blanco', 0, 0, '', 130, '', '', 31, 'rodrigosevilla2000@hotmail.com', '', '', '', '', 0, '0', 'M', '0', '0000-00-00 00:00:00', ''),
(33, 'A00033', '', 'Rodrigo Alejandro', 'Sevilla Blanco', 0, 0, '', 130, '', '', 31, 'rodrigosevilla2000@hotmail.com', '', '', '', '', 0, '0', 'M', '0', '0000-00-00 00:00:00', ''),
(34, 'A00034', '', 'Rodrigo Alejandro', 'Sevilla Blanco', 0, 1, '', 130, '', '', 31, 'rodrigosevilla2000@hotmail.com', '', '', '', '', 0, '0', 'M', '3', '0000-00-00 00:00:00', ''),
(37, 'A00037', '', '', '', 0, 0, '', 0, '', '', 0, '', '', '', '', '', 0, '', '', '', '2008-09-20 17:16:46', ''),
(38, 'A00038', '', 'Rodrigo Alejandro', 'Díaz Euán', 2, 1, 'Licenciatura en Ciencias de la Computación', 4, '', 'Facultad de Matemáticas', 2, 'alex670812@hotmail.com', '', '', '', '', 0, '', 'M', '', '2008-09-20 17:17:29', '3'),
(36, 'A00036', '', 'Facturista', 'Gurrutia', 2, 2, 'Terapista Respiratorio', 4, '', 'Facultad de Medicina', 3, 'rosita@hotmail.com', '', '', '', '', 0, '', 'M', '', '2008-09-20 17:03:09', '8');
