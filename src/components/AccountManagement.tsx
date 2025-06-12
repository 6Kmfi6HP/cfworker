import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import {
  Plus,
  Edit,
  Trash2,
  User,
  CheckCircle,
  MoreHorizontal,
  Star,
  Eye,
  Copy,
  Globe,
  Mail,
  Calendar,
  Grid3X3,
  List,
  Users,
  Tags,
  Settings as SettingsIcon,
  Plus as PlusIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { useAccount } from '../contexts/AccountContext';
import { AccountFormData, AccountCredentials } from '../types/account';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// import './AccountManagement.css'; // Removed due to Ant Design conflicts

// Form validation schema
const accountFormSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  email: z.string().email('Invalid email address'),
  globalAPIKey: z.string().min(1, 'Global API Key is required'),
  accountId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

interface AccountManagementProps {
  visible: boolean;
  onClose: () => void;
}

const AccountManagement: React.FC<AccountManagementProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { 
    accounts, 
    addAccount, 
    updateAccount, 
    deleteAccount, 
    currentAccount, 
    setCurrentAccount, 
    loading: accountsLoading 
  } = useAccount();
  
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: '',
      email: '',
      globalAPIKey: '',
      accountId: '',
      tags: [],
      notes: '',
    },
  });
  const [editingAccount, setEditingAccount] = useState<AccountCredentials | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchText, setSearchText] = useState('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'status'>('name');
  const [favoriteAccounts, setFavoriteAccounts] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // 检测屏幕尺寸
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 加载收藏账号
  useEffect(() => {
    const saved = localStorage.getItem('favoriteAccounts');
    if (saved) {
      setFavoriteAccounts(new Set(JSON.parse(saved)));
    }
  }, []);

  const handleAdd = () => {
    setEditingAccount(null);
    form.reset();
    setShowForm(true);
  };

  const handleEdit = (account: AccountCredentials) => {
    setEditingAccount(account);
    form.reset({
      name: account.name,
      email: account.email,
      globalAPIKey: account.globalAPIKey,
      accountId: account.accountId || '',
      tags: account.tags || [],
      notes: account.notes || '',
    });
    setShowForm(true);
  };

  const handleSubmit = form.handleSubmit(async (values: AccountFormValues) => {
    try {
      setLoading(true);
      const formData: AccountFormData = {
        ...values,
        tags: values.tags || [],
      };

      if (editingAccount) {
        await updateAccount(editingAccount.id, formData);
        toast.success(t('accountUpdated', 'Account updated successfully'));
      } else {
        await addAccount(formData);
        toast.success(t('accountAdded', 'Account added successfully'));
      }

      setShowForm(false);
      form.reset();
      setEditingAccount(null);
    } catch (error) {
      console.error('Form submission failed:', error);
      toast.error(t('formSubmissionError', 'Failed to save account. Please try again.'));
    } finally {
      setLoading(false);
    }
  });

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteAccount(accountId);
      toast.success(t('accountDeleted', 'Account deleted successfully'));
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(t('deleteAccountError', 'Failed to delete account'));
    }
  };

  const handleSetCurrent = (account: AccountCredentials) => {
    setCurrentAccount(account);
    toast.success(t('accountSetAsCurrent', 'Account set as current'));
  };

  const toggleFavorite = (accountId: string) => {
    const newFavorites = new Set(favoriteAccounts);
    if (newFavorites.has(accountId)) {
      newFavorites.delete(accountId);
    } else {
      newFavorites.add(accountId);
    }
    setFavoriteAccounts(newFavorites);
    localStorage.setItem('favoriteAccounts', JSON.stringify([...newFavorites]));
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('copied', `${type} copied to clipboard`));
  };

  const getAccountDisplayName = (account: AccountCredentials) => {
    return account.name || account.email;
  };

  // 过滤和排序账号
  const filteredAndSortedAccounts = accounts
    .filter(account => {
      const matchesSearch = getAccountDisplayName(account)
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
        account.email.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesTag = !filterTag || (account.tags && account.tags.includes(filterTag));
      
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return getAccountDisplayName(a).localeCompare(getAccountDisplayName(b));
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'status':
          return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
        default:
          return 0;
      }
    });

  // 获取所有标签
  const allTags = [...new Set(accounts.flatMap(account => account.tags || []))];

  const renderAccountCard = (account: AccountCredentials) => {
    const isCurrent = account.id === currentAccount?.id;
    const isFavorite = favoriteAccounts.has(account.id);

    const actionMenu = (
      <DropdownMenuContent>
        {!isCurrent && (
          <DropdownMenuItem onClick={() => handleSetCurrent(account)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            {t('setCurrent', 'Set as Current')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleEdit(account)}>
          <Edit className="mr-2 h-4 w-4" />
          {t('edit', 'Edit')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => copyToClipboard(account.email, 'Email')}>
          <Copy className="mr-2 h-4 w-4" />
          {t('copyEmail', 'Copy Email')}
        </DropdownMenuItem>
        {account.accountId && (
          <DropdownMenuItem onClick={() => copyToClipboard(account.accountId!, 'Account ID')}>
            <Copy className="mr-2 h-4 w-4" />
            {t('copyAccountId', 'Copy Account ID')}
          </DropdownMenuItem>
        )}
        <Separator />
        <DropdownMenuItem 
          className="text-red-600"
          onClick={() => {
            if (confirm(t('deleteAccountConfirm', 'Are you sure you want to delete this account?'))) {
              handleDeleteAccount(account.id);
            }
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t('delete', 'Delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    );

    return (
      <Card
        key={account.id}
        className={`p-4 ${isCurrent ? 'ring-2 ring-blue-500' : ''}`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="relative">
              <Avatar className={`h-12 w-12 text-lg font-bold ${isCurrent ? 'bg-green-500' : 'bg-blue-500'}`}>
                {getAccountDisplayName(account).charAt(0).toUpperCase()}
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                account.isActive ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>
          
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-base">
                  {getAccountDisplayName(account)}
                </span>
                {isCurrent && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {t('current', 'Current')}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                <Mail className="h-3 w-3" />
                <span>{account.email}</span>
              </div>
              
              {account.accountId && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Globe className="h-3 w-3" />
                  <span>{account.accountId.substring(0, 8)}...</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFavorite(account.id)}
              className={isFavorite ? 'text-yellow-500' : 'text-gray-400'}
            >
              {isFavorite ? <Star className="h-4 w-4 fill-current" /> : <Star className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(account)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              {actionMenu}
            </DropdownMenu>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="space-y-2">
          {account.tags && account.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tags className="h-3 w-3 text-gray-400" />
              <div className="flex gap-1 flex-wrap">
                {account.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {account.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{account.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{new Date(account.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {account.notes && (
          <>
            <Separator className="my-2" />
            <div className="text-xs text-gray-500">
              {account.notes.length > 50 
                ? `${account.notes.substring(0, 50)}...` 
                : account.notes
              }
            </div>
          </>
        )}
      </Card>
    );
  };

  const renderAccountList = (account: AccountCredentials) => {
    const isCurrent = account.id === currentAccount?.id;
    const isFavorite = favoriteAccounts.has(account.id);

    return (
      <Card 
        key={account.id}
        className={`p-3 mb-2 ${isCurrent ? 'ring-2 ring-blue-500' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className={`h-8 w-8 text-sm ${isCurrent ? 'bg-green-500' : 'bg-blue-500'}`}>
                {getAccountDisplayName(account).charAt(0).toUpperCase()}
              </Avatar>
              <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white ${
                account.isActive ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{getAccountDisplayName(account)}</span>
                {isCurrent && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    {t('current', 'Current')}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-600">
                {account.email}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFavorite(account.id)}
              className={isFavorite ? 'text-yellow-500' : 'text-gray-400'}
            >
              {isFavorite ? <Star className="h-4 w-4 fill-current" /> : <Star className="h-4 w-4" />}
            </Button>
            
            {!isCurrent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSetCurrent(account)}
              >
                {t('setCurrent', 'Set Current')}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
                onClick={() => handleEdit(account)}
             >
               <Edit className="h-4 w-4" />
             </Button>
             
             <Button
               variant="ghost"
               size="sm"
               className="text-red-600 hover:text-red-700"
               onClick={() => {
                 if (confirm(t('deleteAccountConfirm', 'Are you sure?'))) {
                   handleDeleteAccount(account.id);
                 }
               }}
             >
               <Trash2 className="h-4 w-4" />
             </Button>
           </div>
         </div>
       </Card>
    );
  };

  const renderContent = () => {
    if (accountsLoading) {
      return (
        <div className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start space-x-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {[...Array(5)].map((_, index) => (
                <Card key={index} className="p-3 mb-2">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (filteredAndSortedAccounts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-gray-400 mb-4">
            <Users className="h-16 w-16 mx-auto mb-2" />
            <p className="text-lg font-medium">
              {searchText || filterTag 
                ? t('noAccountsFound', 'No accounts found matching your criteria')
                : t('noAccounts', 'No accounts yet')
              }
            </p>
          </div>
          {!searchText && !filterTag && (
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              {t('addFirstAccount', 'Add Your First Account')}
            </Button>
          )}
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedAccounts.map((account) => (
            renderAccountCard(account)
          ))}
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          {filteredAndSortedAccounts.map(renderAccountList)}
        </div>
      );
    }
  };

  // Form dialog handlers
  const handleFormClose = () => {
    setShowForm(false);
    form.reset();
    setEditingAccount(null);
  };

  return (
    <>
      <Dialog open={visible} onOpenChange={onClose}>
        <DialogContent className={`max-w-6xl ${isMobile ? 'h-screen max-h-screen' : ''}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              {t('accountManagement', 'Account Management')}
            </DialogTitle>
            <DialogDescription>
              {t('manageAccountsDescription', 'Manage your Cloudflare accounts')}
            </DialogDescription>
          </DialogHeader>
          <div className={isMobile ? 'h-full overflow-auto' : ''}>
        {/* 工具栏 */}
        <div className="account-toolbar">
          <div className="toolbar-left">
            <Button
              onClick={handleAdd}
              size={isMobile ? 'sm' : 'default'}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {isMobile ? t('add', 'Add') : t('addAccount', 'Add Account')}
            </Button>
          </div>
          
          <div className="toolbar-center">
            <Input
              placeholder={t('searchAccounts', 'Search accounts...')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={`${isMobile ? 'w-[200px]' : 'w-[300px]'}`}
            />
          </div>
          
          <div className="toolbar-right">
            <div className="flex items-center gap-2">
              {allTags.length > 0 && (
                <Select value={filterTag} onValueChange={setFilterTag}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder={t('filterByTag', 'Filter by tag')} />
                  </SelectTrigger>
                  <SelectContent>
                    {allTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'created' | 'status')}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">{t('name', 'Name')}</SelectItem>
                  <SelectItem value="created">{t('created', 'Created')}</SelectItem>
                  <SelectItem value="status">{t('status', 'Status')}</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size={isMobile ? 'sm' : 'default'}
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size={isMobile ? 'sm' : 'default'}
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="account-stats">
          <div className="grid grid-cols-4 gap-4">
            <div className="stat-item">
              <span className="text-muted-foreground">{t('total', 'Total')}</span>
              <div className="stat-number">{accounts.length}</div>
            </div>
            <div className="stat-item">
              <span className="text-muted-foreground">{t('active', 'Active')}</span>
              <div className="stat-number">{accounts.filter(a => a.isActive).length}</div>
            </div>
            <div className="stat-item">
              <span className="text-muted-foreground">{t('favorites', 'Favorites')}</span>
              <div className="stat-number">{favoriteAccounts.size}</div>
            </div>
            <div className="stat-item">
              <span className="text-muted-foreground">{t('current', 'Current')}</span>
              <div className="stat-number">{currentAccount ? 1 : 0}</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* 账号列表 */}
        <div className="account-content">
          {renderContent()}
        </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 添加/编辑表单 */}
      <Dialog open={showForm} onOpenChange={handleFormClose}>
        <DialogContent className={isMobile ? 'w-full h-screen' : 'max-w-2xl'}>
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? t('editAccount', 'Edit Account') : t('addAccount', 'Add Account')}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={handleSubmit} className={`space-y-4 ${isMobile ? 'pt-4' : ''}`}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('accountName', 'Account Name')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder={t('accountNamePlaceholder', 'Enter a friendly name for this account')}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email', 'Email')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="email"
                        placeholder={t('emailPlaceholder', 'Cloudflare account email')}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="globalAPIKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('globalAPIKey', 'Global API Key')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder={t('globalAPIKeyPlaceholder', 'Your Cloudflare Global API Key')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('accountId', 'Account ID (Optional)')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder={t('accountIdPlaceholder', 'Cloudflare Account ID')}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('notes', 'Notes')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder={t('notesPlaceholder', 'Additional notes about this account')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleFormClose}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Loading...' : (editingAccount ? t('update', 'Update') : t('add', 'Add'))}
              </Button>
            </div>
          </form>
        </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountManagement;