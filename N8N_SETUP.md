# n8n Workflow Setup Guide

## Current Issues

1. **Missing Webhook Trigger Node**: Your workflow needs a Webhook trigger node to receive POST requests from the frontend
2. **Webhook ID Mismatch**: The webhook ID in your workflow (`a8664fb3-6396-4850-a693-dc24005247c5`) doesn't match the one in the code

## How to Fix Your n8n Workflow

### Step 1: Add Webhook Trigger Node

1. Open your n8n workflow: https://n8n.simplifai-1.org/workflow/w7GQJzHygJ62OO2R
2. Click the "+" button to add a new node
3. Search for "Webhook" and select **"Webhook"** (not "Webhook Response")
4. Configure the Webhook node:
   - **HTTP Method**: POST
   - **Path**: Leave default or set to `/webhook/mockmagic`
   - **Response Mode**: "When Last Node Finishes"
   - **Options**: 
     - Enable **CORS** (Critical! This allows requests from your Vercel domain)
     - Set **Response Code**: 200

### Step 2: Connect Nodes

Connect the nodes in this order:
```
Webhook Trigger → Edit an image (Gemini) → Send a message (Gmail)
```

### Step 3: Configure Gemini Node

In the "Edit an image" node:
1. **Image**: Use `{{ $json.body.image }}` (the base64 image from webhook)
2. **Prompt**: Combine style and custom prompt:
   ```
   Create a {{ $json.body.style }} style mockup. {{ $json.body.customPrompt || '' }}
   ```
3. Make sure the node outputs the generated image

### Step 4: Configure Gmail Node

In the "Send a message" node:
1. **To**: `{{ $json.body.email }}`
2. **Subject**: "Your MockMagic AI Generated Mockup"
3. **Message**: 
   ```
   Hi,
   
   Your mockup has been generated successfully!
   
   Style: {{ $json.body.style }}
   {{#if $json.body.customPrompt}}
   Custom Instructions: {{ $json.body.customPrompt }}
   {{/if}}
   
   Please find your generated mockup attached.
   ```
4. **Attachments**: Use the image output from the Gemini node

### Step 5: Get the Correct Webhook URL

1. After adding the Webhook node, click on it
2. Look for the **"Production URL"** or **"Test URL"**
3. It should look like: `https://n8n.simplifai-1.org/webhook/[webhook-id]`
4. Copy this URL

### Step 6: Update the Frontend Code

Update the `WEBHOOK_URL` in `script.js` with the correct webhook URL from Step 5.

## Expected Payload Structure

Your webhook will receive:
```json
{
  "image": "base64_image_string",
  "style": "modern",
  "email": "user@example.com",
  "customPrompt": "Make this ad pop"
}
```

## CORS Configuration

**IMPORTANT**: Make sure CORS is enabled in your Webhook node settings. This is required for the frontend (hosted on Vercel) to make requests to your n8n instance.

## Testing

1. Activate your workflow in n8n
2. Test the webhook URL using curl or Postman:
```bash
curl -X POST https://n8n.simplifai-1.org/webhook/[your-webhook-id] \
  -H "Content-Type: application/json" \
  -d '{
    "image": "base64_string_here",
    "style": "modern",
    "email": "test@example.com",
    "customPrompt": "test"
  }'
```

## Troubleshooting

- **CORS Error**: Enable CORS in Webhook node settings
- **404 Error**: Make sure the workflow is activated
- **500 Error**: Check node configurations and credentials
- **Image Not Processing**: Verify base64 format and Gemini API credentials
