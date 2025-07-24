import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { billService } from "@/services/api/billService";
import { format, differenceInDays, isPast } from "date-fns";
import { toast } from "react-toastify";

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBills = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await billService.getAll();
      // Sort by due date
      const sortedData = data.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setBills(sortedData);
    } catch (err) {
      setError("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const handleMarkPaid = async (id) => {
    try {
      const bill = bills.find(b => b.Id === id);
      await billService.update(id, { ...bill, paid: true });
      setBills(prev => prev.map(b => b.Id === id ? { ...b, paid: true } : b));
      toast.success("Bill marked as paid");
    } catch (err) {
      toast.error("Failed to update bill");
    }
  };

  const getBillStatus = (bill) => {
    if (bill.paid) return { status: "paid", color: "success", icon: "CheckCircle" };
    
    const daysUntilDue = differenceInDays(new Date(bill.dueDate), new Date());
    const isOverdue = isPast(new Date(bill.dueDate));
    
    if (isOverdue) return { status: "overdue", color: "error", icon: "AlertTriangle" };
    if (daysUntilDue <= 3) return { status: "due-soon", color: "warning", icon: "Clock" };
    return { status: "upcoming", color: "default", icon: "Calendar" };
  };

  const getBillIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes("electric") || lower.includes("power")) return "Zap";
    if (lower.includes("water")) return "Droplets";
    if (lower.includes("gas")) return "Flame";
    if (lower.includes("internet") || lower.includes("wifi")) return "Wifi";
    if (lower.includes("phone")) return "Phone";
    if (lower.includes("rent") || lower.includes("mortgage")) return "Home";
    if (lower.includes("insurance")) return "Shield";
    if (lower.includes("credit") || lower.includes("loan")) return "CreditCard";
    return "Receipt";
  };

  if (loading) return <Loading type="skeleton" />;
  if (error) return <Error message={error} onRetry={loadBills} />;

  const upcomingBills = bills.filter(b => !b.paid);
  const paidBills = bills.filter(b => b.paid);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bills & Payments</h1>
          <p className="text-slate-600 mt-1">Keep track of your recurring bills and payments</p>
        </div>
        <Button variant="primary" className="shadow-premium">
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Add Bill
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-primary-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Bills</p>
                  <p className="text-2xl font-bold text-slate-900">{bills.length}</p>
                </div>
                <ApperIcon name="Receipt" className="h-8 w-8 text-primary-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-accent-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Paid</p>
                  <p className="text-2xl font-bold text-slate-900">{paidBills.length}</p>
                </div>
                <ApperIcon name="CheckCircle" className="h-8 w-8 text-accent-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Pending</p>
                  <p className="text-2xl font-bold text-slate-900">{upcomingBills.length}</p>
                </div>
                <ApperIcon name="Clock" className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-l-4 border-secondary-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Amount</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${bills.reduce((sum, bill) => sum + bill.amount, 0).toLocaleString()}
                  </p>
                </div>
                <ApperIcon name="DollarSign" className="h-8 w-8 text-secondary-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bills List */}
      {bills.length === 0 ? (
        <Empty
          title="No bills added"
          description="Start tracking your bills to never miss a payment"
          icon="Receipt"
          actionLabel="Add Bill"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bills.map((bill, index) => {
            const billStatus = getBillStatus(bill);
            const daysUntilDue = differenceInDays(new Date(bill.dueDate), new Date());
            
            return (
              <motion.div
                key={bill.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:scale-[1.02] transition-transform duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <ApperIcon 
                            name={getBillIcon(bill.name)} 
                            className="h-6 w-6 text-slate-600"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{bill.name}</h3>
                          <p className="text-sm text-slate-500">
                            Due {format(new Date(bill.dueDate), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <Badge variant={billStatus.color}>
                        <ApperIcon name={billStatus.icon} className="h-3 w-3 mr-1" />
                        {billStatus.status.replace("-", " ")}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-slate-900">
                          ${bill.amount.toLocaleString()}
                        </p>
                        {!bill.paid && (
                          <p className="text-sm text-slate-500">
                            {daysUntilDue >= 0 
                              ? `${daysUntilDue} days remaining`
                              : `${Math.abs(daysUntilDue)} days overdue`
                            }
                          </p>
                        )}
                      </div>
                      
                      {!bill.paid && (
                        <Button
                          onClick={() => handleMarkPaid(bill.Id)}
                          variant="accent"
                          size="sm"
                        >
                          <ApperIcon name="Check" className="h-4 w-4 mr-1" />
                          Mark Paid
                        </Button>
                      )}
                    </div>

                    {bill.recurring && (
                      <div className="mt-4 flex items-center text-sm text-slate-500">
                        <ApperIcon name="Repeat" className="h-4 w-4 mr-1" />
                        Recurring bill
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bills;