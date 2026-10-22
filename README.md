# AI Workplace Productivity Assistant

A modern, responsive web application designed to help professionals improve productivity by simplifying email writing, research, and everyday workplace communication.

## Project Overview

The AI Workplace Productivity Assistant provides a central dashboard for common workplace tasks. It features an email generator, a research assistant, and an interactive chatbot in a clean, professional interface with a dark-purple theme.

The project focuses on usability, responsive design, editable outputs, and responsible AI use.

## Features

### 1. Smart Email Generator
- Generate email drafts from user instructions.
- Support Formal, Friendly, and Persuasive tones.
- Edit generated email content.
- Copy email drafts for use in other applications.

### 2. AI Research Assistant
- Summarise user-provided articles and text.
- Explore topics and organise key information.
- Present insights and practical recommendations.
- Display results in a structured, readable format.

### 3. AI Chatbot
- Provide an interface for interactive conversations.
- Support workplace questions, writing assistance, and productivity tasks.
- Display conversation history within the interface.

### 4. Dashboard and User Experience
- Modern SaaS-style dashboard.
- Sidebar navigation between tools.
- Dark-purple theme with violet accents.
- Responsive layout for desktop, tablet, and mobile.
- Input validation and user feedback.
- Responsible AI disclaimer reminding users to review generated content.

## Technologies and Tools

- **React** — Building reusable user interface components.
- **TypeScript** — Type-safe application development.
- **Tailwind CSS** — Styling and responsive layouts.
- **Vite** — Development server and build tooling.
- **Git and GitHub** — Version control and project hosting.
- **Lovable** — AI-assisted application development.

*Note: Confirm the actual dependencies in `package.json` and the implementation in your repository. A working AI model integration may require an additional provider or service.*

## Getting Started

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/) — preferably the current LTS version.
- npm, which is included with Node.js.
- Git, if you want to clone the repository.

### Installation

**1. Clone the repository**

Replace the placeholder with your actual GitHub repository URL.

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
```

**2. Navigate to the project folder**

```bash
cd YOUR-REPOSITORY
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

**5. Open the application**

Open the local URL displayed in your terminal, commonly:

```text
http://localhost:5173
```

### Production Build

To build the application for production:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## AI Integration

The email generator, research assistant, and chatbot require a connected AI model to produce genuinely AI-generated responses.

If an AI provider has not been configured, these features may be limited to interface functionality or simulated responses.

For production use, configure a supported AI integration that protects credentials. Never commit API keys, passwords, or other secrets to GitHub.

## Responsible AI

AI-generated content may contain errors or inaccurate information. Users should review and verify generated emails, summaries, recommendations, and other outputs before relying on them.

Do not submit confidential workplace information unless the chosen AI provider's privacy and security practices have been reviewed.

## Project Structure

A typical project structure may look like this:

```text
ai-workplace-productivity-assistant/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

*The actual folders and configuration files may differ depending on your implementation.*

## Future Improvements

- Secure AI provider integration.
- Improved conversation memory.
- Export and download generated content.
- Saved email drafts and research history.
- Additional workplace productivity tools.
- Accessibility and usability enhancements.

## License


**Developed as a workplace productivity project** to explore modern web development, AI-assisted workflows, and user-centred interface design.
