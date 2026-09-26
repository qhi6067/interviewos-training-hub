# Bash (Git Bash, macOS, or Linux) with curl
BASE=http://127.0.0.1:3001/api/tasks

curl -i "$BASE"

curl -i -X POST "$BASE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Practice API integrations"}'

ID=2  # replace with the id your POST returned

curl -i -X PATCH "$BASE/$ID" \
  -H "Content-Type: application/json" \
  -d '{"done":true}'

curl -i -X DELETE "$BASE/$ID"

curl -s -o /dev/null -w "%{http_code}\n" "$BASE/999999"
