
export interface ActionItem {
  task: string;
  owner: string;
  deadline: string;
}

export interface MeetingReport {
  summary: string;
  action_items: ActionItem[];
  decisions: string[];
  whatsapp_followup: string;
  email_followup: string;
}

export type AppState = 'IDLE' | 'UPLOADING' | 'PROCESSING' | 'RESULT' | 'ERROR';
