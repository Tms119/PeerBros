import React, { useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const FallbackForm = ({ conversationId }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service_type: 'website',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const submitAction = useAction(api.fallback.submitFallbackLead);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);
    setError('');

    try {
      const result = await submitAction({
        conversation_id: conversationId,
        name: formData.name,
        email: formData.email,
        service_type: formData.service_type,
        notes: formData.notes,
      });

      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.error || 'Something went wrong.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl my-2 text-center">
        <h4 className="text-accent font-semibold mb-2">Message Sent!</h4>
        <p className="text-sm text-gray-300">
          Thanks for reaching out. Our team will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-xl my-2">
      <h4 className="text-white font-medium mb-3 text-sm">Contact Details</h4>
      
      {error && (
        <div className="mb-3 text-xs text-red-400 bg-red-400/10 p-2 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Your Name *"
          required
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isSubmitting}
        />
        
        <input
          type="email"
          placeholder="Email Address *"
          required
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={isSubmitting}
        />

        <select
          className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent/50"
          value={formData.service_type}
          onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
          disabled={isSubmitting}
        >
          <option value="website">Website / Landing Page</option>
          <option value="ecommerce">Ecommerce Store</option>
          <option value="crm">CRM / Automations</option>
          <option value="other">Other / Not Sure</option>
        </select>

        <textarea
          placeholder="Project Details (Optional)"
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50 resize-none"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          disabled={isSubmitting}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-1 bg-accent text-black font-medium py-2 rounded-lg text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Sending...' : 'Submit Details'}
        </button>
      </form>
    </div>
  );
};

export default FallbackForm;
