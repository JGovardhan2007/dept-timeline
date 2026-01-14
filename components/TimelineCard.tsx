import React, { useState, useEffect, useRef } from 'react';
import { TimelineEntry } from '../types';
import { CATEGORIES } from '../constants';
import { Star, Trash2, Edit, FileText, ArrowRight, ChevronLeft, ChevronRight, Share2, Check } from 'lucide-react';

export const ImageWithFallback = ({ src, className }: { src: string, className?: string }) => {
    const [error, setError] = useState(false);

    if (error) {
        return (
            <div className={`w-full h-full flex flex-col items-center justify-center bg-stone-900 text-stone-700 p-1`}>
                <span className="text-[10px] text-center leading-tight">ERR</span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt=""
            className={className}
            onError={() => setError(true)}
            referrerPolicy="no-referrer"
        />
    );
};

export const ImageCarousel = ({ urls, className }: { urls: string[], className?: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance if multiple images? Maybe not for thumbnails, manual is better.

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % urls.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + urls.length) % urls.length);
    };

    if (!urls || urls.length === 0) return null;

    if (urls.length === 1) {
        return <ImageWithFallback src={urls[0]} className={className} />;
    }

    return (
        <div className={`relative group/carousel w-full h-full`}>
            <ImageWithFallback src={urls[currentIndex]} className={className} />

            {/* Dots Indicator */}
            <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1 z-10">
                {urls.map((_, idx) => (
                    <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`} />
                ))}
            </div>

            {/* Navigation Buttons (Always visible or visible on hover) */}
            <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover/carousel:opacity-100 transition-all backdrop-blur-sm"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover/carousel:opacity-100 transition-all backdrop-blur-sm"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};

interface TimelineCardProps {
    entry: TimelineEntry;
    index: number;
    isAdmin?: boolean;
    onEdit?: (entry: TimelineEntry) => void;
    onDelete?: (id: string) => void;
    onView?: (entry: TimelineEntry) => void;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({ entry, index, isAdmin, onEdit, onDelete, onView }) => {
    const categoryConfig = CATEGORIES[entry.category];
    const Icon = categoryConfig.Icon;

    // Ref for scroll animation
    const cardRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Only animate once
                }
            },
            {
                threshold: 0.1,
                rootMargin: '-50px', // Trigger slightly after entering viewport for effect
            }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, []);


    const dateObj = new Date(entry.date);
    const day = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' }).replace('/', '/');
    const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const year = dateObj.getFullYear();

    // Check if stacked styling is needed
    const isFeatured = entry.featured;

    return (
        <div ref={cardRef} className={`relative group/card flex gap-4 sm:gap-6 transform transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'}`}>

            {/* 1. Date Column (Left) */}
            <div className="w-16 sm:w-20 pt-2 flex flex-col items-end text-right flex-shrink-0">
                <span className="text-[10px] font-bold text-stone-600 leading-tight block">{year}</span>
                <span className="text-xl sm:text-2xl font-black text-stone-400 leading-none block tracking-tighter">{day}</span>
                <span className="text-[10px] font-mono text-stone-600 mt-1 block">{time}</span>
            </div>

            {/* 2. Timeline Line & Dot */}
            <div className="relative flex flex-col items-center flex-shrink-0 w-4">
                {/* Dot */}
                <div className={`w-3 h-3 rounded-full border-2 border-black z-10 mt-3 transition-all duration-300 ${isFeatured ? 'bg-amber-500 scale-125' : 'bg-stone-600 group-hover/card:bg-blue-500 group-hover/card:scale-125 group-hover/card:border-blue-900'}`}></div>
            </div>

            {/* 3. Content Card */}
            <div className="flex-grow min-w-0 pb-4">
                <CardContent
                    entry={entry}
                    categoryConfig={categoryConfig}
                    isAdmin={isAdmin}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                    isFeatured={isFeatured}
                />
            </div>

        </div>
    );
};

// Sub-components
const CardContent = ({
    entry,
    categoryConfig,
    isAdmin,
    onEdit,
    onDelete,
    onView,
    isFeatured
}: any) => {

    const [copied, setCopied] = useState(false);

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}?id=${entry.id}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="relative group/content">
            {/* Stacked Cards Effect (Interactive Hover) */}
            <div className={`absolute inset-0 bg-stone-800 rounded-xl translate-x-1 translate-y-1 sm:translate-x-2 sm:translate-y-2 -z-10 border border-stone-700/50 transition-all duration-300 ${isFeatured ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100'}`}></div>
            <div className={`absolute inset-0 bg-stone-800/60 rounded-xl translate-x-2 translate-y-2 sm:translate-x-4 sm:translate-y-4 -z-20 border border-stone-700/30 transition-all duration-300 ${isFeatured ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100'}`}></div>

            <div
                onClick={() => onView && onView(entry)}
                className={`
                    relative 
                    bg-stone-900 
                    rounded-xl 
                    overflow-hidden 
                    border 
                    cursor-pointer 
                    transition-all 
                    duration-300
                    hover:-translate-y-1
                    ${isFeatured
                        ? 'border-amber-500 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.3)]'
                        : 'border-stone-800 group-hover/card:border-blue-600 group-hover/card:shadow-[0_4px_20px_-4px_rgba(37,99,235,0.3)]'
                    }
                `}
            >
                {/* Hover Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover/content:opacity-30 transition-opacity duration-500 pointer-events-none z-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/content:animate-[shine_1.5s_infinite]" />
                </div>
                {/* Image Section */}
                {entry.mediaUrls && entry.mediaUrls.length > 0 && (
                    <div className={`w-full ${isFeatured ? 'aspect-video' : 'h-48'} bg-black border-b border-stone-800`}>
                        <ImageCarousel urls={entry.mediaUrls} className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Content Body */}
                <div className="p-4 sm:p-5">
                    {/* Header Row */}
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1 block`}>
                            {categoryConfig.label}
                        </span>

                        <div className="flex items-center gap-1 z-20 relative">
                            {copied && (
                                <span className="absolute -top-8 right-0 bg-black text-white text-[10px] py-1 px-2 rounded border border-white/20 whitespace-nowrap animate-fade-in z-50">
                                    Link Copied!
                                </span>
                            )}
                            <button
                                onClick={handleShare}
                                className="p-1 text-stone-500 hover:text-white hover:bg-stone-800 rounded transition-colors"
                                title="Share"
                            >
                                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Share2 className="w-3 h-3" />}
                            </button>
                            {isAdmin && <AdminButtons onEdit={() => onEdit(entry)} onDelete={() => onDelete(entry.id)} />}
                        </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-stone-100 mb-2 leading-snug">
                        {entry.title}
                    </h3>

                    <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
                        {entry.description}
                    </p>

                    {/* Footer Row (Tags) */}
                    <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-white/5">
                        <span className="inline-flex items-center text-[10px] font-medium text-stone-500 bg-stone-950 border border-stone-800 px-2 py-0.5 rounded-full">
                            #{entry.category.toLowerCase()}
                        </span>
                        {isFeatured && <span className="inline-flex items-center text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">#FEATURED</span>}
                    </div>
                </div>

            </div>
        </div>
    )
};

const AdminButtons = ({ onEdit, onDelete }: any) => (
    <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 text-stone-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"><Edit className="w-3 h-3" /></button>
        <button onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete?')) onDelete(); }} className="p-1 text-stone-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"><Trash2 className="w-3 h-3" /></button>
    </div>
);