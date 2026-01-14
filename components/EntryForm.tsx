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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-800">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Edit Activity' : 'New Activity'}
          </h2>
          <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="entry-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-1">Title</label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: National Robotics Competition"
                className="w-full px-4 py-2 bg-black border border-stone-700 rounded-lg text-white placeholder:text-stone-600 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
              />
            </div>

            {/* Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-400 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                >
                  {Object.values(CATEGORIES).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-400 mb-1">Date</label>
                <input
                  required
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-1">Description</label>
              <textarea
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Briefly describe the activity, achievement, or event..."
                className="w-full px-4 py-2 bg-black border border-stone-700 rounded-lg text-white placeholder:text-stone-600 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none resize-none"
              ></textarea>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-1">Attachment</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-stone-800 border-dashed rounded-lg hover:border-blue-500/50 transition-colors bg-black/40">
                <div className="space-y-1 text-center">
                  {file ? (
                    file.type.includes('pdf') ? <FileText className="mx-auto h-8 w-8 text-red-500" /> : <ImageIcon className="mx-auto h-8 w-8 text-blue-500" />
                  ) : (
                    <Upload className="mx-auto h-8 w-8 text-stone-600" />
                  )}
                  <div className="flex text-sm text-stone-400 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,.pdf" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-stone-600">PNG, JPG, PDF up to 5MB</p>
                  {file && <p className="text-sm text-white font-medium mt-2">{file.name}</p>}
                  {!file && formData.mediaUrl && <p className="text-xs text-stone-500 break-all mt-2">Current: {formData.mediaUrl.substring(0, 30)}...</p>}
                </div>
              </div>
            </div>

            {/* Image URLs Input */}
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-1">Image URLs (Google Drive / Direct Links)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                  placeholder="Paste link here..."
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(e); } }} // Allow Enter key
                  className="flex-grow px-4 py-2 bg-black border border-stone-700 rounded-lg text-white placeholder:text-stone-600 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-4 py-2 bg-stone-800 text-stone-300 font-medium rounded-lg hover:bg-stone-700 transition-colors border border-stone-700"
                >
                  Add
                </button>
              </div>

              {/* URL List */}
              {formData.mediaUrls && formData.mediaUrls.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto mb-2 custom-scrollbar">
                  {formData.mediaUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-stone-950 px-3 py-2 rounded border border-stone-800 text-sm">
                      <span className="truncate max-w-[85%] text-stone-400" title={url}>{url}</span>
                      <button type="button" onClick={() => removeUrl(idx)} className="text-red-500 hover:text-red-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-stone-600 mt-1">Add multiple Google Drive or direct image links.</p>
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center">
              <input
                id="featured"
                name="featured"
                type="checkbox"
                checked={formData.featured}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-stone-700 rounded bg-black"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-stone-300">
                Mark as Featured Achievement
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-800 flex justify-end space-x-3 bg-stone-950 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-400 hover:bg-stone-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            form="entry-form"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-70 transition-colors"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {initialData ? 'Update Entry' : 'Create Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};