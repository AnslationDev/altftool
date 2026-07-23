import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Send } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Phone number required"),
  service: z.string().optional(),
  message: z.string().min(15, "Please provide more details"),
});

const ContactForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data) => {
    await new Promise(r => setTimeout(r, 700));
    setSubmitted(true);
    setTimeout(() => {
      reset();
      setSubmitted(false);
    }, 2600);
  };

  if (submitted) {
    return (
      <div className="text-center py-9 px-4 bg-[#F8FAFC] rounded-3xl">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#1D7A43] flex items-center justify-center text-white">
          <Send size={30} />
        </div>
        <div className="text-2xl font-semibold mb-2">Thank you!</div>
        <p className="text-[#374151]">We've received your message and will reply within a few hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label">Full Name</label>
          <input {...register('name')} className={`input ${errors.name ? 'error' : ''}`} placeholder="Maria Gonzalez" />
          {errors.name && <p className="text-red-500 mt-1 text-sm">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Phone</label>
          <input {...register('phone')} className={`input ${errors.phone ? 'error' : ''}`} placeholder="(786) 555-1212" />
          {errors.phone && <p className="text-red-500 mt-1 text-sm">{errors.phone.message}</p>}
        </div>
      </div>
      <div>
        <label className="label">Email</label>
        <input type="email" {...register('email')} className={`input ${errors.email ? 'error' : ''}`} placeholder="you@email.com" />
        {errors.email && <p className="text-red-500 mt-1 text-sm">{errors.email.message}</p>}
      </div>
      <div>
        <label className="label">Service Needed (Optional)</label>
        <select {...register('service')} className="input">
          <option value="">General Inquiry</option>
          <option value="Rodent">Rodent Control</option>
          <option value="Termite">Termite Control</option>
          <option value="Bee">Bee / Wasp Removal</option>
          <option value="Mosquito">Mosquito Control</option>
          <option value="Other">Other / Multiple</option>
        </select>
      </div>
      <div>
        <label className="label">Message</label>
        <textarea {...register('message')} rows={5} className={`input resize-y ${errors.message ? 'error' : ''}`} placeholder="Please describe your pest issue and any relevant details..."></textarea>
        {errors.message && <p className="text-red-500 mt-1 text-sm">{errors.message.message}</p>}
      </div>
      <button type="submit" className="btn btn-primary w-full py-3.5 text-base font-semibold">Send Message</button>
      <p className="text-xs text-center text-[#64748b]">We typically respond within 2 business hours.</p>
    </form>
  );
};

export default ContactForm;
