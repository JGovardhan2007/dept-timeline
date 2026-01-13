import React, { useState, useEffect, useRef } from 'react';
import { TimelineEntry } from '../types';
import { CATEGORIES } from '../constants';
import { Star, Trash2, Edit, FileText, ArrowRight } from 'lucide-react';

export const ImageWithFallback = ({ src, className }: { src: string, className?: string }) => {
    const [error, setError] = useState(false);

    if (error) {
        return (
            <div className={`w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-1`}>
                <span className="text-[10px] text-center leading-tight">Image Error</span>
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

            {/* Navigation Buttons (Only visible on hover) */}
            <button
                onClick={prevImage}
                className="absolute left-0 top-0 bottom-0 px-1 bg-black/10 hover:bg-black/30 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity flex items-center justify-center"
            >
                <span className="text-xs">&lsaquo;</span>
            </button>
            <button
                onClick={nextImage}
                className="absolute right-0 top-0 bottom-0 px-1 bg-black/10 hover:bg-black/30 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity flex items-center justify-center"
            >
                <span className="text-xs">&rsaquo;</span>
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
                threshold: 0.1, // Trigger when 10% visible
                rootMargin: '50px',
            }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Determine layout direction (Alternating)
    const isLeft = index % 2 === 0;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const formatYear = (dateStr: string) => {
        return new Date(dateStr).getFullYear();
    }

    return (
        <div ref={cardRef} className={`relative mb-12 last:mb-0 group/card reveal-on-scroll ${isVisible ? 'is-visible' : ''}`}>

            {/* Desktop Layout (md+) */}
            <div className="hidden md:grid md:grid-cols-11 items-center">

                {/* Left Side */}
                <div className={`col-span-5 ${isLeft ? 'text-right pr-8' : 'text-right pr-8'}`}>
                    {isLeft ? (
                        <CardContent
                            entry={entry}
                            categoryConfig={categoryConfig}
                            isAdmin={isAdmin}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onView={onView}
                            align="right"
                        />
                    ) : (
                        <DatePill date={formatDate(entry.date)} year={formatYear(entry.date)} featured={entry.featured} align="right" />
                    )}
                </div>

                {/* Center Line & Icon */}
                <div className="col-span-1 flex justify-center relative h-full min-h-[120px]">
                    {/* Vertical Line */}
                    <div className="absolute top-0 bottom-0 w-1 bg-slate-200 -z-10 transform origin-top transition-transform duration-1000 ease-out"></div>

                    {/* Icon Node */}
                    <div className={`relative z-10 w-12 h-12 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-all duration-300 group-hover/card:scale-110 group-hover/card:shadow-lg icon-float ${categoryConfig.bgColor} ${categoryConfig.color}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>

                {/* Right Side */}
                <div className={`col-span-5 ${isLeft ? 'text-left pl-8' : 'text-left pl-8'}`}>
                    {isLeft ? (
                        <DatePill date={formatDate(entry.date)} year={formatYear(entry.date)} featured={entry.featured} align="left" />
                    ) : (
                        <CardContent
                            entry={entry}
                            categoryConfig={categoryConfig}
                            isAdmin={isAdmin}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onView={onView}
                            align="left"
                        />
                    )}
                </div>

            </div>

            {/* Mobile Layout (< md) */}
            <div className="md:hidden pl-10 relative">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-0 bottom-0 w-1 bg-slate-200"></div>

                {/* Icon Node */}
                <div className={`absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 transition-transform duration-300 group-hover/card:scale-110 ${categoryConfig.bgColor} ${categoryConfig.color}`}>
                    <Icon className="w-5 h-5" />
                </div>

                {/* Mobile Card */}
                <div className="mb-6 pt-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-white/80 backdrop-blur px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
                            {formatDate(entry.date)}, {formatYear(entry.date)}
                        </span>
                        {entry.featured && <Star className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />}
                    </div>

                    <CardContent
                        entry={entry}
                        categoryConfig={categoryConfig}
                        isAdmin={isAdmin}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onView={onView}
                        align="left"
                        isMobile
                    />
                </div>
            </div>

        </div>
    );
};

// Sub-components

const DatePill = ({ date, year, featured, align }: { date: string, year: number, featured: boolean, align: 'left' | 'right' }) => (
    <div className={`flex flex-col justify-center transition-all duration-500 ${align === 'right' ? 'items-end' : 'items-start'}`}>
        <div className={`flex flex-col ${align === 'right' ? 'items-end' : 'items-start'} group-hover/card:scale-105 transition-transform duration-300`}>
            <div className="text-2xl font-black text-slate-300 leading-none mb-1 group-hover/card:text-slate-400 transition-colors">{year}</div>
            <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold shadow-sm 
            bg-gradient-to-r from-indigo-500 to-violet-500 text-white`}>
                {date}
            </div>
        </div>

        {featured && (
            <div className="mt-2 flex items-center text-amber-500 text-xs font-bold uppercase tracking-wide bg-amber-50 px-2 py-1 rounded border border-amber-100">
                <Star className="w-3 h-3 mr-1 fill-amber-500" /> Featured
            </div>
        )}
    </div>
);

const CardContent = ({
    entry,
    categoryConfig,
    isAdmin,
    onEdit,
    onDelete,
    onView,
    align,
    isMobile
}: any) => {
    // Determine styles based on alignment
    const isRightAligned = align === 'right' && !isMobile;
    const isPdf = entry.mediaUrl?.toLowerCase().includes('.pdf') || entry.mediaUrl?.toLowerCase().includes('type=pdf');

    return (
        <div
            onClick={() => onView && onView(entry)}
            className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover-bounce cursor-pointer group relative overflow-hidden h-full flex flex-col ${isRightAligned ? 'text-right items-end' : 'text-left items-start'}`}
        >

            {/* Decorative Top Border */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${categoryConfig.bgColor.replace('bg-', 'bg-').replace('50', '500')}`}></div>

            {/* Category Tag & Admin */}
            <div className={`w-full mb-3 flex ${isRightAligned ? 'justify-end flex-row-reverse' : 'justify-between'} items-center gap-2`}>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${categoryConfig.bgColor} ${categoryConfig.color}`}>
                    {categoryConfig.label}
                </span>

                {/* Admin Controls */}
                {isAdmin && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <AdminButtons onEdit={() => onEdit(entry)} onDelete={() => onDelete(entry.id)} />
                    </div>
                )}
            </div>

            <div className="flex gap-4 w-full">
                {/* Thumbnail (if exists and on Desktop/Mobile Logic) */}
                {entry.mediaUrls && entry.mediaUrls.length > 0 && !isRightAligned && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-md transition-all relative">
                        {isPdf ? (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-red-400">
                                <FileText className="w-6 h-6" />
                            </div>
                        ) : (
                            <ImageCarousel urls={entry.mediaUrls} className="w-full h-full object-cover transform transition-transform duration-500" />
                        )}
                    </div>
                )}

                <div className="flex-grow min-w-0">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-indigo-700 transition-colors">
                        {entry.title}
                    </h3>

                    <p className={`text-slate-500 text-sm leading-relaxed line-clamp-2`}>
                        {entry.description}
                    </p>
                </div>

                {/* Thumbnail (if Right Aligned) */}
                {entry.mediaUrls && entry.mediaUrls.length > 0 && isRightAligned && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-md transition-all relative">
                        {isPdf ? (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-red-400">
                                <FileText className="w-6 h-6" />
                            </div>
                        ) : (
                            <ImageCarousel urls={entry.mediaUrls} className="w-full h-full object-cover transform transition-transform duration-500" />
                        )}
                    </div>
                )}
            </div>

            {/* View Details Indicator */}
            <div className={`mt-4 pt-3 border-t border-slate-50 w-full flex ${isRightAligned ? 'justify-end' : 'justify-start'}`}>
                <span className="text-xs font-semibold text-indigo-500 flex items-center gap-1 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    View Details <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </span>
            </div>
        </div>
    )
};

const AdminButtons = ({ onEdit, onDelete }: any) => (
    <div className="flex gap-1 z-20 relative">
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><Edit className="w-3.5 h-3.5" /></button>
        <button onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete?')) onDelete(); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
    </div>
);