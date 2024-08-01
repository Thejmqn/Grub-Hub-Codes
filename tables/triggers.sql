CREATE TRIGGER code_submission
AFTER INSERT ON code_submission
FOR EACH ROW
BEGIN
    UPDATE users SET total_submissions = total_submissions + 1
    WHERE NEW.user_id = id;
    UPDATE users SET recent_submissions = recent_submissions + 1
    WHERE NEW.user_id = id;
END;
