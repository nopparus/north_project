
export type RDMode = 'RD03' | 'RD05';

export type Operator = 'equals' | 'contains' | 'between' | 'in_list' | 'gt' | 'gte' | 'lt' | 'lte';

export interface Condition {
  column: string;
  operator: Operator;
  value: any;
}

export interface GroupRule {
  id: string;
  name: string;
  conditions: Condition[];
  priority: number;
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
