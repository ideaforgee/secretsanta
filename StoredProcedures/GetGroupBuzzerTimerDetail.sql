DELIMITER $$

DROP PROCEDURE IF EXISTS getGroupBuzzerTimerDetail;

CREATE PROCEDURE getGroupBuzzerTimerDetail(IN funZoneGroupId INT, IN userId INT)
BEGIN
    SELECT u.name
    FROM buzzerRoom br
    JOIN users u ON br.userId = u.id
    WHERE br.funZoneGroupId = funZoneGroupId
    ORDER BY br.time ASC;

    SELECT
        IF(EXISTS(SELECT 1 FROM buzzerRoom WHERE funZoneGroupId = funZoneGroupId AND userId = userId), false, true) AS isBuzzerActive,
        fg.hostId
    FROM funZoneGroups fg
    WHERE fg.id = funZoneGroupId;

END $$

DELIMITER ;
