'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useToast } from '@/components/common/ToastProvider';
import { teamMembers as initialMembers } from '@/data/users';
import { User } from '@/types/user';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  MoreVertical,
  X,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { inviteTeamMember } from '@/services/auth.service';

export default function TeamPage() {
  const [members, setMembers] = useState<User[]>(initialMembers);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<User['role']>('Security Analyst');
  const toast = useToast();

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) {
      toast.error('Validation Error', 'Please enter member name and company email.');
      return;
    }

    try {
      const newUser = await inviteTeamMember(inviteName, inviteEmail, inviteRole);
      setMembers((prev) => [...prev, newUser]);
      setIsInviteOpen(false);
      setInviteName('');
      setInviteEmail('');
      toast.success(
        'Invitation Dispatched',
        `Access invitation link emailed to ${inviteEmail} with role "${inviteRole}".`
      );
    } catch {
      toast.error('Failed to send invitation');
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Team Members"
        subtitle="Manage access permissions, security analyst roles, and multi-tenant privileges."
        actions={
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-sm shadow-[#007AFF]/20 transition-all active:scale-98"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        }
      />

      {/* Team table container */}
      <div className="apple-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Organization Directory
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Active security analysts and viewers registered under ABC Technologies
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {members.length} Total Seats
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAFBFD] border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Work Email</th>
                <th className="py-3 px-4">Security Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-[#F9FAFB] transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200/80 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-slate-400">{member.department || 'SOC Operations'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {member.email}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        member.role === 'Admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : member.role === 'Security Analyst'
                          ? 'bg-[#EAF3FF] text-[#007AFF] border-[#007AFF]/20'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {member.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={member.status} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {member.lastActive}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() =>
                        toast.info(
                          'Member Access',
                          `Permissions profile for ${member.name} is managed via enterprise SSO.`
                        )
                      }
                      className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Configure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAF3FF] text-[#007AFF] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Invite Team Member
                  </h3>
                  <p className="text-xs text-slate-500">Add an analyst or viewer to your organization</p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 text-xs bg-[#F9FAFB] border border-slate-200/80 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="analyst@abc.com"
                  className="w-full px-3 py-2 text-xs bg-[#F9FAFB] border border-slate-200/80 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Assigned Security Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as User['role'])}
                  className="w-full px-3 py-2 text-xs bg-[#F9FAFB] border border-slate-200/80 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] outline-none font-medium"
                >
                  <option value="Admin">Admin (Full administrative & scan control)</option>
                  <option value="Security Analyst">Security Analyst (Investigate & triage threats)</option>
                  <option value="Viewer">Viewer (Read-only reports & dashboards)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-sm shadow-[#007AFF]/20 transition-all active:scale-98"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
