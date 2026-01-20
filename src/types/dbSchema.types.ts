export interface Rule {
    id: string;
    rule: string;
    satisfied: boolean;
    priority: "low" | "medium" | "high";
}

export interface Account {
    id: string;
    userId: string;
    name: string;
    broker: string;
    accountType: string;
    currency: string;
    initialBalance: string | null;
    isActive: boolean;
    createdAt: string;
}
