ALTER TABLE subtitle_jobs ADD COLUMN privileged INTEGER NOT NULL DEFAULT 0 CHECK(privileged IN (0,1));
DROP TRIGGER IF EXISTS subtitle_quota;
CREATE TRIGGER subtitle_quota BEFORE INSERT ON subtitle_jobs BEGIN
 SELECT CASE WHEN NEW.privileged=0 AND (SELECT COUNT(*) FROM subtitle_jobs WHERE day=NEW.day AND visitor=NEW.visitor AND privileged=0 AND status IN ('pending','success'))>=3 THEN RAISE(ABORT,'VISITOR_LIMIT') END;
 SELECT CASE WHEN EXISTS(SELECT 1 FROM subtitle_jobs WHERE visitor=NEW.visitor AND status='pending' AND created>NEW.created-600000) THEN RAISE(ABORT,'BUSY') END;
 SELECT CASE WHEN NEW.privileged=0 AND (SELECT COUNT(*) FROM subtitle_jobs WHERE day=NEW.day AND network=NEW.network AND privileged=0)>=6 THEN RAISE(ABORT,'NETWORK_LIMIT') END;
 SELECT CASE WHEN (SELECT COUNT(*) FROM subtitle_jobs WHERE day=NEW.day)>=8 OR (SELECT COALESCE(SUM(seconds),0) FROM subtitle_jobs WHERE day=NEW.day)+NEW.seconds>1800 THEN RAISE(ABORT,'GLOBAL_LIMIT') END;
END;
