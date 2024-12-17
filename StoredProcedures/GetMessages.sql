DROP PROCEDURE IF EXISTS `GetMessages`;

CREATE PROCEDURE `GetMessages`(IN pUserId INT, IN pSenderId INT, IN pGameId INT)
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
            WHEN senderId = pSenderId and receiverId = @secretSantaId THEN 'Me'
            WHEN senderId = @secretSantaId and receiverId = pSenderId THEN 'Santa'
        END AS 'from',
        content,
        `time`
    FROM messages
    WHERE ((senderId = @secretSantaId AND receiverId = pSenderId)
    OR (senderId = pSenderId AND receiverId = @secretSantaId))
    AND gameId = pGameId
    ORDER BY `time`;

    -- Fetch Gift Ninja messages, ordered by time
    SELECT
        CASE
            WHEN senderId = pSenderId and receiverId = @giftNinjaId THEN 'Me'
            WHEN senderId = @giftNinjaId and receiverId = pSenderId THEN 'Ninja'
        END AS 'from',
        content,
        `time`
    FROM messages
    WHERE ((senderId = @giftNinjaId AND receiverId = pSenderId)
    OR (senderId = pSenderId AND receiverId = @giftNinjaId))
    AND gameId = pGameId
    ORDER BY `time`;
END;