import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { usePlaidLink } from 'react-plaid-link'
import TransactionList from '@/components/organisms/TransactionList'
import AddTransactionModal from '@/components/organisms/AddTransactionModal'
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { transactionService } from "@/services/api/transactionService";
import { toast } from "react-toastify";

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
      await transactionService.linkAccount(publicToken, metadata);
      await loadConnectedAccounts();
      toast.success(`Successfully connected ${metadata.institution?.name || 'bank account'}`);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Failed to connect bank account');
    } finally {
      setLoading(prev => ({ ...prev, connecting: false }));
    }
  }, []);

  const onPlaidExit = useCallback((error) => {
    if (error) {
      toast.error('Bank connection cancelled');
    }
    setLoading(prev => ({ ...prev, connecting: false }));
  }, []);

  const { open: openPlaidLink, ready } = usePlaidLink({
    token: null, // In production, get link_token from your backend
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
    env: 'sandbox', // Use 'production' in production
    product: ['transactions'],
    clientName: 'Money Flow App'
  });

  const handleConnectBank = async () => {
    try {
      await transactionService.initializePlaid();
      // In a real implementation, you'd create a link_token from your backend here
      openPlaidLink();
    } catch (error) {
      toast.error('Failed to initialize bank connection');
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
        toast.success(`Imported ${result.imported} new transactions`);
        setRefreshKey(prev => prev + 1);
      } else {
        toast.info('No new transactions to import');
      }
      
      await loadConnectedAccounts();
    } catch (error) {
      toast.error('Failed to sync transactions');
    } finally {
      setLoading(prev => ({ 
        ...prev, 
        syncing: { ...prev.syncing, [account.Id]: false }
      }));
    }
  };

  const handleDisconnectAccount = async (account) => {
    if (!confirm(`Disconnect ${account.institutionName}?`)) return;
    
    try {
      setLoading(prev => ({ 
        ...prev, 
        disconnecting: { ...prev.disconnecting, [account.Id]: true }
      }));
      
      await transactionService.disconnectAccount(account.Id);
      await loadConnectedAccounts();
      toast.success(`Disconnected ${account.institutionName}`);
    } catch (error) {
      toast.error('Failed to disconnect account');
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
                        {account.institutionName}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {account.accountName}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {account.lastSync 
                        ? `Last synced: ${new Date(account.lastSync).toLocaleString()}`
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