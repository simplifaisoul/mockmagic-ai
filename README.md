# MockMagic AI

A beautiful, AI-powered mockup generator that transforms your images into stunning mockups using advanced AI technology.

## Features

- 🖼️ **Image Upload**: Drag and drop or click to upload images
- 🎨 **Style Selection**: Choose from multiple mockup styles (Modern, Classic, Minimalist, Vintage, Futuristic, Elegant, Bold, Soft)
- ✍️ **Custom Prompts**: Add optional custom instructions for your mockup
- 📧 **Email Delivery**: Generated mockups are automatically emailed to you
- 💾 **History Gallery**: View all your previously generated mockups
- ⬇️ **Download**: Download your generated mockups instantly
- 🎨 **Epic Black & Purple Theme**: Beautiful dark theme with purple accents

## How It Works

1. **Upload an Image**: Click or drag and drop your image file (PNG, JPG, GIF up to 10MB)
2. **Select Style**: Choose your preferred mockup style from the dropdown
3. **Enter Email**: Provide your email address (required - mockup will be sent here)
4. **Add Custom Prompt** (Optional): Describe any specific requirements
5. **Generate**: Click the "Generate Mockup" button
6. **Receive Email**: Your generated mockup will be emailed to you

## Webhook Integration

This application sends POST requests to the n8n webhook endpoint with the following payload structure:

```json
{
  "image": "base64 image string",
  "style": "selected style",
  "email": "user@example.com",
  "customPrompt": "optional custom instructions"
}
```

## Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: No framework dependencies
- **LocalStorage**: History persistence
- **Fetch API**: Webhook communication

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Installation

1. Clone or download this repository
2. Open `index.html` in a web browser
3. No build process or dependencies required!

## Usage

Simply open `index.html` in your web browser and start creating mockups!

## License

© 2025 MockMagic AI by SimplifAI-1. All rights reserved.
