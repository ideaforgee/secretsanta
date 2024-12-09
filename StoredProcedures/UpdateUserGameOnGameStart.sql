DROP PROCEDURE IF EXISTS `UpdateUserGameOnGameStart`;

CREATE PROCEDURE `UpdateUserGameOnGameStart`(IN pGameId INT, IN inputData JSON)
BEGIN
    DECLARE totalUsers INT;
    DECLARE currentIndex INT DEFAULT 0;

    UPDATE games
    SET isActive = 1
    WHERE id = pGameId;

    SET totalUsers = JSON_LENGTH(inputData);

    WHILE currentIndex < totalUsers DO

        SET @userId = JSON_UNQUOTE(JSON_EXTRACT(inputData, CONCAT('$[', currentIndex, '].id')));
        SET @secretSantaId = JSON_UNQUOTE(JSON_EXTRACT(inputData, CONCAT('$[', currentIndex, '].secretSantaId')));
        SET @giftNinjaId = JSON_UNQUOTE(JSON_EXTRACT(inputData, CONCAT('$[', currentIndex, '].giftNinjaId')));

        UPDATE userGame
        SET
            secretSantaId = @secretSantaId,
            giftNinjaId = @giftNinjaId
        WHERE userId = @userId
        AND gameId = pGameId;

        SET currentIndex = currentIndex + 1;
    END WHILE;
END;