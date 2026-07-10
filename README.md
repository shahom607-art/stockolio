# 📈 Stockolio

Stockolio is a comprehensive financial intelligence dashboard and virtual trading simulator built with Next.js 15, Better-Auth, and MongoDB. It aggregates real-time market data, provides interactive analytical charts, simulates risk-free investment strategies, and delivers personalized AI-driven market summaries.

## ✨ Features

- **Interactive Financial Dashboard**: Embedded real-time TradingView widgets showcasing market overviews, major stock indices, timeline news feeds, and live stock heatmaps.
- **Global Command Search**: Fast command-dialog search engine (`Ctrl+K` or `Cmd+K`) supporting autocomplete search for US stocks with dynamic watchlist status overlays.
- **Granular Stock Analysis**: Deep-dive analytics pages rendering live quotes, interactive advanced candlestick/baseline charts, hourly technical analysis gauges, comprehensive company profiles, and financial indicators.
- **Zero-Risk Portfolio Game Simulator**: Virtual trading dashboard enabling mock purchases and sales of shares at live prices. Automatically computes total investments, live market values, average cost bases, and real-time unrealized/realized profit & loss.
- **Interactive AI Assistant**: Persistent Stockolio AI chat widget supporting model selection (Llama 3.3 70B & Llama 3.1 8B via Groq) with persistent message histories and smart tool calling to fetch live financial news or stock details.
- **Personalized AI Email Workflows**: Built-in background workflows utilizing Inngest serverless handlers and Gemini 2.5 Flash Lite:
  - Sends a personalized welcome email based on user investment goals, risk tolerance, and country when a user registers.
  - Triggers a daily summary digest (`0 12 * * *` cron) aggregating personalized financial headlines and summaries tailored to users' watchlists.
- **Secure Authentication**: End-to-end authentication managed via Better-Auth connected to MongoDB, featuring email-password authentication, password recovery (SMTP reset link), and secure API route protection middleware.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Programming Language**: TypeScript
- **Database / ODM**: MongoDB, Mongoose
- **Authentication**: Better-Auth (with MongoDB Adapter)
- **AI Models & SDKs**: Groq SDK (Llama 3.3 70B, Llama 3.1 8B), Inngest AI (Gemini 2.5 Flash Lite)
- **Styling**: Tailwind CSS v4, PostCSS, Lucide React (Icons), Radix UI (Primitives), Shadcn UI
- **Workflow Automation**: Inngest (Serverless queues, crons, and AI steps)
- **Notifications**: Nodemailer (SMTP / Gmail configuration)
- **APIs & Widgets**: Finnhub API (market data, company profile, metrics, news), TradingView Embed Widgets (interactive charts, heatmaps)
- **Form Management**: React Hook Form

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas URI)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/shahom607-art/stockolio.git
   cd stockolio
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory. Do not commit this file to your version control.

   ```env
   # Database Configuration
   MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING

   # Better-Auth Configuration
   BETTER_AUTH_SECRET=YOUR_BETTER_AUTH_SECRET
   BETTER_AUTH_URL=http://localhost:3000

   # Finnhub Stock API Configuration
   FINNHUB_API_KEY=YOUR_FINNHUB_API_KEY

   # Alpha Vantage API Configuration (for Indian market support)
   ALPHA_VANTAGE_API_KEY=YOUR_ALPHA_VANTAGE_API_KEY

   # Groq & Gemini AI API Configuration
   GROQ_API_KEY=YOUR_GROQ_API_KEY
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY

   # Nodemailer SMTP Configuration (for welcome & daily digests)
   NODEMAILER_EMAIL=YOUR_SENDER_EMAIL@gmail.com
   NODEMAILER_PASSWORD=YOUR_SMTP_APP_PASSWORD
   ```

### Running Locally

1. **Test the Database Connection**:
   Ensure MongoDB is running and check the connection settings:
   ```bash
   npm run test:db
   ```

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

3. **Start the Inngest Dev Server**:
   To test background jobs, queues, and AI workflows locally, run:
   ```bash
   npx inngest-cli@latest dev
   ```

## 📁 Project Structure

```
├── app/                  # Next.js App Router (pages and route groups)
│   ├── (auth)/           # Sign-in, Sign-up, Forgot/Reset Password pages
│   ├── (root)/           # Main Layout, Dashboard, Portfolio Game, Watchlist, Stock Detail pages
│   └── api/              # API Routes (auth handler, Groq Chat endpoint, Inngest handler)
├── components/           # Reusable React components (Forms, Tables, Chat, Charts, Search)
│   ├── forms/            # Specialized form fields and inputs
│   └── ui/               # Radix UI and Shadcn UI components
├── database/             # MongoDB Connection and Mongoose Schemas (Chat, Portfolio, Watchlist)
├── hooks/                # Custom React hooks (useDebounce, useTradingViewWidget)
├── lib/                  # Shared helper functions, API actions, and services
│   ├── actions/          # Next.js Server Actions (Auth, Chat, Finnhub, Portfolio, Watchlist)
│   ├── ai/               # Groq integration configurations and prompts
│   ├── better-auth/      # Better-Auth instantiation and Mongo adapter config
│   ├── inngest/          # Inngest event clients, function handlers, and prompts
│   └── nodemailer/       # SMTP Transporter setup and email templates
└── public/               # Static assets
```

## 🗺 Roadmap / Future Improvements

- **Multi-Asset Support**: Expand from US equities to support cryptocurrencies, commodities, and international indices.
- **Enhanced Simulated Trading Options**: Add limit orders, stop-losses, and historical transaction ledgers to the Portfolio Game.
- **Interactive Price Alerts**: Allow users to set price alerts that trigger real-time emails or browser push notifications.
- **Expanded AI Toolkit**: Allow the AI assistant to perform advanced portfolio diversification analysis and yield forecasts.
- **Detailed Performance Charts**: Integrate custom dashboard charts (using Recharts or Chart.js) tracking a user's portfolio net worth over time.
- **Multi-Market Support (US & India)**: Integrate the Alpha Vantage API to track Indian equities alongside US stocks, giving users a seamless toggle to switch between US and Indian markets.

## 📄 License

This project is licensed under the MIT License.
