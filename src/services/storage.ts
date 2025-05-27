import { AccountCredentials } from '../types/account';

const DB_NAME = 'CFWorkerAccounts';
const DB_VERSION = 1;
const STORE_NAME = 'accounts';
const KEY_STORE_NAME = 'encryption_keys';

class EncryptedStorage {
  private db: IDBDatabase | null = null;
  private encryptionKey: CryptoKey | null = null;

  async init(): Promise<void> {
    await this.initDB();
    await this.initEncryptionKey();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create accounts store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const accountStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          accountStore.createIndex('email', 'email', { unique: false });
          accountStore.createIndex('isActive', 'isActive', { unique: false });
        }
        
        // Create encryption keys store
        if (!db.objectStoreNames.contains(KEY_STORE_NAME)) {
          db.createObjectStore(KEY_STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  private async initEncryptionKey(): Promise<void> {
    try {
      // Try to load existing key
      const storedKey = await this.getStoredEncryptionKey();
      if (storedKey) {
        this.encryptionKey = storedKey;
        return;
      }
      
      // Generate new key if none exists
      this.encryptionKey = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt']
      );
      
      await this.storeEncryptionKey(this.encryptionKey);
    } catch (error) {
      console.error('Failed to initialize encryption key:', error);
      throw error;
    }
  }

  private async getStoredEncryptionKey(): Promise<CryptoKey | null> {
    if (!this.db) return null;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([KEY_STORE_NAME], 'readonly');
      const store = transaction.objectStore(KEY_STORE_NAME);
      const request = store.get('master');
      
      request.onerror = () => reject(request.error);
      request.onsuccess = async () => {
        if (request.result) {
          try {
            const key = await window.crypto.subtle.importKey(
              'jwk',
              request.result.key,
              { name: 'AES-GCM' },
              true,
              ['encrypt', 'decrypt']
            );
            resolve(key);
          } catch (error) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
    });
  }

  private async storeEncryptionKey(key: CryptoKey): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const exportedKey = await window.crypto.subtle.exportKey('jwk', key);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([KEY_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(KEY_STORE_NAME);
      const request = store.put({ id: 'master', key: exportedKey });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async encrypt(data: string): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
    if (!this.encryptionKey) throw new Error('Encryption key not initialized');
    
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(data);
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      encoded
    );
    
    return { encrypted, iv };
  }

  private async decrypt(encrypted: ArrayBuffer, iv: Uint8Array): Promise<string> {
    if (!this.encryptionKey) throw new Error('Encryption key not initialized');
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  }

  async saveAccount(account: AccountCredentials): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    // Encrypt sensitive data
    const sensitiveData = {
      globalAPIKey: account.globalAPIKey,
      accountId: account.accountId,
    };
    
    const { encrypted, iv } = await this.encrypt(JSON.stringify(sensitiveData));
    
    const encryptedAccount = {
      ...account,
      globalAPIKey: '', // Remove from plain object
      accountId: '', // Remove from plain object
      encryptedData: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(encryptedAccount);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAccount(id: string): Promise<AccountCredentials | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = async () => {
        if (request.result) {
          try {
            const encryptedAccount = request.result;
            const encrypted = new Uint8Array(encryptedAccount.encryptedData).buffer;
            const iv = new Uint8Array(encryptedAccount.iv);
            
            const decryptedData = await this.decrypt(encrypted, iv);
            const sensitiveData = JSON.parse(decryptedData);
            
            const account: AccountCredentials = {
              ...encryptedAccount,
              globalAPIKey: sensitiveData.globalAPIKey,
              accountId: sensitiveData.accountId,
            };
            
            // Remove encryption artifacts
            delete (account as any).encryptedData;
            delete (account as any).iv;
            
            resolve(account);
          } catch (error) {
            reject(error);
          }
        } else {
          resolve(null);
        }
      };
    });
  }

  async getAllAccounts(): Promise<AccountCredentials[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = async () => {
        try {
          const accounts = await Promise.all(
            request.result.map(async (encryptedAccount: any) => {
              const encrypted = new Uint8Array(encryptedAccount.encryptedData).buffer;
              const iv = new Uint8Array(encryptedAccount.iv);
              
              const decryptedData = await this.decrypt(encrypted, iv);
              const sensitiveData = JSON.parse(decryptedData);
              
              const account: AccountCredentials = {
                ...encryptedAccount,
                globalAPIKey: sensitiveData.globalAPIKey,
                accountId: sensitiveData.accountId,
              };
              
              // Remove encryption artifacts
              delete (account as any).encryptedData;
              delete (account as any).iv;
              
              return account;
            })
          );
          
          resolve(accounts);
        } catch (error) {
          reject(error);
        }
      };
    });
  }

  async deleteAccount(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async updateAccount(account: AccountCredentials): Promise<void> {
    await this.saveAccount(account);
  }
}

export const encryptedStorage = new EncryptedStorage(); 