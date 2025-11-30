-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2025. Nov 15. 16:09
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `dilo`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `register`
--

CREATE TABLE `register` (
  `reg_id` int(11) NOT NULL,
  `teljes_nev` varchar(100) NOT NULL COMMENT 'Felhasználó teljes neve',
  `email` varchar(150) NOT NULL COMMENT 'Felhasználó érvényes e-mail címe',
  `felhasznalo` varchar(50) NOT NULL COMMENT 'Felhasználónév',
  `jelszo` varchar(255) NOT NULL COMMENT 'Egyénileg beállított jelszó',
  `terms` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Felhasználási feltételek és adatvédelmi szabályzat elfogadása (I/N)',
  `letrehozva_datum` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Létrehozás dátuma'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `register`
--
ALTER TABLE `register`
  ADD PRIMARY KEY (`reg_id`),
  ADD UNIQUE KEY `email_index` (`email`),
  ADD UNIQUE KEY `felhasznalo_index` (`felhasznalo`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `register`
--
ALTER TABLE `register`
  MODIFY `reg_id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
