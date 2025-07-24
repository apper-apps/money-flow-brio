import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePlaidLink } from "react-plaid-link";
import { toast } from "react-toastify";
import { transactionService } from "@/services/api/transactionService";
import ApperIcon from "@/components/ApperIcon";
import TransactionList from "@/components/organisms/TransactionList";
import AddTransactionModal from "@/components/organisms/AddTransactionModal";
import Badge from "@/components/atoms/Badge";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import Error from "@/components/ui/Error";

const Transactions = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [showAccounts, setShowAccounts] = useState(false);
  const [loading, setLoading] = useState({
    connecting: false,
    syncing: {},
    disconnecting: {}
  });

  const handleTransactionAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  const loadConnectedAccounts = async () => {
    try {
      const accounts = await transactionService.getConnectedAccounts();
      setConnectedAccounts(accounts);
    } catch (error) {
      console.error('Failed to load connected accounts:', error);
    }
  };

  useEffect(() => {
    loadConnectedAccounts();
  }, []);

const onPlaidSuccess = useCallback(async (publicToken, metadata) => {
    try {
      setLoading(prev => ({ ...prev, connecting: true }));
      
      // Validate connection data
      if (!publicToken) {
        throw new Error('Invalid connection token received from bank');
      }
      
      if (!metadata?.institution?.name) {
        throw new Error('Bank information missing from connection');
      }
      
      const newAccount = await transactionService.linkAccount(publicToken, metadata);
      if (!newAccount) {
        throw new Error('Failed to save bank connection');
      }
      
      await loadConnectedAccounts();
      toast.success(`Successfully connected ${metadata.institution.name}`, {
        position: "top-right",
        autoClose: 5000
      });
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Bank connection failed:', error);
      const errorMessage = error.message || 'Failed to connect bank account';
      toast.error(`Connection failed: ${errorMessage}`, {
        position: "top-right",
        autoClose: 8000
      });
    } finally {
      setLoading(prev => ({ ...prev, connecting: false }));
    }
  }, []);

const onPlaidExit = useCallback((error, metadata) => {
    setLoading(prev => ({ ...prev, connecting: false }));
    
    if (error) {
      console.error('Plaid Link exit with error:', JSON.stringify(error, null, 2));
      
      // Handle specific error types
      if (error.error_code === 'INSTITUTION_DOWN') {
        toast.error('Your bank is temporarily unavailable. Please try again later.');
      } else if (error.error_code === 'INSTITUTION_NOT_RESPONDING') {
        toast.error('Connection timeout. Please check your internet and try again.');
      } else if (error.error_code === 'INVALID_CREDENTIALS') {
        toast.error('Invalid login credentials. Please verify your bank login details.');
      } else if (error.error_code === 'ITEM_LOCKED') {
        toast.error('Your bank account is locked. Please contact your bank.');
      } else if (metadata?.status === 'requires_questions') {
        toast.info('Additional verification required by your bank.');
      } else {
        toast.error('Bank connection was cancelled or failed. Please try again.');
      }
    }
  }, []);

  const { open: openPlaidLink, ready } = usePlaidLink({
    token: 'mock_link_token', // In production, get link_token from your backend
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
    env: import.meta.env.VITE_PLAID_ENV || 'sandbox',
    product: ['transactions'],
    clientName: 'Money Flow App',
    countryCodes: ['US'], // Specify supported countries
    language: 'en'
  });

  const handleConnectBank = async () => {
    try {
      setLoading(prev => ({ ...prev, connecting: true }));
      
      // Initialize Plaid with enhanced error handling
      await transactionService.initializePlaid();
      
      // Show security message before opening Plaid Link
      toast.info(
        'You will be redirected to securely connect your bank account. Your credentials are never stored by our app.', 
        { autoClose: 3000 }
      );
      
      // Small delay to let user read the security message
      setTimeout(() => {
        if (ready) {
          openPlaidLink();
        } else {
          throw new Error('Bank connection service not ready. Please refresh and try again.');
        }
      }, 500);
      
    } catch (error) {
      console.error('Failed to initialize bank connection:', error);
      const errorMessage = error.message || 'Failed to initialize bank connection';
      toast.error(`Connection error: ${errorMessage}`, {
        position: "top-right",
        autoClose: 8000
      });
      setLoading(prev => ({ ...prev, connecting: false }));
    }
  };

  const handleSyncTransactions = async (account) => {
    try {
      setLoading(prev => ({ 
        ...prev, 
        syncing: { ...prev.syncing, [account.Id]: true }
      }));
      
      const result = await transactionService.syncTransactions(account.Id);
      
      if (result.imported > 0) {
        toast.success(
          `Successfully imported ${result.imported} new transactions from ${result.accountName || account.institution_name}`,
          { autoClose: 6000 }
        );
        setRefreshKey(prev => prev + 1);
      } else {
        toast.info(
          `No new transactions found in ${result.accountName || account.institution_name}`,
          { autoClose: 4000 }
        );
      }
      
      if (result.duplicatesSkipped > 0) {
        toast.info(
          `Skipped ${result.duplicatesSkipped} duplicate transactions`,
          { autoClose: 3000 }
        );
      }
      
      await loadConnectedAccounts();
    } catch (error) {
      console.error('Transaction sync failed:', error);
      const errorMessage = error.message || 'Failed to sync transactions';
      toast.error(`Sync failed: ${errorMessage}`, {
        position: "top-right",
        autoClose: 8000
      });
    } finally {
      setLoading(prev => ({ 
        ...prev, 
        syncing: { ...prev.syncing, [account.Id]: false }
      }));
    }
  };

  const handleDisconnectAccount = async (account) => {
    const institutionName = account.institution_name || 'this account';
    
    if (!confirm(`Are you sure you want to disconnect ${institutionName}? This will stop automatic transaction imports.`)) {
      return;
    }
    
    try {
      setLoading(prev => ({ 
        ...prev, 
        disconnecting: { ...prev.disconnecting, [account.Id]: true }
      }));
      
      await transactionService.disconnectAccount(account.Id);
      await loadConnectedAccounts();
      
      toast.success(`Successfully disconnected ${institutionName}`, {
        position: "top-right",
        autoClose: 5000
      });
      
    } catch (error) {
      console.error('Account disconnection failed:', error);
      const errorMessage = error.message || 'Failed to disconnect account';
      toast.error(`Disconnect failed: ${errorMessage}`, {
        position: "top-right",
        autoClose: 8000
      });
    } finally {
      setLoading(prev => ({ 
        ...prev, 
        disconnecting: { ...prev.disconnecting, [account.Id]: false }
      }));
    }
  };

