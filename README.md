# Nano Banana Studio 🍌✨

A modern, powerful AI image editor powered by Google's **Gemini Nano Banana** model. This application provides a seamless interface for generating, editing, and transforming images using natural language prompts and intuitive tools.

## ✨ Features

### 1. 🎨 AI Image Generation
Generate high-quality images from text descriptions.
- **Model:** Gemini Nano Banana (`gemini-2.5-flash-image`)
- **Resolution:** 1:1 Aspect Ratio (Square)
- **Usage:** Simply type a prompt in the "Start Here" box and click "Generate Image".

### 2. 🖼️ Image Upload & Editing
Upload your own images to edit them with AI.
- **Upload:** Supports PNG, JPG, and WebP (up to 5MB).
- **Edit by Prompt:** Describe changes (e.g., "Add a sunset background", "Make the cat blue") in the text box.

### 3. 🪄 Magic Tools
Quick, one-click actions for common tasks:
- **Remove Background:** Instantly isolate the subject.
- **Upscale:** Enhance resolution and details of generated or uploaded images.

### 4. 📐 Change Perspective (Angle)
Re-imagine your image from different viewpoints without losing the subject's essence.
- **Angles:** Isometric, Overhead, Front View, Low Angle, Wide Angle.

### 5. 🎭 Artistic Filters
Apply style transfers instantly while preserving the original composition.
- **Styles:** Grayscale, Sepia, Vintage, Cyberpunk, Watercolor.

### 6. ⭕ Circle-to-Add (Smart In-painting)
Precisely add objects to specific areas of an image.
1. Activate the **Circle Tool**.
2. Draw a circle on the canvas.
3. Resize or move the circle to perfect the placement.
4. Type what you want to add (e.g., "A red hat") and click **Generate Preview**.
5. **Preview Workflow:** Decide to "Keep" or "Discard" the change before finalizing.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Google Cloud Project with the **Gemini API** enabled.
- An API Key with access to the `gemini-2.5-flash-image` model.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nano-banana-studio.git
   cd nano-banana-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   API_KEY=your_google_gemini_api_key_here
   ```

4. **Start the Development Server**
   ```bash
   npm start
   ```

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **AI Integration:** Google GenAI SDK (`@google/genai`)
- **Canvas:** Native HTML5 Canvas API for interactive drawing

## 📖 Usage Guide

### Generating an Image
1. Open the app.
2. In the text box on the right, type: *"A futuristic city with flying cars"*
3. Click **Generate Image**.

### Using the Circle Tool
1. Click **Enable** next to "Circle to Add" in the bottom right.
2. Click and drag on the image to create a red circle.
3. Drag the center to move it, or drag the white handles to resize it.
4. In the input box below, type *"A large full moon"*.
5. Click **Generate Preview**.
6. If you like the result, click **Keep** (Green Check). If not, click **Discard** (Red X).

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.


---
Built with ❤️ using Gemini API
