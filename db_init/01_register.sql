SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `register` (
  `reg_id` int(11) NOT NULL,
  `teljes_nev` varchar(100) NOT NULL COMMENT 'Felhasználó teljes neve',
  `email` varchar(150) NOT NULL COMMENT 'Felhasználó érvényes e-mail címe',
  `felhasznalo` varchar(50) NOT NULL COMMENT 'Felhasználónév',
  `jelszo` varchar(255) NOT NULL COMMENT 'Egyénileg beállított jelszó',
  `terms` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Felhasználási feltételek és adatvédelmi szabályzat elfogadása (I/N)',
  `letrehozva_datum` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Létrehozás dátuma'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

ALTER TABLE `register`
  ADD PRIMARY KEY (`reg_id`),
  ADD UNIQUE KEY `email_index` (`email`),
  ADD UNIQUE KEY `felhasznalo_index` (`felhasznalo`);

ALTER TABLE `register`
  MODIFY `reg_id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