return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-600 mt-1">Track and manage all your financial transactions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleConnectBank}
            variant="outline"
            disabled={!ready || loading.connecting}
            className="shadow-premium"
          >
            <ApperIcon name="CreditCard" className="h-4 w-4 mr-2" />
            {loading.connecting ? "Connecting..." : "Connect Bank"}
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            className="shadow-premium"
          >
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Connected Accounts */}
      {connectedAccounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 shadow-premium"
        >
          <div className="p-4 border-b border-slate-200">
            <button
              onClick={() => setShowAccounts(!showAccounts)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <ApperIcon name="Building2" className="h-5 w-5 text-slate-600" />
                <span className="font-semibold text-slate-900">
                  Connected Accounts ({connectedAccounts.length})
                </span>
              </div>
              <ApperIcon 
                name={showAccounts ? "ChevronUp" : "ChevronDown"} 
                className="h-4 w-4 text-slate-600" 
              />
            </button>
          </div>
          
          {showAccounts && (
            <div className="p-4 space-y-3">
{connectedAccounts.map((account) => (
                <div 
                  key={account.Id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {account.institution_name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {account.account_name}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {account.last_sync 
                        ? `Last synced: ${new Date(account.last_sync).toLocaleString()}`
                        : 'Never synced'
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSyncTransactions(account)}
                      disabled={loading.syncing[account.Id]}
                    >
                      <ApperIcon 
                        name="RefreshCw" 
                        className={`h-4 w-4 mr-1 ${loading.syncing[account.Id] ? 'animate-spin' : ''}`} 
                      />
                      {loading.syncing[account.Id] ? 'Syncing...' : 'Sync'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnectAccount(account)}
                      disabled={loading.disconnecting[account.Id]}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <ApperIcon name="Unlink" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 p-6 bg-white rounded-xl border border-slate-200 shadow-premium"
      >
        <div className="flex-1">
          <SearchBar
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Transactions</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </Select>
        </div>
      </motion.div>

      {/* Transaction List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        key={refreshKey}
      >
        <TransactionList showActions={true} />
      </motion.div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleTransactionAdded}
      />
    </div>
  );
};

export default Transactions;