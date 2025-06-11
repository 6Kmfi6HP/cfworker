import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AccountCredentials, AccountFormData } from '../types/account';
import { encryptedStorage } from '../services/storage';
import { apiClient } from '../services/apiClient';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '../hooks/use-toast';

interface AccountContextType {
  accounts: AccountCredentials[];
  currentAccount: AccountCredentials | null;
  loading: boolean;
  setCurrentAccount: (account: AccountCredentials | null) => void;
  addAccount: (accountData: AccountFormData) => Promise<void>;
  updateAccount: (id: string, accountData: Partial<AccountFormData>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  refreshAccounts: () => Promise<void>;
  getCurrentCredentials: () => { email: string; globalAPIKey: string } | null;
  selectedAccount: AccountCredentials | null;
  setSelectedAccount: (account: AccountCredentials | null) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};

interface AccountProviderProps {
  children: ReactNode;
}

export const AccountProvider: React.FC<AccountProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<AccountCredentials[]>([]);
  const [currentAccount, setCurrentAccountState] = useState<AccountCredentials | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountCredentials | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize storage and load accounts
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        await encryptedStorage.init();
        await refreshAccounts();
        
        // Load current account from localStorage
        const savedCurrentAccountId = localStorage.getItem('currentAccountId');
        if (savedCurrentAccountId) {
          const account = await encryptedStorage.getAccount(savedCurrentAccountId);
          if (account && account.isActive) {
            setCurrentAccountState(account);
            // Initialize API client with current account credentials
            apiClient.setCredentials({
              email: account.email,
              globalAPIKey: account.globalAPIKey,
            });
          }
        }
      } catch (error) {
        console.error('Failed to initialize storage:', error);
        toast({ title: 'Failed to initialize account storage', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    initializeStorage();
  }, []);

  const refreshAccounts = async () => {
    try {
      const allAccounts = await encryptedStorage.getAllAccounts();
      setAccounts(allAccounts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
    } catch (error) {
      console.error('Failed to load accounts:', error);
      toast({ title: 'Failed to load accounts', variant: 'destructive' });
    }
  };

  const setCurrentAccount = (account: AccountCredentials | null) => {
    setCurrentAccountState(account);
    
    // Update API client credentials
    if (account) {
      apiClient.setCredentials({
        email: account.email,
        globalAPIKey: account.globalAPIKey,
      });
      localStorage.setItem('currentAccountId', account.id);
      // Update last used timestamp
      const updatedAccount = { ...account, updatedAt: new Date() };
      encryptedStorage.updateAccount(updatedAccount);
    } else {
      apiClient.setCredentials(null);
      localStorage.removeItem('currentAccountId');
    }
  };

  const addAccount = async (accountData: AccountFormData) => {
    try {
      const now = new Date();
      const newAccount: AccountCredentials = {
        id: uuidv4(),
        ...accountData,
        createdAt: now,
        updatedAt: now,
        isActive: true,
      };

      await encryptedStorage.saveAccount(newAccount);
      await refreshAccounts();
      
      // If this is the first account, set it as current
      if (accounts.length === 0) {
        setCurrentAccount(newAccount);
      }
      
      toast({
        title: 'Account added successfully',
        description: 'New account has been added and encrypted securely.',
      });
    } catch (error) {
      console.error('Failed to add account:', error);
      toast({ title: 'Failed to add account', variant: 'destructive' });
      throw error;
    }
  };

  const updateAccount = async (id: string, accountData: Partial<AccountFormData>) => {
    try {
      const existingAccount = await encryptedStorage.getAccount(id);
      if (!existingAccount) {
        throw new Error('Account not found');
      }

      const updatedAccount: AccountCredentials = {
        ...existingAccount,
        ...accountData,
        updatedAt: new Date(),
      };

      await encryptedStorage.updateAccount(updatedAccount);
      await refreshAccounts();
      
      // Update current account if it's the one being updated
      if (currentAccount?.id === id) {
        setCurrentAccountState(updatedAccount);
      }
      
      toast({
        title: 'Account updated successfully',
        description: 'Account information has been updated and saved securely.',
      });
    } catch (error) {
      console.error('Failed to update account:', error);
      toast({ title: 'Failed to update account', variant: 'destructive' });
      throw error;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      await encryptedStorage.deleteAccount(id);
      await refreshAccounts();
      
      // Clear current account if it's the one being deleted
      if (currentAccount?.id === id) {
        setCurrentAccount(null);
      }
      
      toast({
        title: 'Account deleted successfully',
        description: 'Account has been permanently removed from storage.',
      });
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast({ title: 'Failed to delete account', variant: 'destructive' });
      throw error;
    }
  };

  const getCurrentCredentials = () => {
    if (!currentAccount) {
      return null;
    }
    return {
      email: currentAccount.email,
      globalAPIKey: currentAccount.globalAPIKey,
    };
  };

  const value: AccountContextType = {
    accounts,
    currentAccount,
    loading,
    setCurrentAccount,
    addAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts,
    getCurrentCredentials,
    selectedAccount,
    setSelectedAccount,
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
};