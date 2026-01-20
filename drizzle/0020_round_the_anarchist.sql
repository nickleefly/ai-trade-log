CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"broker" text NOT NULL,
	"account_type" text DEFAULT 'live',
	"currency" text DEFAULT 'USD',
	"initial_balance" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trade_id" text NOT NULL,
	"type" text NOT NULL,
	"price" text NOT NULL,
	"quantity" text NOT NULL,
	"executed_at" timestamp with time zone NOT NULL,
	"commission" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "notebooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"content" jsonb,
	"linked_trade_ids" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#3B82F6',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trade_id" text NOT NULL,
	"tag_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "stop_loss" text;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "take_profit" text;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "planned_r" text;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "realized_r" text;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "commission" text;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "slippage" text;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "emotion_before" text;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "emotion_after" text;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "setup" text;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "timeframe" text;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "screenshot_url" text;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "account_id" uuid;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notebooks" ADD CONSTRAINT "notebooks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_tags" ADD CONSTRAINT "trade_tags_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_tags" ADD CONSTRAINT "trade_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "executions_trade_id_idx" ON "executions" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "notebooks_user_id_idx" ON "notebooks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notebooks_type_idx" ON "notebooks" USING btree ("type");--> statement-breakpoint
CREATE INDEX "trade_tags_trade_id_idx" ON "trade_tags" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "trade_tags_tag_id_idx" ON "trade_tags" USING btree ("tag_id");