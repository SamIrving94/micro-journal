$baseUrl = "https://ed36-2a04-4a43-85af-ff28-846e-472f-e22f-96d.ngrok-free.app/api/whatsapp/webhook"
$mode = "subscribe"
$token = "micro_journal_webhook_verify_123"
$challenge = "1234567890"

$fullUrl = "${baseUrl}?hub.mode=${mode}&hub.verify_token=${token}&hub.challenge=${challenge}"
Write-Host "Testing URL: $fullUrl"
Write-Host "Verify Token from env: $($env:WHATSAPP_VERIFY_TOKEN)"

try {
    $headers = @{
        'ngrok-skip-browser-warning' = 'true'
        'Accept' = 'text/plain'
    }
    Write-Host "Sending request..."
    $response = Invoke-WebRequest -Uri $fullUrl -Method GET -Headers $headers -Verbose
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response Headers:"
    $response.Headers | Format-Table -AutoSize
    Write-Host "Response Body: $($response.Content)"
} catch {
    Write-Host "Error: $_"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
        Write-Host "Error Message: $($_.ErrorDetails.Message)"
    }
} 