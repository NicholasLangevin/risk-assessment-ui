# **App Name**: RiskPilot

## Core Features:

- Dashboard Overview: Dashboard: displays the underwriter's workflow overview with key metrics (quotes to process, pending broker responses) and an inbox table of incoming submissions.
- Quote View: Submission Details: presents a comprehensive view of a selected quote, including premium summary, recommended actions (information needed, subject-to offers, decline), capacity check status, and business overview.
- AI Recommendation Engine: Leverages Gemini via an AI Agent tool to analyze submission data and suggest optimal underwriting actions, information requests, and potential subject-to offers, thus streamlining the evaluation process.
- Guideline Status: Shows a list of evaluated underwriting guidelines with status indicators, offering a clear understanding of compliance and risk factors.
- AI Processing Monitor: Provides a collapsable sidebar showing the progress of the AI LLM Agent workflow for a particular submission, and allow to expose what the AI tool is deciding.

## Style Guidelines:

- Primary color: #00aebd for a professional and trustworthy feel, inspired by the corporate insurance setting.
- Background color: Light gray (#D3D5D8) to provide a subtle contrast against the dark blue, ensuring readability and a clean interface.
- Accent color: #e3173e for critical alerts and actions (e.g., decline recommendations, information requests), drawing the user's attention to important issues.
- Body and headline font: 'Inter' sans-serif, with a modern, machined, objective, neutral look, suitable for both headlines and body text.
- Dashboard Inbox: Use a tabular format for displaying submissions, with clear column headers and sorting capabilities to manage the workflow effectively.
- Collapsable Sidebar: Implement a right-side panel that can be collapsed, housing the AI processing workflow details, to maintain a clean and focused primary content area.