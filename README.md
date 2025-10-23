#  WealthChain - Smart Investment Platform

A comprehensive investment platform with AI-powered portfolio analysis, real-time trading, and a gamified rewards system.

##  Features

- **Real-time Stock Trading**: Buy/sell stocks with live price updates
- **Visual Transaction Indicators**: Green (+) for purchases, Red (-) for sales
- **Portfolio Management**: Comprehensive profit/loss tracking
- **Live Price Feed**: Stock prices update every 3 seconds
- **NSE Large Deals**: Real-time institutional trading tracker with advanced filtering

###  **AI Investment Intelligence**
- **Investment Health Score**: 4-metric scoring system (0-100)
- **AI Investment Planner**: Personalized risk profiling and recommendations
- **Smart Analytics**: Automated portfolio optimization suggestions
- **Real-time Health Monitoring**: Quick health score on dashboard

###  **Market Intelligence**
- **Fresh News Feed**: Real-time stock market news
- **Category Filtering**: Technology, Finance, Energy, Healthcare, etc.
- **Sentiment Analysis**: News categorized by market impact
- **Auto-refresh**: Latest market updates every few minutes

###  **NSE Large Deals Tracker**
- **Real-time Deal Monitoring**: Live tracking of institutional block and bulk deals
- **Market Summary Dashboard**: Total deals, volume, and buy/sell breakdown analytics  
- **Advanced Filtering**: Filter deals by sector (IT, Banking, Energy, etc.) and deal type
- **Institutional Insights**: Track major institutional clients and their trading patterns
- **Deal Categories**: Comprehensive coverage of both Block Deals and Bulk Deals
- **Auto-refresh Updates**: New deals appear every 15-45 seconds automatically
- **Professional Data Display**: Large numbers formatted in Crores/Lakhs for easy reading
- **Time Tracking**: Shows how long ago each deal occurred with relative timestamps

###  **Rewards & Gamification**
- **Token Economy**: Earn 0.001 tokens per ₹1 invested (scarce economy)
- **Voucher Marketplace**: 10+ brands (Amazon, Nike, Netflix, Flipkart, etc.)
- **Daily Bonuses**: Progressive 7-day login reward cycles
- **Achievement System**: Multiple categories for user engagement
- **Level Progression**: Token-based ranking system

###  **Security & Backend**
- **Supabase Integration**: Secure authentication and real-time database
- **Spring Boot API**: Java backend for advanced analytics
- **Data Persistence**: All transactions and rewards automatically saved
- **Row Level Security**: Secure data access per user

##  Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **TanStack Query** for data fetching
- **Lucide React** for icons

### Backend
- **Supabase** (PostgreSQL database + Auth)
- **Spring Boot 3.2.0** with Java 17
- **Maven** for dependency management
- **REST API** for analytics

### Development Tools
- **Bun** package manager
- **ESLint** for code quality
- **PostCSS** for CSS processing

##  Getting Started

### Prerequisites
- Node.js 18+ (or Bun)
- Java 17+ (for Spring Boot backend)
- Git

### Installation

```bash
# Clone the repository
git clone <YOUR_REPO_URL>
cd wealthchain

# Install dependencies
bun install
# or npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase credentials to .env

# Start the development server
bun dev
# or npm run dev
```

### Backend Setup (Optional - for advanced analytics)

```bash
# Navigate to Spring Boot backend (if you have it)
cd spring-backend

# Run the Spring Boot application
./mvnw spring-boot:run
# or mvn spring-boot:run
```

The frontend will run on `http://localhost:8080`  
The backend API will run on `http://localhost:8081`

##  Database Setup

1. Create a [Supabase](https://supabase.com) project
2. Run the migrations in `/supabase/migrations/`
3. Update your `.env` file with Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

##  Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

##  Usage

1. **Sign Up/Login**: Create an account or login
2. **Explore Stocks**: Browse available stocks with live prices
3. **Start Trading**: Buy/sell stocks with real-time updates
4. **Monitor Health**: Check your investment health score
5. **Get AI Insights**: Use the AI planner for recommendations
6. **Read News**: Stay updated with market news
7. **Earn Rewards**: Collect tokens and redeem vouchers
8. **Monitor Large Deals**: Track institutional trading activity and market sentiment
9. **Filter by Sector**: Focus on specific sectors or deal types for targeted insights
10. **Track Progress**: Monitor your portfolio performance

##  Project Structure

wealthchain/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── StockCard.tsx   # Stock trading cards
│   ├── Navbar.tsx      # Navigation component
│   └── ...
├── pages/              # Main application pages
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Portfolio.tsx   # Portfolio management
│   ├── Groups.tsx      # Investment groups
│   ├── LargeDeals.tsx  # NSE large deals tracker
│   └── ...
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/      # Supabase client and types
├── services/           # Business logic and data services
│   ├── nseLargeDealsService.ts  # NSE deals data management
│   └── ...
├── lib/               # Utility functions
└── ...


##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) for the beautiful UI components
- [Lucide](https://lucide.dev) for the amazing icons
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework

---

**Built with  for smart investing**
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful components
- **Supabase** for backend and authentication
- **Spring Boot** for advanced analytics API
- **Bun** for package management


