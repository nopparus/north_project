export enum ValidationStatus {
  Pending = 'Pending',
  Valid = 'Valid',
  Invalid = 'Invalid',
}

export interface SheetInfo {
  sheetName: string;
  headers: string[];
  data: (string | number)[][];
  rowCount: number;
  status: ValidationStatus;
}

export interface FileInfo {
  id: string;
  file: File;
  sheets: SheetInfo[];
}