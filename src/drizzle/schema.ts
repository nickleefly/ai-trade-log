import { Rule } from "@/types/dbSchema.types";
import { relations } from "drizzle-orm";
import {
    boolean,
    index,
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

export const UserTable = pgTable("user", {
    id: text("id").notNull().unique(),
    name: text("name").notNull().default(""),
    email: text("email").notNull().default(""),
    capital: text("capital"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    tokens: integer("tokens").default(5),
    onboardingCompleted: boolean("onboarding_completed")
        .notNull()
        .default(false),
});

export const TradeTable = pgTable(
    "trades",
    {
        id: text("id").primaryKey().notNull(),
        userId: text("userId").notNull().references(() => UserTable.id),
        positionType: text("positionType").notNull(),
        openDate: text("openDate").notNull(),
        openTime: text("openTime").notNull(),
        closeDate: text("closeDate"),
        closeTime: text("closeTime"),
        isActiveTrade: boolean("isActiveTrade").default(true).notNull(),
        instrumentName: text("instrumentName").notNull(),
        symbolName: text("symbolName").notNull(),
        entryPrice: text("entryPrice"),
        deposit: text("deposit").notNull(),
        result: text("result"),
        totalCost: text("totalCost"),
        quantity: text("quantity"),
        sellPrice: text("sellPrice"),
        quantitySold: text("quantitySold"),
        notes: text("notes"),
        rating: integer("rating").default(0),
        strategyId: uuid("strategy_id").references(() => StrategyTable.id, {
            onDelete: "set null",
            onUpdate: "cascade",
        }),
        appliedOpenRules: jsonb("applied_open_rules").$type<Rule[]>(),
        appliedCloseRules: jsonb("applied_close_rules").$type<Rule[]>(),
        // TradeAnaly-style fields for enhanced analytics
        stopLoss: text("stop_loss"),              // Stop loss price
        takeProfit: text("take_profit"),          // Take profit price
        plannedR: text("planned_r"),              // Planned R-Multiple
        realizedR: text("realized_r"),            // Actual R-Multiple achieved
        commission: text("commission"),            // Trading fees/commissions
        slippage: text("slippage"),               // Entry/exit slippage
        emotionBefore: text("emotion_before"),    // Pre-trade psychology
        emotionAfter: text("emotion_after"),      // Post-trade psychology
        setup: text("setup"),                     // Trade setup type (breakout, pullback, etc.)
        timeframe: text("timeframe"),             // Chart timeframe used
        screenshotUrl: text("screenshot_url"),    // Chart screenshot URL
        accountId: uuid("account_id"),            // Multi-account support
    },
    (table) => ({
        userIdCloseDateIndex: index("userIdCloseDateIndex").on(
            table.userId,
            table.closeDate
        ),
        tradeStrategyIdIndex: index("trade_strategy_id_idx").on(
            table.strategyId
        ),
    })
);

export const StrategyTable = pgTable(
    "strategies",
    {
        id: uuid("id").primaryKey().notNull(),
        userId: text("userId")
            .notNull()
            .references(() => UserTable.id),
        strategyName: text("strategyName").notNull(),
        description: text("description"),
        openPositionRules: jsonb("open_position_rules").$type<Rule[]>().default([]).notNull(),
        closePositionRules: jsonb("close_position_rules").$type<Rule[]>().default([]).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => ({
        userIdIndex: index("strategy_user_id_idx").on(table.userId),
    })
);

export const StrategyRelations = relations(StrategyTable, ({ many }) => ({
    trades: many(TradeTable),
}));

export const TradeRelations = relations(TradeTable, ({ one, many }) => ({
    strategy: one(StrategyTable, {
        fields: [TradeTable.strategyId],
        references: [StrategyTable.id],
    }),
    tradeTags: many(TradeTagsTable),
    executions: many(ExecutionTable),
}));

export const ReportsTable = pgTable("reports", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    reportData: jsonb("report_data").notNull(),
    isFavorite: boolean("is_favorite").default(false).notNull(),
});

export const TransactionsTable = pgTable("transactions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    plan: text("plan").notNull(),
});

// New table for user-submitted feedback from the FeedbackCard
export const FeedbackTable = pgTable("feedbacks", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => UserTable.id),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

export const JournalTable = pgTable(
    "journal",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: text("user_id")
            .notNull()
            .references(() => UserTable.id),
        date: text("date").notNull(), // Stored as YYYY-MM-DD
        content: jsonb("content"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        userIdDateIndex: index("journal_user_id_date_idx").on(
            table.userId,
            table.date
        ),
    })
);

// ============================================
// TradeAnaly-style Tables
// ============================================

