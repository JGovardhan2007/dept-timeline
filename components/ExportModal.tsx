import React, { useState } from 'react';
import { X, FileDown, Calendar, Filter as FilterIcon, Loader2 } from 'lucide-react';
import { TimelineEntry, CategoryType } from '../types';
import { CATEGORIES } from '../constants';
import { generateReport } from '../services/reportGenerator';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    entries: TimelineEntry[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, entries }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'ALL'>('ALL');
    const [includeImages, setIncludeImages] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleExport = async () => {
        setIsGenerating(true);
        try {
            // Filter Data
            let filtered = entries;

            if (startDate) {
                filtered = filtered.filter(e => e.date >= startDate);
            }
            if (endDate) {
                filtered = filtered.filter(e => e.date <= endDate);
            }
            if (selectedCategory !== 'ALL') {
                filtered = filtered.filter(e => e.category === selectedCategory);
            }

            // check if empty
            if (filtered.length === 0) {
                alert("No entries found matching parameters.");
                setIsGenerating(false);
                return;
            }

            // Generate
            await generateReport(filtered, { title: 'Export', includeImages });
            onClose();
        } catch (error) {
            console.error("Export failed", error);
            alert("Failed to generate report.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-stone-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileDown className="w-5 h-5 text-blue-500" />
                        Export Report
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full text-stone-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    {/* Date Range */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Date Range
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full bg-black border border-stone-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                />
                                <span className="text-[10px] text-stone-600 block mt-1">From</span>
                            </div>
                            <div>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="w-full bg-black border border-stone-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                />
                                <span className="text-[10px] text-stone-600 block mt-1">To</span>
                            </div>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                            <FilterIcon className="w-3 h-3" /> Category
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as any)}
                            className="w-full bg-black border border-stone-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none"
                        >
                            <option value="ALL">All Categories</option>
                            {Object.values(CATEGORIES).map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Options */}
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                        <input
                            type="checkbox"
                            checked={includeImages}
                            onChange={e => setIncludeImages(e.target.checked)}
                            className="w-4 h-4 rounded border-stone-700 bg-black text-blue-600 focus:ring-offset-0 focus:ring-2 focus:ring-blue-500"
                            id="includeImages"
                        />
                        <label htmlFor="includeImages" className="text-sm font-medium text-stone-300 cursor-pointer">
                            Include Photos in Report
                        </label>
                    </div>

                    {/* Summary */}
                    <div className="text-xs text-stone-500 text-center">
                        This will generate a PDF document using the official letterhead format.
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-stone-900/50 flex justify-end">
                    <button
                        onClick={handleExport}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <FileDown className="w-4 h-4" />
                                Download PDF
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};
