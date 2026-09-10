import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LeadDetailsModal({ lead, onClose }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const date = new Date(lead.created_at).toLocaleString();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
            <div>
              <h2 className="text-xl font-bold text-white">Lead Details</h2>
              <p className="text-sm text-white/50">{date}</p>
            </div>
            <div className="flex items-center gap-3">
              {lead.escalate && (
                <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium border border-red-500/30">
                  Needs Human Attention
                </span>
              )}
              <button 
                onClick={onClose}
                className="text-white/50 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Extracted Fields */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Contact Info</h3>
                <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div>
                    <div className="text-xs text-white/50 mb-1">Name</div>
                    <div className="text-white font-medium">{lead.contact_name || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50 mb-1">Email</div>
                    <div className="text-white font-medium">{lead.contact_email ? <a href={`mailto:${lead.contact_email}`} className="text-blue-400 hover:underline">{lead.contact_email}</a> : '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50 mb-1">Phone</div>
                    <div className="text-white font-medium">{lead.contact_phone || '—'}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Project Details</h3>
                <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div>
                    <div className="text-xs text-white/50 mb-1">Service Type</div>
                    <div className="text-white font-medium capitalize">{lead.service_type || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50 mb-1">Budget</div>
                    <div className="text-white font-medium">{lead.budget_range || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50 mb-1">Timeline</div>
                    <div className="text-white font-medium">{lead.timeline || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50 mb-1">Scope / Notes</div>
                    <div className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">{lead.scope_notes || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Transcript */}
            <div className="lg:col-span-2 flex flex-col h-full max-h-[60vh] lg:max-h-full">
              <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Conversation Transcript</h3>
              <div className="flex-1 overflow-y-auto bg-black/50 border border-white/5 rounded-xl p-4 space-y-4">
                {lead.full_transcript && lead.full_transcript.length > 0 ? (
                  lead.full_transcript.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                          msg.role === 'user' 
                            ? 'bg-white text-black rounded-tr-sm' 
                            : 'bg-white/10 text-white rounded-tl-sm border border-white/5'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-white/40 py-8 italic">No messages recorded.</div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
