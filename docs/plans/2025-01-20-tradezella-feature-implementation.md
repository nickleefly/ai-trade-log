# AI Trading Journal - TradeZella-Inspired Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a comprehensive AI-powered trading journal application inspired by TradeZella's feature set, focusing on trade tracking, analytics, progress tracking, and educational content.

**Architecture:** Next.js 14+ with App Router, TypeScript, Prisma ORM, PostgreSQL, NextAuth.js for authentication, and shadcn/ui for components. The application follows a modular architecture with separate domains for tracking, backtesting, notebook, and reporting.

**Tech Stack:** Next.js 14, TypeScript, Prisma, PostgreSQL, NextAuth.js, shadcn/ui, Tailwind CSS, Recharts for analytics, Zustand for state management

---

## Table of Contents
1. [Phase 1: Core Infrastructure & Setup](#phase-1-core-infrastructure--setup)
2. [Phase 2: Trade Entry & Management](#phase-2-trade-entry--management)
3. [Phase 3: Dashboard & Analytics](#phase-3-dashboard--analytics)
4. [Phase 4: Reports System](#phase-4-reports-system)
5. [Phase 5: Notebook & Notes](#phase-5-notebook--notes)
6. [Phase 6: Progress Tracker](#phase-6-progress-tracker)
7. [Phase 7: Strategies/Playbooks](#phase-7-strategiesplaybooks)
8. [Phase 8: Backtesting Module](#phase-8-backtesting-module)
9. [Phase 9: Resources & Economic Calendar](#phase-9-resources--economic-calendar)
10. [Phase 10: Mentor/Mentee Mode](#phase-10-mentormentee-mode)

---

## Phase 1: Core Infrastructure & Setup

### Task 1.1: Initialize Next.js Project with TypeScript

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`

**Step 1: Create Next.js project**

```bash
npx create-next-app@latest ai-trading-journal --typescript --tailwind --app --src-dir --import-alias "@/*"
cd ai-trading-journal
```

**Step 2: Install additional dependencies**

```bash
npm install prisma @prisma/client next-auth @auth/prisma-adapter bcryptjs date-fns zustand recharts lucide-react class-variance-authority clsx tailwind-merge
npm install -D @types/bcryptjs @types/node
```

**Step 3: Initialize shadcn/ui**

```bash
npx shadcn-ui@latest init
```

Expected: Interactive CLI prompts completed, components configured

**Step 4: Commit**

```bash
git add .
git commit -m "feat: initialize Next.js project with TypeScript and shadcn/ui"
```

### Task 1.2: Setup Database Schema

**Files:**
- Create: `prisma/schema.prisma`
- Modify: `.env`

**Step 1: Create Prisma schema**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  accounts      Account[]
  sessions      Session[]
  trades        Trade[]
  notes         Note[]
  strategies    Strategy[]
  progressLogs  ProgressLog[]
  accounts      TradingAccount[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessions          Session[]
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @unique([identifier, token])
}

model TradingAccount {
  id          String   @id @default(cuid())
  userId      String
  name        String
  accountType String   // Live, Demo, Prop
  balance     Decimal  @db.Decimal(10, 2)
  currency    String   @default("USD")
  isActive    Boolean  @default(true)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  trades      Trade[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Trade {
  id               String      @id @default(cuid())
  userId           String
  accountId        String
  symbol           String
  direction        Direction   // LONG, SHORT
  entryPrice       Decimal     @db.Decimal(10, 4)
  exitPrice        Decimal?    @db.Decimal(10, 4)
  quantity         Decimal     @db.Decimal(10, 4)
  entryTime        DateTime
  exitTime         DateTime?
  status           TradeStatus @default(OPEN)
  pnl              Decimal?    @db.Decimal(10, 2)
  commission       Decimal?    @db.Decimal(10, 2) @default(0)
  stopLoss         Decimal?    @db.Decimal(10, 4)
  takeProfit       Decimal?    @db.Decimal(10, 4)
  tags             String[]
  strategyId       String?
  notes            String?     @db.Text
  screenshots      String[]
  emotionBefore    String?
  emotionAfter     String?
  planAdherence    Boolean?
  user             User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  account          TradingAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  strategy         Strategy?   @relation(fields: [strategyId], references: [id])
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt
}

model Strategy {
  id            String   @id @default(cuid())
  userId        String
  name          String
  description   String?  @db.Text
  trades        Trade[]
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Note {
  id          String   @id @default(cuid())
  userId      String
  title       String
  content     String   @db.Text
  folder      String?
  tags        String[]
  isPinned    Boolean  @default(false)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ProgressRule {
  id          String   @id @default(cuid())
  name        String
  type        RuleType
  condition   String   @db.Text
  targetDays  String[]
  isActive    Boolean  @default(true)
  order       Int      @default(0)
  logs        ProgressLog[]
  createdAt   DateTime @default(now())
}

model ProgressLog {
  id          String       @id @default(cuid())
  userId      String
  ruleId      String
  date        DateTime     @default(now())
  completed   Boolean
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  rule        ProgressRule @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  @@unique([userId, ruleId, date])
}

enum Direction {
  LONG
  SHORT
}

enum TradeStatus {
  OPEN
  CLOSED
  CANCELLED
}

enum RuleType {
  MANUAL
  AUTOMATED
}
```

**Step 2: Create .env file**

```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_trading_journal"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

**Step 3: Generate Prisma client**

```bash
npx prisma generate
```

Expected: Prisma Client generated successfully

**Step 4: Create initial migration**

```bash
npx prisma migrate dev --name init
```

Expected: Migration created and database schema applied

**Step 5: Commit**

```bash
git add prisma .env
git commit -m "feat: setup database schema with Prisma"
```

### Task 1.3: Setup NextAuth.js Authentication

**Files:**
- Create: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`

**Step 1: Create auth configuration**

```typescript
// src/lib/auth.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }

        return user
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}
```

**Step 2: Create API route**

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**Step 3: Create Prisma client singleton**

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

**Step 4: Commit**

```bash
git add src/lib src/app/api/auth
git commit -m "feat: setup NextAuth.js authentication"
```

---

## Phase 2: Trade Entry & Management

### Task 2.1: Create Add Trade Modal Component

**Files:**
- Create: `src/components/trades/add-trade-modal.tsx`, `src/components/trades/trade-form.tsx`

**Step 1: Create trade form component**

```typescript
// src/components/trades/trade-form.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TradeFormProps {
  onSubmit: (data: TradeFormData) => void
  accounts: TradingAccount[]
  strategies: Strategy[]
}

export interface TradeFormData {
  accountId: string
  symbol: string
  direction: "LONG" | "SHORT"
  entryPrice: number
  exitPrice?: number
  quantity: number
  entryTime: Date
  exitTime?: Date
  stopLoss?: number
  takeProfit?: number
  tags: string[]
  strategyId?: string
  notes?: string
  emotionBefore?: string
  emotionAfter?: string
  planAdherence?: boolean
}

export function TradeForm({ onSubmit, accounts, strategies }: TradeFormProps) {
  const [formData, setFormData] = useState<TradeFormData>({
    accountId: accounts[0]?.id || "",
    symbol: "",
    direction: "LONG",
    entryPrice: 0,
    quantity: 0,
    entryTime: new Date(),
    tags: [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="account">Account</Label>
          <Select
            value={formData.accountId}
            onValueChange={(value) => setFormData({ ...formData, accountId: value })}
          >
            <SelectTrigger id="account">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="symbol">Symbol</Label>
          <Input
            id="symbol"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            placeholder="AAPL, SPY, etc."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="direction">Direction</Label>
          <Select
            value={formData.direction}
            onValueChange={(value: "LONG" | "SHORT") => setFormData({ ...formData, direction: value })}
          >
            <SelectTrigger id="direction">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LONG">Long</SelectItem>
              <SelectItem value="SHORT">Short</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="entryPrice">Entry Price</Label>
          <Input
            id="entryPrice"
            type="number"
            step="0.01"
            value={formData.entryPrice || ""}
            onChange={(e) => setFormData({ ...formData, entryPrice: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            value={formData.quantity || ""}
            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Entry Time</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                {formData.entryTime?.toLocaleDateString()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.entryTime}
                onSelect={(date) => date && setFormData({ ...formData, entryTime: date })}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stopLoss">Stop Loss (optional)</Label>
          <Input
            id="stopLoss"
            type="number"
            step="0.01"
            value={formData.stopLoss || ""}
            onChange={(e) => setFormData({ ...formData, stopLoss: parseFloat(e.target.value) || undefined })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="takeProfit">Take Profit (optional)</Label>
          <Input
            id="takeProfit"
            type="number"
            step="0.01"
            value={formData.takeProfit || ""}
            onChange={(e) => setFormData({ ...formData, takeProfit: parseFloat(e.target.value) || undefined })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add trade notes..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Save Trade</Button>
      </div>
    </form>
  )
}
```

**Step 2: Create add trade modal**

```typescript
// src/components/trades/add-trade-modal.tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TradeForm, TradeFormData } from "./trade-form"
import { useState } from "react"

interface AddTradeModalProps {
  onTradeAdded: () => void
}

export function AddTradeModal({ onTradeAdded }: AddTradeModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: TradeFormData) => {
    setLoading(true)
    try {
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setOpen(false)
        onTradeAdded()
      }
    } catch (error) {
      console.error("Failed to add trade:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Trade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Trade</DialogTitle>
          <DialogDescription>
            Record the details of your trade for tracking and analysis.
          </DialogDescription>
        </DialogHeader>
        <TradeForm onSubmit={handleSubmit} accounts={[]} strategies={[]} />
      </DialogContent>
    </Dialog>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/trades
git commit -m "feat: create add trade modal and form components"
```

### Task 2.2: Create Trade API Endpoint

**Files:**
- Create: `src/app/api/trades/route.ts`

**Step 1: Write the API endpoint**

```typescript
// src/app/api/trades/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const {
      accountId,
      symbol,
      direction,
      entryPrice,
      exitPrice,
      quantity,
      entryTime,
      exitTime,
      stopLoss,
      takeProfit,
      tags,
      strategyId,
      notes,
      emotionBefore,
      emotionAfter,
      planAdherence,
    } = data

    // Calculate PnL if exit price provided
    let pnl: number | null = null
    if (exitPrice) {
      const priceDiff = direction === "LONG"
        ? parseFloat(exitPrice) - parseFloat(entryPrice)
        : parseFloat(entryPrice) - parseFloat(exitPrice)
      pnl = priceDiff * parseFloat(quantity)
    }

    const trade = await prisma.trade.create({
      data: {
        userId: session.user.id,
        accountId,
        symbol: symbol.toUpperCase(),
        direction,
        entryPrice,
        exitPrice: exitPrice || null,
        quantity,
        entryTime: new Date(entryTime),
        exitTime: exitTime ? new Date(exitTime) : null,
        status: exitPrice ? "CLOSED" : "OPEN",
        pnl,
        stopLoss,
        takeProfit,
        tags: tags || [],
        strategyId,
        notes,
        emotionBefore,
        emotionAfter,
        planAdherence,
      },
    })

    return NextResponse.json(trade)
  } catch (error) {
    console.error("Failed to create trade:", error)
    return NextResponse.json(
      { error: "Failed to create trade" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const accountId = searchParams.get("accountId")

    const where: any = { userId: session.user.id }

    if (startDate || endDate) {
      where.entryTime = {}
      if (startDate) where.entryTime.gte = new Date(startDate)
      if (endDate) where.entryTime.lte = new Date(endDate)
    }

    if (accountId && accountId !== "all") {
      where.accountId = accountId
    }

    const trades = await prisma.trade.findMany({
      where,
      include: {
        account: true,
        strategy: true,
      },
      orderBy: { entryTime: "desc" },
    })

    return NextResponse.json(trades)
  } catch (error) {
    console.error("Failed to fetch trades:", error)
    return NextResponse.json(
      { error: "Failed to fetch trades" },
      { status: 500 }
    )
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/trades
git commit -m "feat: create trades API endpoint"
```

---

## Phase 3: Dashboard & Analytics

### Task 3.1: Create Dashboard Page

**Files:**
- Create: `src/app/dashboard/page.tsx`, `src/components/dashboard/dashboard-metrics.tsx`

**Step 1: Create dashboard metrics component**

```typescript
// src/components/dashboard/dashboard-metrics.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"

interface DashboardMetricsProps {
  startDate?: string
  endDate?: string
  accountId?: string
}

export function DashboardMetrics({ startDate, endDate, accountId }: DashboardMetricsProps) {
  const { data: metrics } = useQuery({
    queryKey: ["dashboard-metrics", startDate, endDate, accountId],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (startDate) params.set("startDate", startDate)
      if (endDate) params.set("endDate", endDate)
      if (accountId) params.set("accountId", accountId)

      const response = await fetch(`/api/trades/metrics?${params}`)
      return response.json()
    },
  })

  const metricsData = [
    { title: "Net P&L", value: metrics?.netPnl || "$0", format: "currency" },
    { title: "Trade Win %", value: metrics?.winRate || "--", format: "percentage" },
    { title: "Profit Factor", value: metrics?.profitFactor || "--", format: "number" },
    { title: "Day Win %", value: metrics?.dayWinRate || "--", format: "percentage" },
    { title: "Avg Win", value: metrics?.avgWin || "$0", format: "currency" },
    { title: "Avg Loss", value: metrics?.avgLoss || "$0", format: "currency" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metricsData.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

**Step 2: Create dashboard page**

```typescript
// src/app/dashboard/page.tsx
"use client"

import { useState } from "react"
import { AddTradeModal } from "@/components/trades/add-trade-modal"
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { RecentTrades } from "@/components/dashboard/recent-trades"
import { PnLChart } from "@/components/dashboard/pnl-chart"
import { CalendarHeatmap } from "@/components/dashboard/calendar-heatmap"

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined })
  const [selectedAccount, setSelectedAccount] = useState("all")
  const [refreshKey, setRefreshKey] = useState(0)

  const handleTradeAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <AddTradeModal onTradeAdded={handleTradeAdded} />
      </div>

      <div className="flex items-center gap-4">
        <DateRangePicker value={dateRange} onChange={setDateRange} />
        <AccountSelector
          value={selectedAccount}
          onChange={setSelectedAccount}
        />
      </div>

      <DashboardMetrics
        key={refreshKey}
        startDate={dateRange.from?.toISOString()}
        endDate={dateRange.to?.toISOString()}
        accountId={selectedAccount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PnLChart
          startDate={dateRange.from?.toISOString()}
          endDate={dateRange.to?.toISOString()}
          accountId={selectedAccount}
        />
        <CalendarHeatmap
          startDate={dateRange.from?.toISOString()}
          endDate={dateRange.to?.toISOString()}
        />
      </div>

      <RecentTrades
        key={refreshKey}
        startDate={dateRange.from?.toISOString()}
        endDate={dateRange.to?.toISOString()}
        accountId={selectedAccount}
      />
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/dashboard src/components/dashboard
git commit -m "feat: create dashboard page with metrics"
```

### Task 3.2: Create Trades Metrics API

**Files:**
- Create: `src/app/api/trades/metrics/route.ts`

**Step 1: Write metrics calculation endpoint**

```typescript
// src/app/api/trades/metrics/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const accountId = searchParams.get("accountId")

    const where: any = { userId: session.user.id, status: "CLOSED" }

    if (startDate || endDate) {
      where.entryTime = {}
      if (startDate) where.entryTime.gte = new Date(startDate)
      if (endDate) where.entryTime.lte = new Date(endDate)
    }

    if (accountId && accountId !== "all") {
      where.accountId = accountId
    }

    const trades = await prisma.trade.findMany({
      where,
      select: {
        pnl: true,
        entryTime: true,
      },
    })

    const winningTrades = trades.filter((t) => t.pnl && parseFloat(t.pnl.toString()) > 0)
    const losingTrades = trades.filter((t) => t.pnl && parseFloat(t.pnl.toString()) < 0)

    const netPnl = trades.reduce((sum, t) => sum + (parseFloat(t.pnl?.toString() || "0")), 0)
    const grossProfit = winningTrades.reduce((sum, t) => sum + parseFloat(t.pnl?.toString() || "0"), 0)
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + parseFloat(t.pnl?.toString() || "0"), 0))
    const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0
    const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0
    const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0

    // Calculate day win rate
    const tradesByDay = trades.reduce((acc, t) => {
      const day = t.entryTime.toISOString().split("T")[0]
      if (!acc[day]) acc[day] = { pnl: 0, count: 0 }
      acc[day].pnl += parseFloat(t.pnl?.toString() || "0")
      acc[day].count += 1
      return acc
    }, {} as Record<string, { pnl: number; count: number }>)

    const winningDays = Object.values(tradesByDay).filter((d) => d.pnl > 0).length
    const dayWinRate = Object.keys(tradesByDay).length > 0
      ? (winningDays / Object.keys(tradesByDay).length) * 100
      : 0

    return NextResponse.json({
      netPnl: `$${netPnl.toFixed(2)}`,
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: `${winRate.toFixed(1)}%`,
      profitFactor: profitFactor === Infinity ? "∞" : profitFactor.toFixed(2),
      avgWin: `$${avgWin.toFixed(2)}`,
      avgLoss: `$${avgLoss.toFixed(2)}`,
      dayWinRate: `${dayWinRate.toFixed(1)}%`,
    })
  } catch (error) {
    console.error("Failed to fetch metrics:", error)
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    )
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/trades/metrics
git commit -m "feat: create trades metrics API endpoint"
```

---

## Phase 4: Reports System

### Task 4.1: Create Reports Page with Tabs

**Files:**
- Create: `src/app/reports/page.tsx`, `src/components/reports/performance-report.tsx`

**Step 1: Create reports page**

```typescript
// src/app/reports/page.tsx
"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PerformanceReport } from "@/components/reports/performance-report"
import { OverviewReport } from "@/components/reports/overview-report"
import { CompareReport } from "@/components/reports/compare-report"
import { CalendarReport } from "@/components/reports/calendar-report"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <PerformanceReport />
        </TabsContent>

        <TabsContent value="overview">
          <OverviewReport />
        </TabsContent>

        <TabsContent value="compare">
          <CompareReport />
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Step 2: Create performance report component**

```typescript
// src/components/reports/performance-report.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"

export function PerformanceReport() {
  const { data: performance } = useQuery({
    queryKey: ["performance-report"],
    queryFn: async () => {
      const response = await fetch("/api/reports/performance")
      return response.json()
    },
  })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Performance Report</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Expectancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {performance?.expectancy || "$0"}
            </div>
            <p className="text-sm text-muted-foreground">
              Average profit/loss per trade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {performance?.sharpeRatio || "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {performance?.maxDrawdown || "$0"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add charts and tables for detailed performance analysis */}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/reports src/components/reports
git commit -m "feat: create reports page with performance tab"
```

---

## Phase 5: Notebook & Notes

### Task 5.1: Create Notebook Page

**Files:**
- Create: `src/app/notebook/page.tsx`, `src/components/notebook/note-list.tsx`, `src/components/notebook/note-editor.tsx`

**Step 1: Create notebook page**

```typescript
// src/app/notebook/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NoteList } from "@/components/notebook/note-list"
import { NoteEditor } from "@/components/notebook/note-editor"
import { FolderTree } from "@/components/notebook/folder-tree"
import { TagCloud } from "@/components/notebook/tag-cloud"
import { Plus, Search } from "lucide-react"

export default function NotebookPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r p-4 space-y-4">
        <Button className="w-full" onClick={() => setIsEditing(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>

        <div className="space-y-2">
          <h3 className="font-semibold">Folders</h3>
          <FolderTree />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Tags</h3>
          <TagCloud />
        </div>
      </div>

      {/* Note List */}
      <div className="w-80 border-r p-4">
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <NoteList
          searchQuery={searchQuery}
          selectedNote={selectedNote}
          onSelectNote={setSelectedNote}
        />
      </div>

      {/* Note Editor */}
      <div className="flex-1">
        <NoteEditor
          noteId={selectedNote}
          isEditing={isEditing}
          onClose={() => {
            setIsEditing(false)
            setSelectedNote(null)
          }}
        />
      </div>
    </div>
  )
}
```

**Step 2: Create notes API endpoint**

```typescript
// src/app/api/notes/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, folder, tags } = await req.json()

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        title,
        content,
        folder,
        tags: tags || [],
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error("Failed to create note:", error)
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")
    const folder = searchParams.get("folder")

    const where: any = { userId: session.user.id }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ]
    }

    if (folder) {
      where.folder = folder
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Failed to fetch notes:", error)
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    )
  }
}
```

**Step 3: Commit**

```bash
git add src/app/notebook src/components/notebook src/app/api/notes
git commit -m "feat: create notebook page with notes API"
```

---

## Phase 6: Progress Tracker

### Task 6.1: Create Progress Tracker Page

**Files:**
- Create: `src/app/progress-tracker/page.tsx`, `src/components/progress/daily-checklist.tsx`, `src/components/progress/calendar-heatmap.tsx`

**Step 1: Create progress tracker page**

```typescript
// src/app/progress-tracker/page.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DailyChecklist } from "@/components/progress/daily-checklist"
import { ProgressCalendar } from "@/components/progress/progress-calendar"
import { StreakCounter } from "@/components/progress/streak-counter"
import { EditRulesDialog } from "@/components/progress/edit-rules-dialog"
import { Settings } from "lucide-react"

export default function ProgressTrackerPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [editRulesOpen, setEditRulesOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Progress Tracker</h1>
        <Button variant="outline" onClick={() => setEditRulesOpen(true)}>
          <Settings className="mr-2 h-4 w-4" />
          Edit Rules
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StreakCounter />
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Daily Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyChecklist date={selectedDate} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressCalendar onDateSelect={setSelectedDate} />
        </CardContent>
      </Card>

      <EditRulesDialog open={editRulesOpen} onClose={() => setEditRulesOpen(false)} />
    </div>
  )
}
```

**Step 2: Create daily checklist component**

```typescript
// src/components/progress/daily-checklist.tsx
"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface DailyChecklistProps {
  date: Date
}

export function DailyChecklist({ date }: DailyChecklistProps) {
  const queryClient = useQueryClient()

  const { data: rules } = useQuery({
    queryKey: ["progress-rules"],
    queryFn: async () => {
      const response = await fetch("/api/progress/rules")
      return response.json()
    },
  })

  const { data: logs } = useQuery({
    queryKey: ["progress-logs", date],
    queryFn: async () => {
      const response = await fetch(`/api/progress/logs?date=${date.toISOString()}`)
      return response.json()
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ ruleId, completed }: { ruleId: string; completed: boolean }) => {
      const response = await fetch("/api/progress/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleId, date: date.toISOString(), completed }),
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress-logs", date] })
      queryClient.invalidateQueries({ queryKey: ["progress-streak"] })
    },
  })

  const completedCount = logs?.filter((l: any) => l.completed).length || 0
  const totalCount = rules?.length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          {date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
        </h3>
        <span className="text-sm text-muted-foreground">
          {completedCount}/{totalCount} completed
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Manual Rules</h4>
          <div className="space-y-2">
            {rules?.filter((r: any) => r.type === "MANUAL").map((rule: any) => {
              const log = logs?.find((l: any) => l.ruleId === rule.id)
              return (
                <div key={rule.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={rule.id}
                    checked={log?.completed || false}
                    onCheckedChange={(checked) =>
                      toggleMutation.mutate({ ruleId: rule.id, completed: !!checked })
                    }
                  />
                  <Label htmlFor={rule.id} className="cursor-pointer">
                    {rule.name}
                  </Label>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Automated Rules</h4>
          <div className="space-y-2">
            {rules?.filter((r: any) => r.type === "AUTOMATED").map((rule: any) => {
              const log = logs?.find((l: any) => l.ruleId === rule.id)
              return (
                <div key={rule.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{rule.name}</span>
                  <span className={`text-sm font-medium ${log?.completed ? "text-green-600" : "text-red-600"}`}>
                    {log?.completed ? "✓ Passed" : "✗ Failed"}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/progress-tracker src/components/progress
git commit -m "feat: create progress tracker page with daily checklist"
```

---

## Phase 7: Strategies/Playbooks

### Task 7.1: Create Strategies Page

**Files:**
- Create: `src/app/strategies/page.tsx`, `src/components/strategies/strategy-list.tsx`, `src/components/strategies/strategy-card.tsx`

**Step 1: Create strategies page**

```typescript
// src/app/strategies/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StrategyList } from "@/components/strategies/strategy-list"
import { CreateStrategyDialog } from "@/components/strategies/create-strategy-dialog"
import { Plus } from "lucide-react"

export default function StrategiesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Strategies</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Strategy
        </Button>
      </div>

      <Tabs defaultValue="my-strategies">
        <TabsList>
          <TabsTrigger value="my-strategies">My Strategies</TabsTrigger>
          <TabsTrigger value="shared">Shared with me</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="my-strategies">
          <StrategyList key={refreshKey} type="my-strategies" />
        </TabsContent>

        <TabsContent value="shared">
          <StrategyList type="shared" />
        </TabsContent>

        <TabsContent value="templates">
          <StrategyList type="templates" />
        </TabsContent>
      </Tabs>

      <CreateStrategyDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={() => {
          setCreateDialogOpen(false)
          setRefreshKey((prev) => prev + 1)
        }}
      />
    </div>
  )
}
```

**Step 2: Create strategy card component**

```typescript
// src/components/strategies/strategy-card.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface StrategyCardProps {
  strategy: {
    id: string
    name: string
    description?: string
    _count?: {
      trades: number
    }
    stats?: {
      totalPnl: number
      profitFactor: number
      winRate: number
      avgWinner: number
      avgLoser: number
    }
  }
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{strategy.name}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {strategy.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {strategy.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Trades:</span>{" "}
              <span className="font-medium">{strategy._count?.trades || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total P&L:</span>{" "}
              <span className={`font-medium ${(strategy.stats?.totalPnl || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${strategy.stats?.totalPnl?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Profit Factor:</span>{" "}
              <span className="font-medium">{strategy.stats?.profitFactor?.toFixed(2) || "N/A"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Win Rate:</span>{" "}
              <span className="font-medium">{strategy.stats?.winRate?.toFixed(1) || 0}%</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge variant={strategy.stats?.totalPnl >= 0 ? "default" : "destructive"}>
              {strategy.stats?.totalPnl >= 0 ? "Profitable" : "Unprofitable"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/strategies src/components/strategies
git commit -m "feat: create strategies page with strategy cards"
```

---

## Phase 8: Backtesting Module

### Task 8.1: Create Backtesting Sessions Page

**Files:**
- Create: `src/app/backtesting/page.tsx`, `src/components/backtesting/session-list.tsx`, `src/components/backtesting/create-session-dialog.tsx`

**Step 1: Create backtesting page**

```typescript
// src/app/backtesting/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreateSessionDialog } from "@/components/backtesting/create-session-dialog"
import { SessionList } from "@/components/backtesting/session-list"
import { Plus } from "lucide-react"

export default function BacktestingPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backtesting</h1>
          <p className="text-muted-foreground">
            Test your strategies with historical market data
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Session
        </Button>
      </div>

      <SessionList key={refreshKey} />

      <CreateSessionDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={() => {
          setCreateDialogOpen(false)
          setRefreshKey((prev) => prev + 1)
        }}
      />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/backtesting src/components/backtesting
git commit -m "feat: create backtesting page with session management"
```

---

## Phase 9: Resources & Economic Calendar

### Task 9.1: Create Resources Page with Economic Calendar

**Files:**
- Create: `src/app/resources/page.tsx`, `src/components/resources/economic-calendar.tsx`

**Step 1: Create resources page**

```typescript
// src/app/resources/page.tsx
"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EconomicCalendar } from "@/components/resources/economic-calendar"

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Resources</h1>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Economic Calendar</TabsTrigger>
          <TabsTrigger value="news">Market News</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <EconomicCalendar />
        </TabsContent>

        <TabsContent value="news">
          <div className="text-center py-12 text-muted-foreground">
            Market news coming soon...
          </div>
        </TabsContent>

        <TabsContent value="education">
          <div className="text-center py-12 text-muted-foreground">
            Educational resources coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/resources src/components/resources
git commit -m "feat: create resources page with economic calendar"
```

---

## Phase 10: Mentor/Mentee Mode

### Task 10.1: Create Mentor Mode Page

**Files:**
- Create: `src/app/mentor/page.tsx`, `src/components/mentor/mentor-mode.tsx`, `src/components/mentor/mentee-mode.tsx`

**Step 1: Create mentor page**

```typescript
// src/app/mentor/page.tsx
"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MentorMode } from "@/components/mentor/mentor-mode"
import { MenteeMode } from "@/components/mentor/mentee-mode"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"

export default function MentorPage() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mentor Mode</h1>
          <p className="text-muted-foreground">
            Connect with mentors or mentor other traders
          </p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite
        </Button>
      </div>

      <Tabs defaultValue="mentor">
        <TabsList>
          <TabsTrigger value="mentor">Mentor Mode</TabsTrigger>
          <TabsTrigger value="mentee">Student Mode</TabsTrigger>
        </TabsList>

        <TabsContent value="mentor">
          <MentorMode />
        </TabsContent>

        <TabsContent value="mentee">
          <MenteeMode />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/mentor src/components/mentor
git commit -m "feat: create mentor/mentee mode page"
```

---

## Implementation Summary

This plan provides a comprehensive roadmap for building an AI-powered trading journal application inspired by TradeZella. The implementation is divided into 10 phases, each focusing on a specific module:

1. **Core Infrastructure**: Project setup, database schema, authentication
2. **Trade Entry & Management**: Add/edit trades, trade form, API endpoints
3. **Dashboard & Analytics**: Key metrics, P&L charts, calendar heatmap
4. **Reports System**: Performance, overview, compare, calendar reports
5. **Notebook**: Note-taking with folders, tags, search
6. **Progress Tracker**: Daily checklist, habit tracking, streak counter
7. **Strategies/Playbooks**: Create and track trading strategies
8. **Backtesting**: Simulate trades with historical data
9. **Resources**: Economic calendar, market news
10. **Mentor Mode**: Connect mentors and mentees

Each task includes specific files to create/modify, complete code implementations, and commit messages for version control.

---

**For execution:** Use `superpowers:executing-plans` skill to implement this plan task-by-task with checkpoints and reviews.
