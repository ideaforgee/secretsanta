DROP PROCEDURE IF EXISTS `InsertMessage`;

CREATE PROCEDURE `InsertMessage`(
    IN pContent TEXT,
    IN pSenderId INT,
    IN pGameId INT,
    IN pChatBoxType VARCHAR(50)
)
BEGIN
    DECLARE receiverId INT;

    IF pChatBoxType = 'secretSanta' THEN

        SELECT secretSantaId
        INTO receiverId
        FROM userGame
        WHERE userId = pSenderId AND gameId = pGameId;

    ELSEIF pChatBoxType = 'giftNinja' THEN

        SELECT giftNinjaId
        INTO receiverId
        FROM userGame
        WHERE userId = pSenderId AND gameId = pGameId;

    END IF;

    INSERT INTO messages (content, senderId, receiverId, gameId, `time`)
    VALUES (pContent, pSenderId, receiverId, pGameId, NOW());

END