// TagTable - Custom tagging system for trade categorization
export const TagTable = pgTable("tags", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => UserTable.id),
    name: text("name").notNull(),
    color: text("color").default("#3B82F6"), // Default blue
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// TradeTagsTable - Many-to-many junction for trade tags
export const TradeTagsTable = pgTable(
    "trade_tags",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        tradeId: text("trade_id")
            .notNull()
            .references(() => TradeTable.id, { onDelete: "cascade" }),
        tagId: uuid("tag_id")
            .notNull()
            .references(() => TagTable.id, { onDelete: "cascade" }),
    },
    (table) => ({
        tradeIdIndex: index("trade_tags_trade_id_idx").on(table.tradeId),
        tagIdIndex: index("trade_tags_tag_id_idx").on(table.tagId),
    })
);

// ExecutionTable - Individual entries/exits for scaling in/out
export const ExecutionTable = pgTable(
    "executions",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        tradeId: text("trade_id")
            .notNull()
            .references(() => TradeTable.id, { onDelete: "cascade" }),
        type: text("type").notNull(), // "entry" | "exit" | "scale_in" | "scale_out"
        price: text("price").notNull(),
        quantity: text("quantity").notNull(),
        executedAt: timestamp("executed_at", { withTimezone: true }).notNull(),
        commission: text("commission"),
        notes: text("notes"),
    },
    (table) => ({
        tradeIdIndex: index("executions_trade_id_idx").on(table.tradeId),
    })
);

// NotebookFolderTable - Organization for notebooks
export const NotebookFolderTable = pgTable(
    "notebook_folders",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: text("user_id")
            .notNull()
            .references(() => UserTable.id),
        name: text("name").notNull(),
        parentId: uuid("parent_id"), // For nested folders
        color: text("color").default("#3B82F6"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        userIdIndex: index("notebook_folders_user_id_idx").on(table.userId),
    })
);

// NotebookTable - Trading plans, loss recaps, and templates
export const NotebookTable = pgTable(
    "notebooks",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: text("user_id")
            .notNull()
            .references(() => UserTable.id),
        title: text("title").notNull(),
        type: text("type").notNull(), // "trading_plan" | "loss_recap" | "template" | "weekly_review"
        content: jsonb("content"), // Rich text content
        folderId: uuid("folder_id").references(() => NotebookFolderTable.id, { onDelete: "set null" }),
        linkedTradeIds: jsonb("linked_trade_ids").$type<string[]>(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        userIdIndex: index("notebooks_user_id_idx").on(table.userId),
        typeIndex: index("notebooks_type_idx").on(table.type),
        folderIdIndex: index("notebooks_folder_id_idx").on(table.folderId),
    })
);

// AccountTable - Multi-account/broker support
export const AccountTable = pgTable(
    "accounts",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: text("user_id")
            .notNull()
            .references(() => UserTable.id),
        name: text("name").notNull(),
        broker: text("broker").notNull(), // "thinkorswim" | "ibkr" | "tradestation" | "sierra_chart" | etc.
        accountType: text("account_type").default("live"), // "live" | "demo" | "funded" | "paper"
        currency: text("currency").default("USD"),
        initialBalance: text("initial_balance"),
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        userIdIndex: index("accounts_user_id_idx").on(table.userId),
    })
);

// ============================================
// Relations for new tables
// ============================================

export const TagRelations = relations(TagTable, ({ many }) => ({
    tradeTags: many(TradeTagsTable),
}));

export const TradeTagRelations = relations(TradeTagsTable, ({ one }) => ({
    trade: one(TradeTable, {
        fields: [TradeTagsTable.tradeId],
        references: [TradeTable.id],
    }),
    tag: one(TagTable, {
        fields: [TradeTagsTable.tagId],
        references: [TagTable.id],
    }),
}));

export const ExecutionRelations = relations(ExecutionTable, ({ one }) => ({
    trade: one(TradeTable, {
        fields: [ExecutionTable.tradeId],
        references: [TradeTable.id],
    }),
}));

export const AccountRelations = relations(AccountTable, ({ one }) => ({
    user: one(UserTable, {
        fields: [AccountTable.userId],
        references: [UserTable.id],
    }),
}));
export const NotebookRelations = relations(NotebookTable, ({ one }) => ({
    folder: one(NotebookFolderTable, {
        fields: [NotebookTable.folderId],
        references: [NotebookFolderTable.id],
    }),
}));

export const NotebookFolderRelations = relations(NotebookFolderTable, ({ many, one }) => ({
    notebooks: many(NotebookTable),
    parent: one(NotebookFolderTable, {
        fields: [NotebookFolderTable.parentId],
        references: [NotebookFolderTable.id],
        relationName: "folder_nesting",
    }),
    children: many(NotebookFolderTable, {
        relationName: "folder_nesting",
    }),
}));
