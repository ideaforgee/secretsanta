DROP PROCEDURE IF EXISTS GetTambolaGameDetails;

CREATE PROCEDURE GetTambolaGameDetails(
    IN p_userId INT,
    IN p_tambolaGameId INT
)
BEGIN
    SELECT
        tg.hostId,
        tg.withdrawnNumbers,
        utg.ticketNumbers,
        utg.markedNumbers,
        tg.status,
        tgc.topLine,
        tgc.middleLine,
        tgc.bottomLine,
        tgc.earlyFive,
        tgc.fullHouse
    FROM TambolaGames tg
    LEFT JOIN UserTambolaGame utg ON tg.id = utg.tambolaGameId
        AND utg.userId = p_userId
    LEFT JOIN TambolaGameClaims tgc ON tg.id = tgc.tambolaGameId
    WHERE tg.id = p_tambolaGameId;
END;
