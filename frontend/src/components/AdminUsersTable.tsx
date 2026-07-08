import React from "react";
import { Users, Trash2 } from "lucide-react";
import type { User } from "../types/index.js";

interface AdminUser extends User {
  listingsCount: number;
}

interface AdminUsersTableProps {
  loading: boolean;
  users: AdminUser[];
  currentAdminId?: string;
  actionId: string | null;
  onDeleteUser: (id: string) => void;
}

const AdminUsersTable: React.FC<AdminUsersTableProps> = ({
  loading,
  users,
  currentAdminId,
  actionId,
  onDeleteUser,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-900/40 border border-gray-855 h-16 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-16 border border-gray-800 bg-slate-900/10 rounded-2xl animate-fade-in">
        <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 font-medium">No registered users</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-850 bg-[#111827]/15 backdrop-blur-sm animate-fade-in">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-850 text-xs font-bold uppercase tracking-wider text-gray-500 bg-slate-955/20">
            <th className="py-4 px-6">User Display Name</th>
            <th className="py-4 px-6">Email Address</th>
            <th className="py-4 px-6">System Role</th>
            <th className="py-4 px-6">Active Listings</th>
            <th className="py-4 px-6">Joined Date</th>
            <th className="py-4 px-6 text-right">Moderate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-850 text-sm text-gray-300">
          {users.map((userObj) => (
            <tr key={userObj.id} className="hover:bg-slate-900/10 transition-colors">
              <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                  {userObj.avatar ? (
                    <img src={userObj.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-800" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      {userObj.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-white">{userObj.name}</span>
                </div>
              </td>
              <td className="py-4 px-6 text-gray-400">{userObj.email}</td>
              <td className="py-4 px-6">
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${
                  userObj.role === "ADMIN"
                    ? "bg-rose-955/20 border-rose-500/20 text-rose-400"
                    : "bg-blue-955/20 border-blue-500/20 text-blue-400"
                }`}>
                  {userObj.role}
                </span>
              </td>
              <td className="py-4 px-6 font-bold text-gray-200">{userObj.listingsCount}</td>
              <td className="py-4 px-6 text-gray-400">{new Date(userObj.createdAt).toLocaleDateString()}</td>
              <td className="py-4 px-6 text-right">
                <button
                  onClick={() => onDeleteUser(userObj.id)}
                  disabled={actionId !== null || userObj.id === currentAdminId}
                  title={userObj.id === currentAdminId ? "Cannot delete yourself" : "Delete User Account"}
                  className="p-2 rounded-lg bg-rose-955/20 text-rose-400 hover:bg-rose-900/30 border border-rose-500/20 transition-colors disabled:opacity-30 disabled:hover:bg-rose-955/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsersTable;
