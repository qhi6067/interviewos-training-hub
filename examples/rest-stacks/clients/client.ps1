# client.ps1 · PowerShell (Windows PowerShell 5.1 or PowerShell 7)
$baseUri = 'http://127.0.0.1:3001/api/tasks'

# GET: Invoke-RestMethod turns the JSON array into objects
Invoke-RestMethod -Uri $baseUri

# POST: build a hashtable, convert it to JSON, and send it
$body = @{ title = 'Practice API integrations' } | ConvertTo-Json
$task = Invoke-RestMethod -Uri $baseUri -Method Post -ContentType 'application/json' -Body $body
"Created task $($task.id): $($task.title)"

# PATCH: double quotes expand $baseUri and $($task.id)
$patch = @{ done = $true } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUri/$($task.id)" -Method Patch -ContentType 'application/json' -Body $patch

# DELETE: Invoke-WebRequest keeps the status code and headers
$response = Invoke-WebRequest -Uri "$baseUri/$($task.id)" -Method Delete -UseBasicParsing
$response.StatusCode   # 204

# Errors: 4xx and 5xx responses throw, so catch them
try {
    Invoke-RestMethod -Uri "$baseUri/999999"
} catch {
    $_.Exception.Response.StatusCode.value__   # 404
}
