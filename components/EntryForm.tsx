import React, { useState, useEffect } from 'react';
import { TimelineEntry, CategoryType } from '../types';
import { CATEGORIES } from '../constants';
import { X, Upload, Loader2, FileText, ImageIcon } from 'lucide-react';
import { dataService } from '../services/dataService';

interface EntryFormProps {
  initialData?: TimelineEntry;
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<TimelineEntry, 'id' | 'createdAt'> | TimelineEntry) => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({ initialData, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<TimelineEntry>>({
    title: '',
    description: '',
    category: 'EVENT',
    date: new Date().toISOString().split('T')[0],
    featured: false,
    mediaUrl: '',
    mediaUrls: [],
    year: new Date().getFullYear(),
  });
  const [currentUrl, setCurrentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset for new entry
      setFormData({
        title: '',
        description: '',
        category: 'EVENT',
        date: new Date().toISOString().split('T')[0],
        featured: false,
        mediaUrl: '',
        mediaUrls: [],
        year: new Date().getFullYear(),
      });
      setCurrentUrl('');
      setFile(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'date') {
      const year = new Date(value).getFullYear();
      setFormData(prev => ({ ...prev, [name]: value, year }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, featured: e.target.checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUrl) return;

    let processedUrl = currentUrl;
    // Auto-convert Google Drive viewer links
    if (processedUrl.includes('drive.google.com') && processedUrl.includes('/view')) {
      const driveIdMatch = processedUrl.match(/\/d\/([^/]+)/);
      if (driveIdMatch && driveIdMatch[1]) {
        processedUrl = `https://drive.google.com/thumbnail?id=${driveIdMatch[1]}&sz=w1000`;
      }
    }

    setFormData(prev => ({
      ...prev,
      mediaUrls: [...(prev.mediaUrls || []), processedUrl]
    }));
    setCurrentUrl('');
  };

  const removeUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: (prev.mediaUrls || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalMediaUrls = [...(formData.mediaUrls || [])];
      let primaryMediaUrl = formData.mediaUrl || '';

      if (file) {
        const uploadedUrl = await dataService.uploadFile(file);
        // MOCK HACK: If it's a PDF, append a hash/param
        let finalUploadedUrl = uploadedUrl;
        if (file.type === 'application/pdf') {
          finalUploadedUrl += '#type=pdf';
        }
        primaryMediaUrl = finalUploadedUrl;
        finalMediaUrls.push(finalUploadedUrl);
      }

      // If no file but we have URLs, ensure mediaUrl is set to the first one for backward compat
      if (!primaryMediaUrl && finalMediaUrls.length > 0) {
        primaryMediaUrl = finalMediaUrls[0];
      }

      const payload: any = {
        ...formData,
        mediaUrl: primaryMediaUrl,
        mediaUrls: finalMediaUrls,
        year: new Date(formData.date!).getFullYear(),
      };

      await onSave(payload);
      onClose();
    } catch (error) {
      console.error("Failed to save", error);
      alert("Failed to save entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Activity' : 'New Activity'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto no-scrollbar">
          <form id="entry-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: National Robotics Competition"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>

            {/* Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                >
                  {Object.values(CATEGORIES).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  required
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Briefly describe the activity, achievement, or event..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              ></textarea>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Attachment</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors bg-slate-50">
                <div className="space-y-1 text-center">
                  {file ? (
                    file.type.includes('pdf') ? <FileText className="mx-auto h-8 w-8 text-red-400" /> : <ImageIcon className="mx-auto h-8 w-8 text-indigo-400" />
                  ) : (
                    <Upload className="mx-auto h-8 w-8 text-slate-400" />
                  )}
                  <div className="flex text-sm text-slate-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,.pdf" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">PNG, JPG, PDF up to 5MB</p>
                  {file && <p className="text-sm text-slate-800 font-medium mt-2">{file.name}</p>}
                  {!file && formData.mediaUrl && <p className="text-xs text-slate-400 break-all mt-2">Current: {formData.mediaUrl.substring(0, 30)}...</p>}
                </div>
              </div>
            </div>

            {/* Image URLs Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Image URLs (Google Drive / Direct Links)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                  placeholder="Paste link here..."
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(e); } }} // Allow Enter key
                  className="flex-grow px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Add
                </button>
              </div>

              {/* URL List */}
              {formData.mediaUrls && formData.mediaUrls.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
                  {formData.mediaUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded border border-slate-200 text-sm">
                      <span className="truncate max-w-[85%] text-slate-600" title={url}>{url}</span>
                      <button type="button" onClick={() => removeUrl(idx)} className="text-red-400 hover:text-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">Add multiple Google Drive or direct image links.</p>
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center">
              <input
                id="featured"
                name="featured"
                type="checkbox"
                checked={formData.featured}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-slate-900">
                Mark as Featured Achievement
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            form="entry-form"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-70 transition-colors"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {initialData ? 'Update Entry' : 'Create Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};