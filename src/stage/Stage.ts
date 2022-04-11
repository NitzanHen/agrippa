import { AgrippaDir, AgrippaFile } from '../AgrippaFile';
import { Config } from '../config';
import { styles } from '../logger';


export interface Context {
  config: Config;
  createdFiles: AgrippaFile[];
  createdDirs: AgrippaDir[];
}

export type Stage = (context: Context, logger: Console) => Promise<StageResult>;

export interface StageResult {
  status: StageStatus,
  summary: string,
  newContext?: Context
}

export const stageStatusBullets: Record<StageStatus, string> = {
  success: '✓',
  warning: '✓',
  error: '✗',
  NA: '•',
};

export enum StageStatus {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  NA = 'NA'
}

export const stageResult = (status: StageStatus, summary: string, newContext?: Context): StageResult => ({ status, summary, newContext });

/** @todo find a better place for this? */
export const summaryLine = ({ status, summary }: StageResult) => styles[status].bold(`${ stageStatusBullets[status]} ${summary}`);


