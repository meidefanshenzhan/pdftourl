ALTER TABLE subtitle_jobs ADD COLUMN budget_managed INTEGER NOT NULL DEFAULT 0 CHECK(budget_managed IN (0,1));
CREATE TABLE ai_budget_days(day TEXT PRIMARY KEY,limit_milli INTEGER NOT NULL,spent_milli INTEGER NOT NULL DEFAULT 0,held_milli INTEGER NOT NULL DEFAULT 0,paused INTEGER NOT NULL DEFAULT 0,reason TEXT, CHECK(limit_milli>=0 AND spent_milli>=0 AND held_milli>=0));
CREATE TABLE ai_budget_calls(id TEXT PRIMARY KEY,day TEXT NOT NULL,job TEXT NOT NULL,model TEXT NOT NULL,reserve_milli INTEGER NOT NULL CHECK(reserve_milli>0),actual_milli INTEGER,state TEXT NOT NULL DEFAULT 'reserved' CHECK(state IN ('reserved','settled','unknown')),created INTEGER NOT NULL,finished INTEGER,CHECK(actual_milli IS NULL OR actual_milli>=0));
CREATE INDEX ai_budget_calls_state ON ai_budget_calls(state,created);
CREATE INDEX ai_budget_calls_day ON ai_budget_calls(day,job);
CREATE TRIGGER ai_budget_admit BEFORE INSERT ON ai_budget_calls BEGIN
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM ai_budget_days WHERE day=NEW.day) THEN RAISE(ABORT,'AI_BUDGET') END;
 SELECT CASE WHEN EXISTS(SELECT 1 FROM ai_budget_days WHERE day=NEW.day AND (paused=1 OR spent_milli+held_milli+NEW.reserve_milli+(SELECT COALESCE(SUM(reserve_milli),0) FROM ai_budget_calls WHERE day<>NEW.day AND state='reserved')
 +(SELECT COALESCE(SUM(reserve_milli),0) FROM ai_budget_calls WHERE day<>NEW.day AND state='unknown' AND (date(finished/1000,'unixepoch')=NEW.day OR date(created/1000,'unixepoch')>=date(NEW.day,'-1 day')))
 +(SELECT COALESCE(SUM(actual_milli),0) FROM ai_budget_calls WHERE day<>NEW.day AND state='settled' AND date(finished/1000,'unixepoch')=NEW.day)>limit_milli)) THEN RAISE(ABORT,'AI_BUDGET') END;
END;
CREATE TRIGGER ai_budget_hold AFTER INSERT ON ai_budget_calls BEGIN
 UPDATE ai_budget_days SET held_milli=held_milli+NEW.reserve_milli WHERE day=NEW.day;
END;
CREATE TRIGGER ai_budget_reconcile AFTER UPDATE OF state ON ai_budget_calls WHEN OLD.state='reserved' AND NEW.state IN ('settled','unknown') BEGIN
 UPDATE ai_budget_days SET held_milli=held_milli-OLD.reserve_milli,spent_milli=spent_milli+COALESCE(NEW.actual_milli,OLD.reserve_milli) WHERE day=OLD.day;
 UPDATE ai_budget_days SET paused=1,reason='USAGE_UNKNOWN' WHERE day=OLD.day AND paused=0 AND NEW.state='unknown';
 UPDATE ai_budget_days SET paused=1,reason='RESERVATION_OVERRUN' WHERE day=OLD.day AND paused=0 AND NEW.actual_milli>OLD.reserve_milli;
 UPDATE ai_budget_days SET paused=1,reason='DAILY_LIMIT' WHERE day=OLD.day AND paused=0 AND spent_milli>=limit_milli;
END;
