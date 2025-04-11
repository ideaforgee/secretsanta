DROP PROCEDURE IF EXISTS `GetMasterMindGameDetails`;

CREATE PROCEDURE `GetMasterMindGameDetails`(
    IN p_userId INT,
    IN p_masterMindGameId INT
)
BEGIN
    SELECT level, guess, hint, isComplete
    FROM userMasterMindGame umg
    WHERE userId = p_userId AND masterMindGameId = p_masterMindGameId
    ORDER BY level ASC;

    SELECT mc.* FROM masterMindConfig mc
    INNER JOIN masterMindGames mg ON mg.severity = mc.severity
    where mg.id = p_masterMindGameId;
END;