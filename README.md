# AI-Powered Medical Report Analyzer

A smart web app that simplifies medical reports by analyzing uploaded PDFs and images, extracting text, and providing concise, easy-to-understand explanations. Powered by Next.js, Groq API, and LlamaParse.

## 🔍 Features

- Upload medical reports in PDF or image format.
- Extract text automatically using LlamaParse.
- AI-powered analysis with Groq API for clear, simplified insights.
- Quick, real-time processing with a user-friendly interface.

## 🛠 Technologies Used

- **Next.js** – Frontend and backend framework.
- **Groq API** – AI-driven medical report interpretation.
- **LlamaParse** – Text extraction from PDFs and images.
- **React** – Interactive UI components.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Groq API key for AI analysis

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kunalg12/medical-report-analyzer-ai.git
   cd medical-report-analyzer-ai
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure environment variables:**
   Create a `.env.local` file and add:
   ```
   GROQ_API_KEY=your_groq_api_key
   LLAMA_CLOUD_API_KEY=your_llama_cloud_api_key
   ```
4. **Run the app:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. **Access the app:** Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏥 How It Works

1. **Upload** a medical report (PDF/Image).
2. **Extract** text using LlamaParse.
3. **Analyze** with the Groq API for AI-driven insights.
4. **Receive** a clear, patient-friendly explanation of the report.

This tool helps users quickly understand their medical reports without complex jargon. 🚀
