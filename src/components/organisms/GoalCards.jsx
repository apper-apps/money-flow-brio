import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { differenceInDays, format } from "date-fns";
import { toast } from "react-toastify";
import { goalService } from "@/services/api/goalService";
import ApperIcon from "@/components/ApperIcon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import ProgressRing from "@/components/molecules/ProgressRing";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
const GoalCards = ({ limit = null, onEditGoal }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const loadGoals = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await goalService.getAll();
      setGoals(limit ? data.slice(0, limit) : data);
    } catch (err) {
      setError("Failed to load goals");
    } finally {
      setLoading(false);
    }
};

  const handleDelete = (goal) => {
    setDeleteConfirm(goal);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      const success = await goalService.delete(deleteConfirm.Id);
      if (success) {
        toast.success('Goal deleted successfully!');
        setDeleteConfirm(null);
        loadGoals(); // Refresh the goals list
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  useEffect(() => {
    loadGoals();
  }, [limit]);
  if (loading) return <Loading type="skeleton" />;
  if (error) return <Error message={error} onRetry={loadGoals} />;
  if (goals.length === 0) {
    return (
      <Empty
        title="No savings goals"
        description="Set your first savings goal to start building your financial future"
        icon="Target"
        actionLabel="Create Goal"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {goals.map((goal, index) => {
        const progress = Math.min(goal.current_amount / goal.target_amount * 100, 100);
        const remaining = goal.target_amount - goal.current_amount;
        const daysLeft = differenceInDays(new Date(goal.target_date), new Date());

        return (
            <motion.div
                key={goal.Id}
                initial={{
                    opacity: 0,
                    y: 20
                }}
                animate={{
                    opacity: 1,
                    y: 0
                }}
                transition={{
                    delay: index * 0.1
                }}>
                <Card className="hover:scale-[1.02] transition-transform duration-200">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{goal.Name || goal.name}</span>
                            <ApperIcon name="Target" className="h-5 w-5 text-primary-500" />
                        </CardTitle>
                    </CardHeader>
<CardContent>
                        <div className="flex flex-col items-center space-y-4">
                            {/* Progress Ring */}
                            <ProgressRing progress={progress} size={120}>
                                <div className="text-center">
                                    <div className="text-2xl font-bold gradient-text">
                                        {progress.toFixed(0)}%
                                    </div>
                                    <div className="text-xs text-slate-500">Complete</div>
                                </div>
                            </ProgressRing>
                            
                            {/* Amount Info */}
                            <div className="text-center w-full">
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500">Current</span>
                                        <span className="font-semibold text-accent-600">${goal.current_amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500">Target</span>
                                        <span className="font-semibold text-slate-900">${goal.target_amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500">Remaining</span>
                                        <span className="font-semibold text-primary-600">${remaining.toLocaleString()}</span>
                                    </div>
                                </div>
                                
                                {/* Time Info */}
                                <div className="w-full pt-4 border-t border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <ApperIcon name="Calendar" className="h-4 w-4 text-slate-500" />
                                            <span className="text-sm text-slate-500">Target Date</span>
                                        </div>
                                        <span className="text-sm font-medium text-slate-900">
                                            {format(new Date(goal.target_date), "MMM dd, yyyy")}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center space-x-2">
                                            <ApperIcon name="Clock" className="h-4 w-4 text-slate-500" />
                                            <span className="text-sm text-slate-500">Days Left</span>
                                        </div>
                                        <span
                                            className={`text-sm font-medium ${daysLeft < 30 ? "text-orange-600" : "text-accent-600"}`}>
                                            {daysLeft > 0 ? `${daysLeft} days` : "Overdue"}
                                        </span>
                                    </div>
                                </div>
{/* Action Buttons */}
                                {onEditGoal && (
                                    <div className="w-full pt-4 border-t border-slate-200 mt-4 space-y-2">
                                        <button
                                            onClick={() => onEditGoal(goal)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                                        >
                                            <ApperIcon name="Edit" className="h-4 w-4" />
                                            Edit Goal
                                        </button>
                                        <button
                                            onClick={() => handleDelete(goal)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                        >
                                            <ApperIcon name="Trash2" className="h-4 w-4" />
                                            Delete Goal
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
</motion.div>
        );
    })}
    </div>

    {/* Delete Confirmation Dialog */}
    {deleteConfirm && (
       <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           className="bg-white rounded-lg shadow-premium-lg p-6 w-full max-w-md"
         >
           <div className="flex items-center mb-4">
             <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
               <ApperIcon name="AlertTriangle" className="h-5 w-5 text-red-600" />
             </div>
             <div className="ml-3">
               <h3 className="text-lg font-medium text-slate-900">Delete Goal</h3>
               <p className="text-sm text-slate-500">This action cannot be undone.</p>
             </div>
           </div>
           
           <p className="text-slate-700 mb-6">
             Are you sure you want to delete "{deleteConfirm.Name || deleteConfirm.name}"? 
             All associated data will be permanently removed.
           </p>
           
           <div className="flex gap-3">
             <button
               onClick={handleCancelDelete}
               disabled={deleting}
               className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Cancel
             </button>
             <button
               onClick={handleConfirmDelete}
               disabled={deleting}
               className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
               {deleting ? (
                 <>
                   <ApperIcon name="Loader2" className="h-4 w-4 animate-spin" />
                   Deleting...
                 </>
               ) : (
                 <>
                   <ApperIcon name="Trash2" className="h-4 w-4" />
                   Delete Goal
                 </>
               )}
             </button>
           </div>
         </motion.div>
       </div>
     )}
   </div>
 );
};

export default GoalCards;