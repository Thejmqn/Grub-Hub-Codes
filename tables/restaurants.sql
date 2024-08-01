DROP TABLE IF EXISTS `restaurants`;
CREATE TABLE `restaurants` (
    id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(64)
);
INSERT INTO `restaurants` (id, name) VALUES
(1, 'Chic Fil A'),
(2, 'West Range'),
(3, 'Rising Roll'),
(4, 'Einstein Bros'),
(5, 'Zaatar');
