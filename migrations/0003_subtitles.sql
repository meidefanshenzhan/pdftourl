CREATE TABLE IF NOT EXISTS subtitle_jobs(id TEXT PRIMARY KEY,day TEXT NOT NULL,visitor TEXT NOT NULL,network TEXT NOT NULL,seconds REAL NOT NULL,status TEXT NOT NULL DEFAULT 'pending',created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS subtitle_jobs_day ON subtitle_jobs(day,visitor,status);
CREATE TRIGGER IF NOT EXISTS subtitle_quota BEFORE INSERT ON subtitle_jobs BEGIN
 SELECT CASE WHEN (SELECT COUNT(*) FROM subtitle_jobs WHERE day=NEW.day AND visitor=NEW.visitor AND status IN ('pending','success'))>=3 THEN RAISE(ABORT,'VISITOR_LIMIT') END;
 SELECT CASE WHEN EXISTS(SELECT 1 FROM subtitle_jobs WHERE visitor=NEW.visitor AND status='pending' AND created>NEW.created-600000) THEN RAISE(ABORT,'BUSY') END;
 SELECT CASE WHEN (SELECT COUNT(*) FROM subtitle_jobs WHERE day=NEW.day AND network=NEW.network)>=6 THEN RAISE(ABORT,'NETWORK_LIMIT') END;
 SELECT CASE WHEN (SELECT COUNT(*) FROM subtitle_jobs WHERE day=NEW.day)>=8 OR (SELECT COALESCE(SUM(seconds),0) FROM subtitle_jobs WHERE day=NEW.day)+NEW.seconds>1800 THEN RAISE(ABORT,'GLOBAL_LIMIT') END;
END;
