import React, { useState, useEffect, useMemo } from 'react';
import { TimelineEntry, ViewState, CategoryType } from './types';
import { CATEGORIES } from './constants';
import { dataService } from './services/dataService';
import { TimelineCard } from './components/TimelineCard';
import { AdminLogin } from './components/AdminLogin';
import { EntryForm } from './components/EntryForm';
import { ActivityDetail } from './components/ActivityDetail';
import { BackgroundParticles } from './components/BackgroundParticles';
import { Search, Filter, Plus, LogOut, ChevronRight, Loader2, GraduationCap, X, ChevronDown, Activity, Calendar, Award, FileDown } from 'lucide-react';
import { ExportModal } from './components/ExportModal';

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

    // Scroll Logic for Parallax
    const [scrollY, setScrollY] = useState(0);
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Hacker Scramble Effect (Infinite Loop)
    const [heroText, setHeroText] = useState('INFORMATION');
    const [isGlitching, setIsGlitching] = useState(false);

    useEffect(() => {
        const words = ["INFORMATION", "INNOVATION"];
        let currentIndex = 0;
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let interval: any = null;

        const scrambleTo = (targetWord: string) => {
            let iteration = 0;
            setIsGlitching(true);

            if (interval) clearInterval(interval);

            interval = setInterval(() => {
                setHeroText(prev =>
                    prev
                        .split("")
                        .map((letter, index) => {
                            if (index < iteration) {
                                return targetWord[index] || "";
                            }
                            return letters[Math.floor(Math.random() * 26)];
                        })
                        .join("")
                );

                if (iteration >= targetWord.length) {
                    clearInterval(interval);
                    setIsGlitching(false);
                    setHeroText(targetWord);
                }

                iteration += 1 / 3;
            }, 30);
        };

        // Initial delay then loop
        const loopTimeout = setTimeout(() => {
            scrambleTo(words[1]); // First switch to INNOVATION
            currentIndex = 1;
        }, 2000);

        const loopInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % words.length;
            scrambleTo(words[currentIndex]);
        }, 10000); // Toggle every 10 seconds

        return () => {
            clearTimeout(loopTimeout);
            clearInterval(loopInterval);
            if (interval) clearInterval(interval);
        };
    }, []);

    // Admin State
    const [isAdmin, setIsAdmin] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
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

            // Check for deep link
            const urlParams = new URLSearchParams(window.location.search);
            const sharedId = urlParams.get('id');
            if (sharedId) {
                const entryToView = data.find(e => e.id === sharedId);
                if (entryToView) {
                    setViewingEntry(entryToView);
                    // Clear the query param without refresh so it doesn't persist if they close
                    window.history.replaceState({}, '', window.location.pathname);
                }
            }
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
        <div className="min-h-screen flex flex-col font-sans text-stone-200 bg-black relative selection:bg-blue-600 selection:text-white">

            {/* Subtle Gradient Spotlights & Particles */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] opacity-40"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[100px] opacity-30"></div>
                <BackgroundParticles />
            </div>

            {/* Minimal Mobile-Style Header */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 pt-4 pb-4 px-4 sm:px-6 transition-all">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-white uppercase italic">
                                # DEPT<span className="text-blue-600">TIMELINE</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isAdmin && (
                            <>
                                <button
                                    onClick={() => setIsExportOpen(true)}
                                    className="flex items-center gap-2 text-[10px] font-bold text-stone-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <FileDown className="w-3 h-3" /> EXPORT
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full hover:bg-red-500/20 transition-colors"
                                >
                                    <LogOut className="w-3 h-3" /> LOGOUT
                                </button>
                        )}
                                <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-stone-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    LIVE UPDATES
                                </div>
                            </div>
                    </div>
            </header>

            {/* CINEMATIC HERO SECTION */}
            <section className="relative min-h-[85vh] flex flex-col px-4 overflow-hidden border-b border-white/5">

                {/* Hero Background Effects (Parallax Linked) */}
                <div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black z-0 will-change-transform"
                    style={{ transform: `translateY(${scrollY * 0.5}px)` }}
                ></div>
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] will-change-transform"
                    style={{ transform: `translate(-50%, -50%) translateY(${scrollY * 0.2}px)` }}
                ></div>

                {/* Content Wrapper */}
                <div className="flex-grow flex flex-col justify-center items-center relative z-10 space-y-8 max-w-4xl mx-auto">

                    {/* Logo Container - Styled to handle white background */}
                    <div className="relative w-28 h-28 bg-white rounded-full p-2 shadow-[0_0_40px_-5px_rgba(255,255,255,0.3)] animate-fade-in-up">
                        <div className="w-full h-full rounded-full overflow-hidden border border-stone-200">
                            <img
                                src="/logo.jpg"
                                alt="Department Logo"
                                className="w-full h-full object-contain"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                        </div>
                        {/* Decorative ring */}
                        <div className="absolute inset-0 border border-white/20 rounded-full scale-110 animate-pulse"></div>
                    </div>

                    {/* Main Title */}
                    <div className="space-y-2 text-center">
                        <h2 className="text-sm md:text-base font-bold text-stone-500 tracking-[0.5em] uppercase animate-fade-in-up">
                            Department of
                        </h2>
                        <h1
                            className={`text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.9] uppercase mix-blend-screen animate-fade-in-up ${isGlitching ? 'glitch-effect' : ''}`}
                            style={{ animationDelay: '0.1s' }}
                            data-text={`${heroText} TECHNOLOGY`}
                        >
                            {heroText}<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600">Technology</span>
                        </h1>
                    </div>

                    {/* Subtitle */}
                    <p className="text-base md:text-lg text-stone-400 max-w-lg mx-auto leading-relaxed font-light text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Architecting the digital future through innovation, research, and technical excellence.
                    </p>
                </div>

                {/* Bottom Scroll Indicator - Now in flex flow */}
                <div className="pb-12 flex flex-col items-center gap-2 animate-bounce cursor-pointer opacity-50 hover:opacity-100 transition-opacity z-10"
                    onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' })}>
                    <span className="text-[10px] font-bold tracking-widest text-stone-600 uppercase">Explore Timeline</span>
                    <ChevronDown className="w-5 h-5 text-stone-500" />
                </div>
            </section>

            {/* Sub-Header Filter Bar */}
            <div className="relative z-40 bg-black border-none pt-2 pb-6">
                <div className="max-w-2xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col gap-4">

                        {/* Controls Row */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="text-xs font-bold text-stone-500 tracking-wider hidden sm:block whitespace-nowrap">
                                LATEST UPDATES
                            </div>

                            {/* Main Search Bar - Always Visible */}
                            <div className="flex-grow max-w-md relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search timeline..."
                                    className="w-full bg-stone-900 border border-stone-800 rounded-full pl-10 pr-4 py-1.5 text-sm text-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-stone-600"
                                />
                            </div>

                            <button
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${showFiltersMobile ? 'bg-white text-black border-white' : 'bg-transparent text-stone-400 border-stone-800 hover:border-stone-600'}`}
                                onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                            >
                                <span className="text-xs font-bold">FILTER</span>
                                <Filter className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Search Row */}
                        {showFiltersMobile && (
                            <div className="bg-stone-900/50 p-4 rounded-xl border border-white/5 space-y-4 animate-fade-in">
                                {/* Removed duplicate search input from here */}

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedYear('ALL')}
                                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded border ${selectedYear === 'ALL' ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-stone-500 border-stone-800'}`}
                                    >
                                        ALL YEARS
                                    </button>
                                    {availableYears.map(year => (
                                        <button
                                            key={year}
                                            onClick={() => setSelectedYear(year)}
                                            className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded border ${selectedYear === year ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-stone-500 border-stone-800'}`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {Object.values(CATEGORIES).map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'ALL' : cat.id)}
                                            className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded border ${selectedCategory === cat.id
                                                ? `bg-white text-black border-white`
                                                : 'bg-transparent text-stone-500 border-stone-800'}`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-grow relative z-0">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24">

                    {/* Timeline Content */}
                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-20 text-stone-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <span className="text-xs font-bold tracking-widest uppercase">Loading Feed...</span>
                        </div>
                    ) : filteredEntries.length === 0 ? (
                        <div className="text-center py-24 px-6 border border-dashed border-white/10 rounded-2xl mx-auto">
                            <p className="text-stone-500">No updates found.</p>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-blue-500 text-sm font-bold mt-2">Clear Filters</button>
                            )}
                        </div>
                    ) : (
                        <div className="relative pt-4">
                            {/* Continuous Vertical Line (Global) - Positioned relative to the grid layout in items */}
                            {/* Actually, we'll let each item draw its segment to make it easier, or absolute here. 
                                 Let's do absolute line for the whole container if we can, or per-item.
                                 The reference has a very distinct solid line. Let's do a global line.
                             */}
                            <div className="absolute left-[87px] sm:left-[111px] top-0 bottom-0 w-[2px] bg-stone-800"></div>

                            {groupedEntries.map(({ year, list }) => (
                                <div key={year} className="relative">
                                    {/* Year header if we want it, or just let cards flow. Reference doesn't emphasize year headers strongly, mostly flows. 
                                        But distinguishing years is good. Let's make it subtle side text or small marker.
                                    */}

                                    <div className="space-y-8">
                                        {list.map(entry => (
                                            <TimelineCard
                                                key={entry.id}
                                                entry={entry}
                                                index={0} // No alternating logic anymore
                                                isAdmin={isAdmin}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                                onView={setViewingEntry}
                                            />
                                        ))}
                                    </div>

                                    {/* Spacer between years */}
                                    <div className="h-12"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Floating Action Button for Mobile Admin */}
            {isAdmin && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-500 text-white w-14 h-14 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] flex items-center justify-center transition-transform active:scale-95"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                    {!isAdmin && (<button onClick={() => setView('LOGIN')} className="mt-2 text-[10px] bg-black border border-stone-800 px-2 py-1 rounded">ADMIN</button>)}
                </div>
            )}

            {/* Admin Login Button Fixed if not admin */}
            {!isAdmin && (
                <div className="fixed bottom-6 right-6 z-40 opacity-50 hover:opacity-100 transition-opacity">
                    <button onClick={() => setView('LOGIN')} className="p-2 bg-black/50 backdrop-blur border border-white/10 rounded-full text-stone-500 hover:text-white">
                        <Activity className="w-4 h-4" />
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

            <ExportModal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                entries={entries}
            />

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

            <footer className="bg-black text-stone-600 py-12 mt-12 border-t border-white/5 relative z-10">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <GraduationCap className="w-6 h-6 mx-auto mb-4 text-stone-700" />
                    <p className="text-xs font-bold tracking-widest uppercase text-stone-500">Department of Information Technology</p>
                    <p className="text-[10px] mt-2 text-stone-700">&copy; {new Date().getFullYear()} VJIT.</p>
                    <a
                        href="https://www.linkedin.com/in/govardhan-jyosula/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] mt-2 block hover:text-blue-500 transition-colors cursor-pointer"
                    >
                        Wanna say Hi?
                    </a>
                </div>
            </footer>
        </div>
    );
};

export default App;