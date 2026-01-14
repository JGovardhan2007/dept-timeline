import React, { useEffect } from 'react';
import { TimelineEntry } from '../types';
import { CATEGORIES } from '../constants';
import { X, Calendar, Download, ExternalLink, Star, FileText } from 'lucide-react';
import { ImageCarousel } from './TimelineCard';

interface ActivityDetailProps {
  entry: TimelineEntry | null;
  onClose: () => void;
}

export const ActivityDetail: React.FC<ActivityDetailProps> = ({ entry, onClose }) => {
  if (!entry) return null;

  const categoryConfig = CATEGORIES[entry.category];
  const Icon = categoryConfig.Icon;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Normalize media
  const mediaList = entry.mediaUrls && entry.mediaUrls.length > 0
    ? entry.mediaUrls
    : (entry.mediaUrl ? [entry.mediaUrl] : []);

  const isPdf = (url: string) => url?.toLowerCase().includes('.pdf') || url?.toLowerCase().includes('type=pdf');
  const primaryIsPdf = mediaList.length > 0 && isPdf(mediaList[0]);

  // Lock Body Scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">

        {/* Close Button (Floating) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 hover:scale-110 active:scale-95 text-white rounded-full backdrop-blur-md transition-all border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Media Section */}
        <div className="relative h-64 sm:h-80 bg-black flex-shrink-0 group overflow-hidden border-b border-stone-800">
          {mediaList.length > 0 && !primaryIsPdf ? (
            <ImageCarousel
              urls={mediaList}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${categoryConfig.bgColor}`}>
              {/* Fallback pattern or PDF Icon */}
              <div className="text-center opacity-80 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {primaryIsPdf ? (
                  <FileText className={`w-20 h-20 mx-auto mb-4 ${categoryConfig.color}`} />
                ) : (
                  <Icon className={`w-24 h-24 mx-auto mb-4 ${categoryConfig.color}`} />
                )}
              </div>
              {/* Decorative Pattern Overlay */}
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            </div>
          )}

          {/* Category Badge Overlap */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 ${categoryConfig.color} shadow-sm`}>
                <Icon className="w-3 h-3 mr-1.5" />
                {categoryConfig.label}
              </span>
              {entry.featured && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-amber-900 shadow-sm">
                  <Star className="w-3 h-3 mr-1.5 fill-amber-900" />
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-grow overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center text-stone-400 text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(entry.date)}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {entry.title}
            </h2>
          </div>

          <div className="prose prose-invert max-w-none animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <p className="text-stone-300 text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
              {entry.description}
            </p>
          </div>

          {/* Attachments Section */}
          {mediaList.length > 0 && (
            <div className="mt-8 pt-6 border-t border-stone-800 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-3">
                Attachments ({mediaList.length})
              </h4>

              <div className="space-y-3">
                {mediaList.map((url, idx) => {
                  const pdf = isPdf(url);
                  return (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 border border-stone-800 rounded-xl bg-stone-950 hover:bg-stone-900 hover:border-blue-900/50 hover:shadow-md transition-all group hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-stone-900 p-2 rounded-lg border border-stone-800 shadow-sm overflow-hidden flex-shrink-0">
                          {pdf ? (
                            <FileText className="w-6 h-6 text-red-500" />
                          ) : (
                            <img
                              src={url}
                              className="w-6 h-6 object-cover group-hover:scale-110 transition-transform"
                              alt="thumb"
                              referrerPolicy="no-referrer"
                              onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/40x40?text=Err'}
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-stone-300 group-hover:text-blue-400 truncate max-w-[200px] sm:max-w-xs">{pdf ? 'View PDF Document' : 'View Original Image'} {idx + 1}</p>
                          <p className="text-xs text-stone-600 truncate max-w-[200px]">{url}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-stone-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-950 px-6 py-4 border-t border-stone-800 flex justify-between items-center text-xs text-stone-600">
          <span>ID: {entry.id.split('-')[0]}...</span>
          <span>Dept. Activity Timeline</span>
        </div>

      </div>
    </div>
  );
};