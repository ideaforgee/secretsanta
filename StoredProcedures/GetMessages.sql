DROP PROCEDURE IF EXISTS `GetMessages`;

CREATE PROCEDURE `GetMessages`(IN pUserId INT, IN pGameId INT)
BEGIN
    -- Fetch secretSantaId and giftNinjaId, ensuring only one row is returned
    SELECT secretSantaId, giftNinjaId
    INTO @secretSantaId, @giftNinjaId
    FROM userGame
    WHERE userId = pUserId AND gameId = pGameId
    LIMIT 1;

    -- Fetch Secret Santa messages, ordered by time
    SELECT
        CASE
            WHEN senderId = pUserId and receiverId = @secretSantaId THEN 'Me'
            WHEN senderId = @secretSantaId and receiverId = pUserId THEN 'Santa'
        END AS 'from',
        content,
        `time`
    FROM messages
    WHERE ((senderId = @secretSantaId AND receiverId = pUserId)
    OR (senderId = pUserId AND receiverId = @secretSantaId))
    AND gameId = pGameId
    ORDER BY `time`;

    -- Fetch Gift Ninja messages, ordered by time
    SELECT
        CASE
            WHEN senderId = pUserId and receiverId = @giftNinjaId THEN 'Me'
            WHEN senderId = @giftNinjaId and receiverId = pUserId THEN 'Ninja'
        END AS 'from',
        content,
        `time`
    FROM messages
    WHERE ((senderId = @giftNinjaId AND receiverId = pUserId)
    OR (senderId = pUserId AND receiverId = @giftNinjaId))
    AND gameId = pGameId
    ORDER BY `time`;
END;