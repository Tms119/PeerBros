import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import LeadDetailsModal from './LeadDetailsModal';

export default function AdminDashboard() {
  const leads = useQuery(api.leads.getAllLeads);
  const [selectedLead, setSelectedLead] = useState(null);

  if (leads === undefined) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
        <h3 className="text-xl font-medium text-white mb-2">No Leads Yet</h3>
        <p className="text-white/60">When visitors interact with the chatbot, their info will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Captured Leads</h2>
          <p className="text-white/60 text-sm">Manage chatbot conversations and extracted information.</p>
        </div>
        <div className="bg-white/10 px-3 py-1.5 rounded-lg text-sm text-white/80 font-medium">
          Total: {leads.length}
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="py-4 px-6 text-sm font-medium text-white/60">Date</th>
                <th className="py-4 px-6 text-sm font-medium text-white/60">Contact</th>
                <th className="py-4 px-6 text-sm font-medium text-white/60">Service</th>
                <th className="py-4 px-6 text-sm font-medium text-white/60">Status</th>
                <th className="py-4 px-6 text-sm font-medium text-white/60 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((lead) => {
                const date = new Date(lead.created_at).toLocaleDateString(undefined, { 
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                });
                
                return (
                  <tr key={lead._id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6 text-sm text-white/80 whitespace-nowrap">
                      {date}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-white">{lead.contact_name || 'Anonymous'}</div>
                      <div className="text-sm text-white/50">{lead.contact_email || lead.contact_phone || 'No contact info'}</div>
                    </td>
                    <td className="py-4 px-6">
                      {lead.service_type ? (
                        <span className="capitalize text-sm bg-white/10 text-white px-2.5 py-1 rounded-md">
                          {lead.service_type}
                        </span>
                      ) : (
                        <span className="text-white/40 text-sm italic">Unknown</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {lead.status === 'completed' && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                        {lead.status === 'open' && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                        <span className="text-sm capitalize text-white/80">{lead.status}</span>
                        {lead.escalate && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded ml-2 font-medium">
                            Escalated
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => setSelectedLead(lead)}
                        className="text-sm text-white hover:text-white/70 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLead && (
        <LeadDetailsModal 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)} 
        />
      )}
    </div>
  );
}
