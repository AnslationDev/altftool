import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { services } from '../data/services';

const bookingSchema = z.object({
  service: z.string().min(1, "Please select a service"),
  propertyType: z.string().min(1, "Select property type"),
  bedrooms: z.string().optional(),
  squareFeet: z.string().optional(),
  address: z.string().min(5, "Please enter a valid address"),
  city: z.string().min(2, "Enter city"),
  zip: z.string().regex(/^\d{5}$/, "Enter a valid 5-digit ZIP"),
  date: z.string().min(1, "Select preferred date"),
  time: z.string().min(1, "Select preferred time"),
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(10, "Enter a valid phone number"),
  description: z.string().optional(),
});

const steps = [
  { id: 1, title: "Service", desc: "Choose service" },
  { id: 2, title: "Property", desc: "Property info" },
  { id: 3, title: "Location", desc: "Address details" },
  { id: 4, title: "Schedule", desc: "Date & time" },
  { id: 5, title: "Contact", desc: "Your info" },
];

const BookingForm = ({ initialService = '' }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = window.localStorage.getItem('pestx_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { register, handleSubmit, formState: { errors }, trigger, getValues, control, reset } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      service: initialService,
      propertyType: '',
      bedrooms: '',
      squareFeet: '',
      address: '',
      city: '',
      zip: '',
      date: '',
      time: '',
      fullName: '',
      email: '',
      phone: '',
      description: '',
    }
  });

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 1: return ['service'];
      case 2: return ['propertyType'];
      case 3: return ['address', 'city', 'zip'];
      case 4: return ['date', 'time'];
      case 5: return ['fullName', 'email', 'phone'];
      default: return [];
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    // No booking API exists yet; this only persists to localStorage on this device.
    await new Promise(resolve => setTimeout(resolve, 950));

    const ref = 'PX' + Date.now().toString().slice(-8);
    const newBooking = {
      ...data,
      id: ref,
      serviceName: services.find(s => s.slug === data.service)?.title || data.service,
      submittedAt: new Date().toISOString(),
    };

    const updated = [...bookings, newBooking];
    setBookings(updated);
    try {
      window.localStorage.setItem('pestx_bookings', JSON.stringify(updated));
    } catch {
      // Local storage can be unavailable in private browsing; the success state still works.
    }

    setBookingRef(ref);
    setIsSuccess(true);
    setIsSubmitting(false);
  };

  const resetForm = () => {
    reset();
    setCurrentStep(1);
    setIsSuccess(false);
    setBookingRef('');
  };

  const selectedService = useWatch({ control, name: 'service' });

  if (isSuccess) {
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <div className="mx-auto w-20 h-20 bg-[#4ADE80] rounded-full flex items-center justify-center mb-6">
          <Check className="w-11 h-11 text-[#14532D]" />
        </div>
        <h3 className="text-3xl font-bold tracking-tight mb-3">Request Saved</h3>
        <p className="text-[#374151] mb-2">Thank you. This was saved on your device only — no appointment was actually booked.</p>
        <div className="inline-block bg-[#F8FAFC] px-5 py-1 rounded-2xl text-sm font-semibold mb-6 tracking-wider">LOCAL REF: {bookingRef}</div>

        <div className="bg-white border rounded-3xl p-6 text-left mb-8 text-sm">
          <div className="font-semibold mb-3">Appointment Summary</div>
          <div className="space-y-1.5 text-[#374151]">
            <div><span className="font-medium">Service:</span> {services.find(s => s.slug === selectedService)?.title}</div>
            <div><span className="font-medium">Date:</span> {getValues('date')} at {getValues('time')}</div>
            <div><span className="font-medium">Location:</span> {getValues('address')}, {getValues('city')}</div>
            <div><span className="font-medium">Contact:</span> {getValues('fullName')} — {getValues('phone')}</div>
          </div>
        </div>

        <p className="text-sm text-[#64748b] mb-6">Nothing has been sent — call us for a real booking at <a href="tel:7865679554" className="font-semibold text-[#1D7A43] hover:underline">(786) 567-9554</a>.</p>

        <div className="flex gap-3 justify-center">
          <button onClick={resetForm} className="btn btn-secondary px-8">Book Another</button>
          <Link to="/contact" className="btn btn-primary px-8">Contact Us</Link>
        </div>

        {bookings.length > 1 && (
          <div className="mt-9 pt-8 border-t text-left">
            <div className="text-xs font-medium uppercase tracking-widest mb-3 text-[#64748b]">Your Recent Bookings</div>
            <div className="space-y-2 text-sm">
              {bookings.slice(-3).reverse().map((b, i) => (
                <div key={i} className="p-3 bg-[#F8FAFC] rounded-2xl flex justify-between text-xs">
                  <span>{b.serviceName}</span>
                  <span className="text-[#64748b]">{new Date(b.submittedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[780px] mx-auto">
      {/* Progress Indicator */}
      <div className="mb-9 flex justify-between px-1">
        {steps.map((step, idx) => (
          <div key={idx} className="step flex-1 text-center">
            <div className={`step-dot mx-auto mb-1.5 text-xs ${currentStep === step.id ? 'active' : currentStep > step.id ? 'completed' : 'inactive'}`}>
              {currentStep > step.id ? <Check size={13} /> : step.id}
            </div>
            <div className="text-[11px] font-semibold tracking-wider text-[#64748b]">{step.title}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-8 md:p-10">
        <AnimatePresence mode="wait">
          {/* STEP 1: Choose Service */}
          {currentStep === 1 && (
            <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="form-step">
              <h3 className="text-2xl font-bold mb-6">Which service do you need?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((svc) => (
                  <label key={svc.slug} className={`border-2 rounded-2xl p-4 cursor-pointer flex gap-4 items-center transition-all ${selectedService === svc.slug ? 'border-[#1D7A43] bg-[#F8FAFC]' : 'border-[#E5E7EB] hover:border-[#1D7A43]/40'}`}>
                    <input type="radio" value={svc.slug} {...register('service')} className="hidden" aria-describedby={errors.service ? 'service-error' : undefined} />
                    <div className="flex-1">
                      <div className="font-semibold">{svc.title}</div>
                      <div className="text-xs text-[#64748b]">Starting at ${svc.startingPrice}</div>
                    </div>
                    <div className="text-right text-xs font-semibold text-[#1D7A43]">{svc.duration}</div>
                  </label>
                ))}
              </div>
              {errors.service && <p id="service-error" role="alert" className="text-red-500 text-sm mt-2">{errors.service.message}</p>}
            </motion.div>
          )}

          {/* STEP 2: Property Info */}
          {currentStep === 2 && (
            <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="form-step">
              <h3 className="text-2xl font-bold mb-6">Tell us about your property</h3>
              <div className="space-y-5">
                <div>
                  <label className="label">Property Type</label>
                  <select {...register('propertyType')} className="input" aria-invalid={!!errors.propertyType} aria-describedby={errors.propertyType ? 'propertyType-error' : undefined}>
                    <option value="">Select type</option>
                    <option value="Single Family Home">Single Family Home</option>
                    <option value="Condo / Apartment">Condo / Apartment</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Commercial">Commercial / Business</option>
                    <option value="Multi-Family">Multi-Family Building</option>
                  </select>
                  {errors.propertyType && <p id="propertyType-error" role="alert" className="text-red-500 text-sm mt-1">{errors.propertyType.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label"># of Bedrooms (optional)</label>
                    <input {...register('bedrooms')} placeholder="3" className="input" />
                  </div>
                  <div>
                    <label className="label">Approx. Square Feet</label>
                    <input {...register('squareFeet')} placeholder="1800" className="input" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Address */}
          {currentStep === 3 && (
            <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="form-step">
              <h3 className="text-2xl font-bold mb-6">Where is the property located?</h3>
              <div className="space-y-5">
                <div>
                  <label className="label">Street Address</label>
                  <input {...register('address')} placeholder="1420 SW 8th Street" className={`input ${errors.address ? 'error' : ''}`} aria-invalid={!!errors.address} aria-describedby={errors.address ? 'address-error' : undefined} />
                  {errors.address && <p id="address-error" role="alert" className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">City</label>
                    <input {...register('city')} placeholder="Miami" className={`input ${errors.city ? 'error' : ''}`} aria-invalid={!!errors.city} aria-describedby={errors.city ? 'city-error' : undefined} />
                    {errors.city && <p id="city-error" role="alert" className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="label">ZIP Code</label>
                    <input {...register('zip')} placeholder="33135" maxLength={5} className={`input ${errors.zip ? 'error' : ''}`} aria-invalid={!!errors.zip} aria-describedby={errors.zip ? 'zip-error' : undefined} />
                    {errors.zip && <p id="zip-error" role="alert" className="text-red-500 text-sm mt-1">{errors.zip.message}</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Date & Time */}
          {currentStep === 4 && (
            <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="form-step">
              <h3 className="text-2xl font-bold mb-6">When would you like us to come?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label flex items-center gap-2"><Calendar size={15} /> Preferred Date</label>
                  <input type="date" {...register('date')} className={`input ${errors.date ? 'error' : ''}`} min={new Date().toISOString().split('T')[0]} aria-invalid={!!errors.date} aria-describedby={errors.date ? 'date-error' : undefined} />
                  {errors.date && <p id="date-error" role="alert" className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
                </div>
                <div>
                  <label className="label flex items-center gap-2"><Clock size={15} /> Preferred Time</label>
                  <select {...register('time')} className={`input ${errors.time ? 'error' : ''}`} aria-invalid={!!errors.time} aria-describedby={errors.time ? 'time-error' : undefined}>
                    <option value="">Select a time window</option>
                    <option value="8:00 AM - 10:00 AM">8:00 AM — 10:00 AM</option>
                    <option value="10:00 AM - 12:00 PM">10:00 AM — 12:00 PM</option>
                    <option value="12:00 PM - 2:00 PM">12:00 PM — 2:00 PM</option>
                    <option value="2:00 PM - 4:00 PM">2:00 PM — 4:00 PM</option>
                    <option value="4:00 PM - 6:00 PM">4:00 PM — 6:00 PM</option>
                  </select>
                  {errors.time && <p id="time-error" role="alert" className="text-red-500 text-sm mt-1">{errors.time.message}</p>}
                </div>
              </div>
              <p className="text-xs text-[#64748b] mt-5">We will contact you to confirm an exact arrival window.</p>
            </motion.div>
          )}

          {/* STEP 5: Contact Info */}
          {currentStep === 5 && (
            <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="form-step">
              <h3 className="text-2xl font-bold mb-6">How can we reach you?</h3>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input {...register('fullName')} placeholder="Alex Rivera" className={`input ${errors.fullName ? 'error' : ''}`} aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? 'fullName-error' : undefined} />
                    {errors.fullName && <p id="fullName-error" role="alert" className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="label">Phone Number</label>
                    <input {...register('phone')} placeholder="(305) 555-0192" className={`input ${errors.phone ? 'error' : ''}`} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-error' : undefined} />
                    {errors.phone && <p id="phone-error" role="alert" className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" {...register('email')} placeholder="you@email.com" className={`input ${errors.email ? 'error' : ''}`} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} />
                  {errors.email && <p id="email-error" role="alert" className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="label">Additional Details (Optional)</label>
                  <textarea {...register('description')} rows={3} placeholder="Tell us more about the issue, e.g. saw mice in kitchen last week..." className="input resize-y min-h-[88px]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 mt-6 border-t">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="btn btn-secondary px-6 disabled:opacity-40 flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {currentStep < 5 ? (
            <button type="button" onClick={nextStep} className="btn btn-primary px-8 flex items-center gap-2">
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary px-9 disabled:opacity-75 flex items-center gap-2"
            >
              {isSubmitting ? "Submitting..." : "Confirm Booking"}
            </button>
          )}
        </div>
      </form>
      <p className="text-center text-xs mt-5 text-[#64748b]">No payment required to book. We’ll contact you to confirm.</p>
    </div>
  );
};

export default BookingForm;
