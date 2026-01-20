## Important: Let’s make this journal better together! I want to create a product that works well for everyone. If there’s something you don’t like or a feature you’re missing, please share your thoughts in the Discussions section of this repository or in the Feedback section

# ⭐️ Support the project
This project is a personal passion, developed in my free time. If you find it useful, please give it a ⭐️. Your support means a lot and motivates me to keep improving the bot.



# 🔍 About

**TradeJournal** is a free, AI-powered platform that helps traders and investors track and improve their performance. By logging your trades, you can access analytics and AI-generated reports that show strengths, weaknesses, and areas for improvement.

---

## Why Use TradeJournal?

- **Unbiased AI insights** — Get objective analysis of your trades without emotional bias.  
- **Analytics that matter** — View your performance with clear, interactive charts.  
- **Easy trade logging** — Add and review trades quickly.  
- **All your history in one place** — Filter, sort, and analyze without spreadsheets.  
- **Focused improvement** — Understand what works and what doesn’t.

---

## Table of Contents
- [Tech Stack](#tech-stack)
- [Pages](#pages)
  - [Calendar](#calendar)
  - [History](#history)
  - [Statistics](#statistics)
  - [Strategies](#strategies)
- [Technicals](#technicals)

---

## Tech Stack

- **Next.js** for both the front end and back end (server actions)  
- **TypeScript** for type safety  
- **Redux Toolkit** for state management  
- **Neon PostgreSQL** with **Drizzle** for the database and database management  
- **MUI Charts** for charts and **Shadcn/Tailwind** for styling  
- **Zod** and **React Hook Form** for form validation  
- **Clerk** for authentication  
- **GSAP** for animations  
- **AI integration** for report generation

---

## Disclaimer

> [!WARNING]
> **No Financial Advice**  
> The content, tools, and features provided in this application do not constitute financial, investment, or trading advice. The platform is intended purely as an educational and analytical tool.  
>   
> **User Responsibility**  
> By using this software, you agree to take full responsibility for your trading decisions. Trading and investing involve risks, and you should never risk more than you can afford to lose.

---

## Pages

### Calendar
The Calendar page is where you log and review trades. Simple to use, but packed with features like month/year views and a complete history.  
- Click on any date to add a trade  
- Switch between months easily  

https://github.com/user-attachments/assets/409f9971-c9b4-419e-9f5a-e1ccd4c88354  

---

### History
The History page shows all your trades in one place.  

**Features**
- Filter by instrument, column, and time  
- Date range selection  
- Delete trades (editing coming soon)  

https://github.com/user-attachments/assets/8af7b6cd-cc16-4bfe-b11f-9d2ba912876f  

---

### Statistics
The Statistics page turns your trade history into charts using 10+ algorithms.

**Features**
- Same filtering as the History page  
- See what’s working and what’s not  

https://github.com/user-attachments/assets/8b8b333a-0bfc-432c-ad23-d74de50edba3

---

### Strategies
The Strategies page helps you create and measure rule-based trading plans.

**Features**
- Build rule-based trading strategies and track how each trade performs over time.
- The "Add New Trade" dialog includes your custom strategy rules, so you can track how well you followed them.
- The History page shows ratings and a strategies indicator, displaying the percentage of followed rules.

---

## Technicals

- **Redux global state** — Data fetched on initial load is stored in Redux for instant updates across pages.  
- **Optimistic updates** — Changes appear immediately; roll back automatically if there’s an error.  
- **Database optimization** — Indexed queries for speed with large datasets.

---