

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `post_likes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_post_like` (`user_id`, `post_id`),
  FOREIGN KEY (`user_id`) REFERENCES `register` (`reg_id`) ON DELETE CASCADE,
  FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



CREATE TABLE IF NOT EXISTS `post_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `comment_text` text NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `register` (`reg_id`) ON DELETE CASCADE,
  FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



DELIMITER $$


DROP TRIGGER IF EXISTS `after_like_insert`$$
CREATE TRIGGER `after_like_insert` AFTER INSERT ON `post_likes`
FOR EACH ROW
BEGIN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
END$$


DROP TRIGGER IF EXISTS `after_like_delete`$$
CREATE TRIGGER `after_like_delete` AFTER DELETE ON `post_likes`
FOR EACH ROW
BEGIN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
END$$


DROP TRIGGER IF EXISTS `after_comment_insert`$$
CREATE TRIGGER `after_comment_insert` AFTER INSERT ON `post_comments`
FOR EACH ROW
BEGIN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
END$$


DROP TRIGGER IF EXISTS `after_comment_delete`$$
CREATE TRIGGER `after_comment_delete` AFTER DELETE ON `post_comments`
FOR EACH ROW
BEGIN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
END$$

DELIMITER ;