export interface AccountCredentials {
  id: string;
  name: string;
  email: string;
  globalAPIKey: string;
  accountId?: string;
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface AccountFormData {
  name: string;
  email: string;
  globalAPIKey: string;
  accountId?: string;
  tags?: string[];
  notes?: string;
}

export interface AccountListItem extends AccountCredentials {
  workerCount?: number;
  lastUsed?: Date;
} 