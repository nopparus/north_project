
export type RDMode = 'RD03' | 'RD05';

export type Operator = 'equals' | 'not_equals' | 'contains' | 'between' | 'in_list' | 'not_in_list' | 'gt' | 'gte' | 'lt' | 'lte';

export interface Condition {
  column: string;
  operator: Operator;
  value: any;
}

export interface GroupRule {
  id: string;
  name: string;
  resultValue?: string; // Explicit value to assign in Excel, defaults to id if missing
  conditions: Condition[];
  priority: number;
  targetField?: 'Group' | 'GroupConcession';
  description?: string; // User-facing description of the rule logic
}

export interface SummaryData {
  totalRows: number;
  groups: Record<string, number>;
  concessions: Record<string, number>;
  lineTypes: Record<string, number>;
  uniqueValues: {
    Line_Type: string[];
    Cores: number[];
    Diameter: number[];
    Concession: string[];
  };
}
