DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    username varchar(31),
    password varchar(31),
    message varchar(255)
);
