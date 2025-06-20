# CL Underwriting Assist

A Next.js application designed to assist commercial lines insurance underwriters with AI-powered tools and workflow management.

## Overview

CL Underwriting Assist is a modern web application that combines traditional underwriting processes with AI-powered decision support. It helps underwriters manage quotes, assess risks, and streamline their workflow through intelligent automation.

## Key Features

- **AI-Powered Risk Assessment**
  - Automated risk evaluation for insurance coverages
  - Smart underwriting action suggestions
  - Automated information request generation
  - Subject-to-offer recommendations

- **Case Management**
  - Comprehensive case overview
  - Risk assessment dashboard
  - Data entry management
  - Email communication tracking
  - Document management

- **Quote Management**
  - Quote dashboard with status tracking
  - Detailed quote view with AI insights
  - Premium summary and capacity checks
  - Business overview integration

- **Workflow Tools**
  - Personalized working lists
  - Task prioritization
  - Case assignment tracking
  - Status monitoring

## Technology Stack

- **Frontend**: Next.js 14+ with React
- **Styling**: Tailwind CSS with custom theme support
- **UI Components**: Custom component library with dark/light mode
- **Backend Integration**: 
  - Firebase for data management
  - Python/FastAPI support for AI processing
  - Real-time updates

## Getting Started

1. **Prerequisites**
   ```bash
   node.js 18+ 
   npm or yarn
   ```

2. **Installation**
   ```bash
   # Clone the repository
   git clone [repository-url]

   # Install dependencies
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example env file
   cp .env.example .env.local

   # Configure your environment variables
   # Edit .env.local with your Firebase credentials
   ```

4. **Development**
   ```bash
   # Run the development server
   npm run dev
   # or
   yarn dev
   ```

   The application will be available at `http://localhost:3000`

## Project Structure

```
src/
  ├── ai/            # AI processing flows and integration
  ├── app/           # Next.js app router pages
  ├── components/    # React components
  │   ├── case-view/ # Case management components
  │   ├── quote/     # Quote management components
  │   └── ui/        # Reusable UI components
  ├── hooks/         # Custom React hooks
  ├── lib/           # Utilities and shared functions
  └── types/         # TypeScript type definitions
```
