import React from "react";
import { Loader2 } from "lucide-react";

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rejectionText: string;
  setRejectionText: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  actionInProgress: boolean;
}

const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onClose,
  rejectionText,
  setRejectionText,
  onSubmit,
  actionInProgress,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-gray-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-white">Reject Listing Request</h3>
        <p className="text-xs text-gray-400">Please provide a constructive reason for rejecting this listing. The seller will see this on their dashboard.</p>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <textarea
            required
            rows={4}
            value={rejectionText}
            onChange={(e) => setRejectionText(e.target.value)}
            placeholder="e.g. Screenshots fail to verify inventory items. Please upload clear shots of your platform dashboard."
            className="w-full bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 rounded-xl p-3 text-sm text-white placeholder-gray-600 transition-colors"
          />
          
          <div className="flex gap-3.5 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-850 hover:bg-gray-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionInProgress || !rejectionText.trim()}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-500/20 disabled:opacity-40"
            >
              {actionInProgress ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Reject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectionModal;
