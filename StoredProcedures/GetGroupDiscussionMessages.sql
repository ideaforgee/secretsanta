DROP PROCEDURE IF EXISTS `GetGroupDiscussionMessages`;

CREATE PROCEDURE `GetGroupDiscussionMessages`(IN pSenderId INT, IN pGroupId INT)
BEGIN

    -- Fetch Public Chat messages, ordered by time
    SELECT
        CASE
            WHEN gd.senderId = pSenderId THEN 'Me'
            WHEN gd.senderId <> pSenderId THEN u.name
        END AS 'from',
        content,
        `createdAt`
    FROM groupDiscussion gd
    LEFT JOIN users u ON u.id = gd.senderId
    WHERE gd.groupId = pGroupId
    AND gd.sendAnonymously = FALSE
    ORDER BY `createdAt`;

    -- Fetch Anonymous Chat messages, ordered by time
    SELECT
        'Anonymous' AS 'from',
        content,
        `createdAt`
    FROM groupDiscussion
    WHERE groupId = pGroupId
    AND sendAnonymously = TRUE
    ORDER BY `createdAt`;
END;