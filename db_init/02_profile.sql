SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `profiles` (
  `profile_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'Kapocs a register táblához (reg_id)',
  
  -- Profil adatok
  `bemutatkozas` text COLLATE utf8_hungarian_ci DEFAULT NULL,
  `profil_kep` varchar(255) COLLATE utf8_hungarian_ci DEFAULT 'fiok-ikon.png',
  `telefon` varchar(50) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `lakhely` varchar(100) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `weboldal` varchar(150) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `szuletesi_datum` date DEFAULT NULL,
  `privat_profil` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=Nyilvános, 1=Privát',
  `ertesitesek` tinyint(1) NOT NULL DEFAULT 1 COMMENT '0=Kikapcsolva, 1=Bekapcsolva',

  -- Technikai beállítások
  PRIMARY KEY (`profile_id`),
  KEY `user_ind` (`user_id`), 
  CONSTRAINT `fk_user_profile` FOREIGN KEY (`user_id`) REFERENCES `register` (`reg_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;