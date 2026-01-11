-- Posts
CREATE TABLE IF NOT EXISTS `posts` (
  `post_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `kep_utvonal` varchar(255) NOT NULL,
  `leiras` text,
  `feltoltve` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`),
  FOREIGN KEY (`user_id`) REFERENCES `register` (`reg_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS `follows` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `follower_id` int(11) NOT NULL COMMENT 'Aki követ',
  `following_id` int(11) NOT NULL COMMENT 'Akit követnek',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_follow` (`follower_id`, `following_id`), 
  FOREIGN KEY (`follower_id`) REFERENCES `register` (`reg_id`) ON DELETE CASCADE,
  FOREIGN KEY (`following_id`) REFERENCES `register` (`reg_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;