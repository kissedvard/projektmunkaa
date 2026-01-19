DROP TABLE IF EXISTS `posts`;
DROP TABLE IF EXISTS `follows`;

-- Posts
CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `caption` text,
  `tags` varchar(255) DEFAULT NULL,  -- <--- EZT A SORT SZÚRD BE
  `likes_count` int(11) DEFAULT 0,
  `comments_count` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `register` (`reg_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Follows
CREATE TABLE `follows` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `follower_id` int(11) NOT NULL COMMENT 'Aki követ',
  `following_id` int(11) NOT NULL COMMENT 'Akit követnek',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_follow` (`follower_id`, `following_id`), 
  FOREIGN KEY (`follower_id`) REFERENCES `register` (`reg_id`) ON DELETE CASCADE,
  FOREIGN KEY (`following_id`) REFERENCES `register` (`reg_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;