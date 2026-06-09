-- script: scripts/get-inbound-raw-payload.sql
-- Amaç: Supabase/Postgres DB'den inbound email raw_payload ve mail içeriği alanlarını çek.

-- En son gelen 10 inbound mail kaydını kontrol eder.
SELECT
  id,
  inbox,
  from_email,
  from_name,
  subject,
  body_text,
  body_html,
  received_at,
  raw_payload,
  raw_payload -> 'data' ->> 'subject' AS data_subject,
  raw_payload -> 'data' ->> 'text' AS data_text,
  raw_payload -> 'data' ->> 'html' AS data_html,
  raw_payload -> 'data' ->> 'body' AS data_body,
  raw_payload -> 'data' ->> 'body_html' AS data_body_html,
  raw_payload -> 'data' ->> 'body_text' AS data_body_text,
  raw_payload -> 'data' -> 'message' ->> 'subject' AS message_subject,
  raw_payload -> 'data' -> 'message' ->> 'text' AS message_text,
  raw_payload -> 'data' -> 'message' ->> 'html' AS message_html,
  raw_payload -> 'data' -> 'message' ->> 'body' AS message_body,
  raw_payload -> 'data' -> 'message' ->> 'body_html' AS message_body_html,
  raw_payload -> 'data' -> 'message' ->> 'body_text' AS message_body_text
FROM inbound_emails
ORDER BY received_at DESC
LIMIT 10;

-- Eğer sadece `raw_payload` içindeki mail gövdelerini görmek istersen:
-- SELECT
--   id,
--   raw_payload -> 'data' ->> 'subject' AS data_subject,
--   raw_payload -> 'data' -> 'message' ->> 'html' AS message_html,
--   raw_payload -> 'data' -> 'message' ->> 'text' AS message_text,
--   raw_payload -> 'data' ->> 'html' AS data_html,
--   raw_payload ->> 'html' AS html,
--   raw_payload ->> 'text' AS text,
--   raw_payload ->> 'body' AS body,
--   raw_payload ->> 'body_html' AS body_html
-- FROM inbound_emails
-- ORDER BY received_at DESC
-- LIMIT 10;
