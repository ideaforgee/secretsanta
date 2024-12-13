DROP PROCEDURE IF EXISTS `InsertMessage`;

CREATE PROCEDURE `InsertMessage`(
    IN pContent TEXT,
    IN pSenderId INT,
    IN pGameId INT,
    IN pReceiverId INT,
    IN pChatBoxType VARCHAR(50)
)
BEGIN
    INSERT INTO messages (content, senderId, receiverId, gameId, `time`)
    VALUES (pContent, pSenderId, pReceiverId, pGameId, NOW());

END;