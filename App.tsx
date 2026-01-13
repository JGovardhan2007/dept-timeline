import React, { useState, useEffect, useMemo } from 'react';
import { TimelineEntry, ViewState, CategoryType } from './types';
import { CATEGORIES } from './constants';
import { dataService } from './services/dataService';
import { TimelineCard } from './components/TimelineCard';
import { AdminLogin } from './components/AdminLogin';
import { EntryForm } from './components/EntryForm';
import { ActivityDetail } from './components/ActivityDetail';
import { Filter, Search, Plus, LogOut, Loader2, GraduationCap, X, ChevronRight, Activity } from 'lucide-react';

const App: React.FC = () => {
    // State
    const [view, setView] = useState<ViewState>('TIMELINE');
    const [entries, setEntries] = useState<TimelineEntry[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL');
    const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'ALL'>('ALL');
    const [showFiltersMobile, setShowFiltersMobile] = useState(false);

    // Admin State
    const [isAdmin, setIsAdmin] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimelineEntry | undefined>(undefined);

    // Detail View State
    const [viewingEntry, setViewingEntry] = useState<TimelineEntry | null>(null);

    // Load Initial Data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await dataService.getAllEntries();
            setEntries(data);
        } catch (e) {
            console.error("Failed to fetch", e);
        } finally {
            setLoading(false);
        }
    };

    // Derived State (Filtering & Sorting)
    const filteredEntries = useMemo(() => {
        return entries
            .filter(entry => {
                const matchSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    entry.description.toLowerCase().includes(searchQuery.toLowerCase());
                const matchYear = selectedYear === 'ALL' || entry.year === selectedYear;
                const matchCategory = selectedCategory === 'ALL' || entry.category === selectedCategory;

                return matchSearch && matchYear && matchCategory;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [entries, searchQuery, selectedYear, selectedCategory]);

    // Group by Year for Timeline Display
    const groupedEntries = useMemo(() => {
        const groups: Record<number, TimelineEntry[]> = {};
        filteredEntries.forEach(entry => {
            if (!groups[entry.year]) groups[entry.year] = [];
            groups[entry.year].push(entry);
        });
        // Sort years descending
        return Object.keys(groups)
            .map(Number)
            .sort((a, b) => b - a)
            .map(year => ({ year, list: groups[year] }));
    }, [filteredEntries]);

    // Unique Years for Filter Dropdown
    const availableYears = useMemo(() => {
        const years = new Set(entries.map(e => e.year));
        return Array.from(years).sort((a: number, b: number) => b - a);
    }, [entries]);

    // Handlers
    const handleAdminLogin = () => {
        setIsAdmin(true);
        setView('ADMIN');
    };

    const handleLogout = () => {
        setIsAdmin(false);
        setView('TIMELINE');
    };

    const handleCreate = () => {
        setEditingEntry(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (entry: TimelineEntry) => {
        setEditingEntry(entry);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        await dataService.deleteEntry(id);
        await fetchData();
    };

    const handleSaveEntry = async (entryData: any) => {
        if (editingEntry) {
            await dataService.updateEntry({ ...editingEntry, ...entryData });
        } else {
            await dataService.addEntry(entryData);
        }
        await fetchData();
    };

    // Clear filters helper
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedYear('ALL');
        setSelectedCategory('ALL');
    };

    const hasActiveFilters = searchQuery !== '' || selectedYear !== 'ALL' || selectedCategory !== 'ALL';

    // Helper to get index in filtered list for alternating layout
    const getEntryIndex = (id: string) => filteredEntries.findIndex(e => e.id === id);

    return (
        <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-transparent relative">

            {/* Fixed Grid Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25"></div>
                <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent"></div>
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] transition-all">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src="/logo.jpg" alt="College Logo" className="h-12 w-auto object-contain" />
                    </div>

                    <div className="flex items-center gap-4">
                        {isAdmin ? (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleCreate}
                                    className="hidden md:flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-sm transition-all hover:shadow hover:scale-105 active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    New Entry
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-medium text-slate-500 hover:text-red-600 flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setView('LOGIN')}
                                className="text-xs font-bold uppercase tracking-wide text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                                Admin Login
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Modern Hero Section */}
            <header className="relative pt-24 pb-32 px-4 overflow-hidden isolate">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 -z-20">
                    <img
                        src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"
                        className="w-full h-full object-cover opacity-20 filter blur-[2px] scale-105"
                        alt="University Background"
                    />
                </div>

                {/* Gradients */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/80 via-white/40 to-slate-50/90"></div>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-50/40 via-transparent to-purple-50/40"></div>

                {/* Floating Orbs (CSS Animation) */}
                <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
                <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    {/* Live Indicator */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 bg-white/60 backdrop-blur-sm text-indigo-700 text-xs font-bold mb-8 shadow-sm animate-fade-in hover:scale-105 transition-transform cursor-default">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Live Activity Feed
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1] drop-shadow-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        Shaping the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Future</span>, <br /> One Milestone at a Time.
                    </h1>

                    <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        Celebrating the groundbreaking research, student achievements, and vibrant events of the Department of Information Technology.
                    </p>
                </div>
            </header>

            {/* Sticky Filter Bar */}
            <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-y border-slate-200/60 shadow-sm transition-all">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">

                        {/* Search */}
                        <div className="relative flex-grow max-w-sm group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search achievements..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                            />
                        </div>

                        {/* Desktop Filters */}
                        <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                                className="appearance-none pl-4 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer hover:bg-white hover:border-slate-300 transition-all shadow-sm"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                            >
                                <option value="ALL">All Years</option>
                                {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                            </select>

                            <div className="w-px h-5 bg-slate-300 mx-2"></div>

                            {Object.values(CATEGORIES).map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'ALL' : cat.id)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm ${selectedCategory === cat.id
                                        ? `${cat.bgColor} ${cat.color} ${cat.borderColor} ring-1 ring-offset-1 ring-indigo-500 scale-105`
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50'}`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Mobile Filter Toggle */}
                        <button
                            className="md:hidden flex items-center justify-center w-full py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-600 border border-slate-200"
                            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            {showFiltersMobile ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>

                    {/* Mobile Extended Filters */}
                    {showFiltersMobile && (
                        <div className="md:hidden pt-3 pb-2 space-y-3 border-t border-slate-100 mt-3 animate-fade-in">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Year</label>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    <button
                                        onClick={() => setSelectedYear('ALL')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap shadow-sm ${selectedYear === 'ALL' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-600'}`}
                                    >
                                        All Years
                                    </button>
                                    {availableYears.map(year => (
                                        <button
                                            key={year}
                                            onClick={() => setSelectedYear(year)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap shadow-sm ${selectedYear === year ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-600'}`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Categories</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.values(CATEGORIES).map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'ALL' : cat.id)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border shadow-sm ${selectedCategory === cat.id
                                                ? `${cat.bgColor} ${cat.color} ${cat.borderColor}`
                                                : 'bg-white text-slate-500 border-slate-200'}`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-grow relative z-0">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                    {/* Timeline Content */}
                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-20 text-slate-400">
                            <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                            <span className="font-medium">Retrieving history...</span>
                        </div>
                    ) : filteredEntries.length === 0 ? (
                        <div className="text-center py-24 px-6 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 shadow-sm mx-auto max-w-lg">
                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Filter className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">No activities found</h3>
                            <p className="text-slate-500 text-sm mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold hover:bg-indigo-100 transition-colors"
                                >
                                    <X className="w-4 h-4 mr-1.5" /> Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="relative space-y-16">
                            {groupedEntries.map(({ year, list }) => (
                                <div key={year} className="relative">
                                    {/* Year Marker (Sticky) */}
                                    <div className="sticky top-32 md:top-36 z-20 mb-10 flex justify-center pointer-events-none">
                                        <div className="bg-white/90 backdrop-blur-md text-slate-800 px-8 py-2 rounded-full text-xl font-bold shadow-lg shadow-indigo-500/5 border border-slate-100 ring-1 ring-slate-200 flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-indigo-500" />
                                            {year}
                                        </div>
                                    </div>

                                    {/* Entries */}
                                    <div className="space-y-0">
                                        {list.map(entry => (
                                            <TimelineCard
                                                key={entry.id}
                                                entry={entry}
                                                index={getEntryIndex(entry.id)}
                                                isAdmin={isAdmin}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                                onView={setViewingEntry}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Floating Action Button for Mobile Admin */}
            {isAdmin && (
                <div className="md:hidden fixed bottom-6 right-6 z-50">
                    <button
                        onClick={handleCreate}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform active:scale-95"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            )}

            {/* Modals */}
            {view === 'LOGIN' && (
                <AdminLogin
                    onSuccess={handleAdminLogin}
                    onCancel={() => setView('TIMELINE')}
                />
            )}

            <EntryForm
                isOpen={isFormOpen}
                initialData={editingEntry}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSaveEntry}
            />

            {/* Detail Modal */}
            {viewingEntry && (
                <ActivityDetail
                    entry={viewingEntry}
                    onClose={() => setViewingEntry(null)}
                />
            )}

            <footer className="bg-slate-900 text-slate-400 py-12 mt-12 border-t border-slate-800 relative z-10">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <GraduationCap className="w-8 h-8 mx-auto mb-4 text-indigo-500" />
                    <p className="text-sm font-medium text-slate-300">Department of Information Technology</p>
                    <p className="text-xs mt-2 text-slate-500">&copy; {new Date().getFullYear()} Vidya Jyothi Institute Of Technology. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default App;