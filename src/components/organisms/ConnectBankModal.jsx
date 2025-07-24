import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import FormField from '@/components/molecules/FormField';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import { transactionService } from '@/services/api/transactionService';
import { connectedAccountService } from '@/services/api/connectedAccountService';

const ConnectBankModal = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [connectionData, setConnectionData] = useState(null);

  // Mock bank data for demonstration
  const banks = [
    { id: 'chase', name: 'JPMorgan Chase', logo: '🏦' },
    { id: 'bofa', name: 'Bank of America', logo: '🏛️' },
    { id: 'wells', name: 'Wells Fargo', logo: '🏧' },
    { id: 'citi', name: 'Citibank', logo: '💳' },
    { id: 'pnc', name: 'PNC Bank', logo: '🏪' },
    { id: 'us_bank', name: 'U.S. Bank', logo: '🏦' }
  ];

  // Mock transaction data for different banks
  const mockTransactions = {
    chase: [
      { description: 'Starbucks Coffee', amount: -4.95, date: '2024-01-15', type: 'expense', category: 'Food & Dining' },
      { description: 'Salary Direct Deposit', amount: 3200.00, date: '2024-01-15', type: 'income', category: 'Salary' },
      { description: 'Gas Station', amount: -45.20, date: '2024-01-14', type: 'expense', category: 'Transportation' },
      { description: 'Amazon Purchase', amount: -89.99, date: '2024-01-13', type: 'expense', category: 'Shopping' },
      { description: 'Electric Bill', amount: -127.45, date: '2024-01-12', type: 'expense', category: 'Utilities' }
    ],
    bofa: [
      { description: 'McDonald\'s', amount: -12.50, date: '2024-01-15', type: 'expense', category: 'Food & Dining' },
      { description: 'Freelance Payment', amount: 850.00, date: '2024-01-14', type: 'income', category: 'Freelance' },
      { description: 'Target', amount: -67.32, date: '2024-01-13', type: 'expense', category: 'Shopping' },
      { description: 'Netflix Subscription', amount: -15.99, date: '2024-01-12', type: 'expense', category: 'Entertainment' }
    ],
    wells: [
      { description: 'Uber Ride', amount: -18.75, date: '2024-01-15', type: 'expense', category: 'Transportation' },
      { description: 'Investment Dividend', amount: 125.00, date: '2024-01-14', type: 'income', category: 'Investment' },
      { description: 'Grocery Store', amount: -156.42, date: '2024-01-13', type: 'expense', category: 'Groceries' },
      { description: 'Internet Bill', amount: -79.99, date: '2024-01-12', type: 'expense', category: 'Utilities' }
    ]
  };

  const resetModal = () => {
    setCurrentStep(1);
    setSelectedBank('');
    setCredentials({ username: '', password: '' });
    setError('');
    setConnectionData(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleBankSelect = (bankId) => {
    setSelectedBank(bankId);
    setError('');
  };

  const handleCredentialChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const connectToBank = async () => {
    if (!selectedBank || !credentials.username || !credentials.password) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock authentication - in real app, this would be secure Plaid integration
      if (credentials.password === 'error') {
        throw new Error('Invalid credentials. Please check your username and password.');
      }

      const selectedBankInfo = banks.find(bank => bank.id === selectedBank);
      
      // Create connected account record
      const accountData = {
        account_id: `acc_${selectedBank}_${Date.now()}`,
        institution_name: selectedBankInfo.name,
        account_name: `${selectedBankInfo.name} Checking`,
        account_type: 'checking',
        public_token: `public_${selectedBank}_token`,
        access_token: `access_${selectedBank}_token`,
        connected_at: new Date().toISOString()
      };

      const connectedAccount = await connectedAccountService.create(accountData);
      
      if (!connectedAccount) {
        throw new Error('Failed to save account connection');
      }

      setConnectionData({
        account: connectedAccount,
        bankInfo: selectedBankInfo
      });
      
      setCurrentStep(3);
      toast.success(`Successfully connected to ${selectedBankInfo.name}`);
    } catch (error) {
      setError(error.message || 'Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const importTransactions = async () => {
    if (!connectionData) return;

    setLoading(true);
    setError('');

    try {
      // Get mock transactions for the selected bank
      const transactions = mockTransactions[selectedBank] || mockTransactions.chase;
      
      // Import transactions using the enhanced service method
      const importedCount = await transactionService.importTransactions(
        transactions,
        connectionData.account.Id
      );

      if (importedCount > 0) {
        toast.success(`Successfully imported ${importedCount} transactions`);
        onSuccess?.();
        handleClose();
      } else {
        throw new Error('No transactions were imported');
      }
    } catch (error) {
      setError(error.message || 'Failed to import transactions');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-premium-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <ApperIcon name="Building2" className="h-5 w-5 text-primary-600" />
                Connect Bank Account
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Step 1: Bank Selection */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center text-sm text-slate-600 mb-4">
                    Select your bank to securely connect your account
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {banks.map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => handleBankSelect(bank.id)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          selectedBank === bank.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{bank.logo}</span>
                          <span className="text-sm font-medium text-slate-900">
                            {bank.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button variant="ghost" onClick={handleClose} className="flex-1">
                      Cancel
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!selectedBank}
                      className="flex-1"
                    >
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Authentication */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-lg">
                        {banks.find(b => b.id === selectedBank)?.logo}
                      </span>
                      <span className="font-medium">
                        {banks.find(b => b.id === selectedBank)?.name}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      Enter your online banking credentials
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                    <div className="flex items-center gap-2 mb-1">
                      <ApperIcon name="Shield" className="h-4 w-4" />
                      <span className="font-medium">Secure Connection</span>
                    </div>
                    <div className="text-xs">
                      Your credentials are encrypted and never stored on our servers
                    </div>
                  </div>

                  <FormField
                    label="Username"
                    placeholder="Enter your username"
                    value={credentials.username}
                    onChange={(e) => handleCredentialChange('username', e.target.value)}
                    required
                  />

                  <FormField
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => handleCredentialChange('password', e.target.value)}
                    required
                  />

                  <div className="text-xs text-slate-500 text-center">
                    Demo: Use any username and password. Use "error" as password to test error handling.
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button variant="ghost" onClick={() => setCurrentStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button
                      onClick={connectToBank}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <ApperIcon name="Loader2" className="h-4 w-4 animate-spin" />
                          Connecting...
                        </div>
                      ) : (
                        'Connect Account'
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Import Transactions */}
              {currentStep === 3 && connectionData && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <ApperIcon name="CheckCircle" className="h-6 w-6 text-accent-600" />
                      <span className="font-medium text-accent-600">Connected Successfully!</span>
                    </div>
                    <div className="text-sm text-slate-600">
                      {connectionData.bankInfo.name} account connected
                    </div>
                  </div>

                  <div className="bg-accent-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-accent-800 mb-2">
                      Ready to Import Transactions
                    </div>
                    <div className="text-xs text-accent-700">
                      We found {mockTransactions[selectedBank]?.length || 0} recent transactions ready to import.
                      Transactions will be automatically categorized based on merchant and description.
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button variant="ghost" onClick={handleClose} className="flex-1">
                      Skip Import
                    </Button>
                    <Button
                      onClick={importTransactions}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <ApperIcon name="Download" className="h-4 w-4 animate-spin" />
                          Importing...
                        </div>
                      ) : (
                        'Import Transactions'
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConnectBankModal;