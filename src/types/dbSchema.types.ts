export interface Rule {
    id: string;
    rule: string;
    satisfied: boolean;
    priority: "low" | "medium" | "high";
}
