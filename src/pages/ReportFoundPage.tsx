import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  Camera, 
  X, 
  Sparkles, 
  Building2,
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';
import { ItemCategory } from '../types';

const reportFoundSchema = z.object({
  title: z.string().min(3, 'Item title must be at least 3 characters').max(100),
  category: z.string().min(1, 'Please select an item category'),
  location_name: z.string().min(3, 'Please describe where you found it'),
  location_building: z.string().optional(),
  campus_zone: z.string().optional(),
  custody_location: z.string().min(3, 'Specify where the item is physically deposited (e.g., Security Desk 1, Library Counter)'),
  date_lost_or_found: z.string().min(1, 'Please select approximate date and time found'),
  description: z.string().min(10, 'Please provide at least 10 characters describing visible characteristics'),
  confidential_notes: z.string().optional(),
  contact_preference: z.enum(['in_app', 'email', 'phone']).default('in_app'),
});

type ReportFoundFormData = z.infer<typeof reportFoundSchema>;

export const ReportFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { createReport, uploadPhoto } = useItems();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdItemId, setCreatedItemId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportFoundFormData>({
    resolver: zodResolver(reportFoundSchema),
    defaultValues: {
      date_lost_or_found: new Date().toISOString().slice(0, 16),
      campus_zone: 'Central Campus',
      custody_location: 'Campus Security Office - Custodial Desk',
      contact_preference: 'in_app',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: ReportFoundFormData) => {
    if (!isAuthenticated || !user) {
      setSubmitError('You must be signed in to submit a report.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let uploadedUrl: string | undefined = undefined;

      // Real Supabase Storage upload
      if (selectedFile) {
        uploadedUrl = await uploadPhoto(selectedFile);
      }

      const created = await createReport({
        type: 'found',
        title: data.title.trim(),
        category: data.category as ItemCategory,
        description: data.description.trim(),
        location_name: data.location_name.trim(),
        location_building: data.location_building?.trim() || data.location_name.split(',')[0].trim(),
        campus_zone: data.campus_zone || 'Central Campus',
        custody_location: data.custody_location.trim(),
        date_lost_or_found: new Date(data.date_lost_or_found).toISOString(),
        confidential_notes: data.confidential_notes?.trim() || undefined,
        contact_preference: data.contact_preference,
        primary_image_url: uploadedUrl,
      });

      setCreatedItemId(created.id);
    } catch (err: unknown) {
      console.error('Failed to submit found report:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit report. Please check your Supabase connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdItemId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-elevated">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 border border-teal-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Report Persisted In Database
          </span>
          <h2 className="text-2xl font-extrabold text-navy-950 mt-2">
            Found Belonging Logged
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Thank you for turning in a found item. Your report is securely stored in Supabase PostgreSQL and visible in Explore. Potential claimants can now request verified return through Campus Security.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={`/items/${createdItemId}`}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-semibold shadow-soft transition-all"
            >
              View Report Details
            </Link>
            <Link
              to="/explore"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
            >
              Back to Explore
            </Link>
            <Link
              to="/my-cases"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all"
            >
              My Recovery Cases
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 min-h-[85vh]">
      <Link
        to="/explore"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Explore</span>
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-card">
        {/* Header */}
        <div className="border-b border-slate-100 pb-6 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Campus Found Property Intake</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
            Log a Found Belonging
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Help an owner recover their belongings. State where the item was discovered and where it is currently stored.
          </p>
        </div>

        {submitError && (
          <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Submission Failed</p>
              <p className="mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Item Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Wireless Bluetooth Earbuds with Dark Blue Protective Case"
              {...register('title')}
              className={`w-full px-4 py-2.5 rounded-xl border text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-600 ${
                errors.title ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.title && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Category & Custody Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('category')}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs bg-white text-slate-800 outline-none focus:ring-2 focus:ring-teal-600 ${
                  errors.category ? 'border-rose-300' : 'border-slate-200'
                }`}
              >
                <option value="">Select category...</option>
                <option value="electronics">Electronics & Audio</option>
                <option value="keys">Keys & Keycards</option>
                <option value="wallets_cards">Wallets & Payment Cards</option>
                <option value="id_cards">Student / Campus IDs</option>
                <option value="eyewear">Eyewear & Sunglasses</option>
                <option value="clothing">Jackets & Clothing</option>
                <option value="bags">Backpacks & Bags</option>
                <option value="books_notes">Books & Notebooks</option>
                <option value="other">Water Bottles & Other</option>
              </select>
              {errors.category && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Custody / Drop-off Location <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Campus Security Office Desk 2, Library Help Counter"
                  {...register('custody_location')}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-600 ${
                    errors.custody_location ? 'border-rose-300' : 'border-slate-200'
                  }`}
                />
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              {errors.custody_location && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.custody_location.message}</p>
              )}
            </div>
          </div>

          {/* Discovery Location & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Where Did You Find It? <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Student Center Commons 1st Floor Bench"
                {...register('location_name')}
                className={`w-full px-4 py-2.5 rounded-xl border text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-600 ${
                  errors.location_name ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
              {errors.location_name && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.location_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Date Discovered <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register('date_lost_or_found')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Visible Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="State clear general features (e.g. navy silicone case with silver clip). Do not give away all secret serials so that real owners can prove ownership."
              {...register('description')}
              className={`w-full px-4 py-3 rounded-xl border text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-600 ${
                errors.description ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            {errors.description && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Photograph Upload to Supabase Storage */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Photograph Upload (Optional)
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Upload a clear photo of the found item. Stored in Supabase Storage.
            </p>

            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Selected upload preview"
                  className="w-44 h-32 object-cover rounded-2xl border border-slate-200 shadow-xs"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-600 text-white shadow-xs hover:bg-rose-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-teal-600 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-teal-50/20 group">
                <Camera className="w-8 h-8 text-slate-400 group-hover:text-teal-600 mb-2 transition-colors" />
                <span className="text-xs font-semibold text-slate-700">
                  Click to select a photo
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  JPEG, PNG, WEBP up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Confidential Clues */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-950">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Confidential Verification Clues (Private to Security & Reporter)</span>
            </div>
            <p className="text-[11px] text-teal-900 leading-relaxed">
              Record secret identifiers (e.g. initials inside case, battery level, specific stickers, partial serial numbers). <strong>These will not appear on public listings</strong> and are used exclusively to cross-examine claims.
            </p>
            <textarea
              rows={2}
              placeholder="e.g. Engraved initials on the inner earbud rim, distinctive keychain clip..."
              {...register('confidential_notes')}
              className="w-full px-3.5 py-2 rounded-xl border border-teal-200 text-xs bg-white text-slate-800 outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/explore"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin text-teal-400" />}
              <span>{isSubmitting ? 'Registering with Supabase...' : 'Submit Found Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
