import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Landmark,
  MapPin,
  Tag,
  Bookmark,
  BookmarkCheck,
  Share2,
  MessageCircle,
  Smartphone,
  Copy,
  Check,
  Bell,
  BellRing,
} from 'lucide-react';
import {
  governmentUpdates,
  CATEGORIES,
  INDIAN_STATES,
  UpdateCategory,
} from '../data/governmentUpdates';

// ── Constants & Styles ──────────────────────────────────────────────
const PRIORITY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  high: { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  low: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
};

const CATEGORY_COLORS: Record<UpdateCategory, { bg: string; text: string }> = {
  Schemes: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Subsidies: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Loans: { bg: 'bg-violet-100', text: 'text-violet-700' },
  MSP: { bg: 'bg-amber-100', text: 'text-amber-700' },
  Insurance: { bg: 'bg-sky-100', text: 'text-sky-700' },
  Policies: { bg: 'bg-slate-200', text: 'text-slate-700' },
  Deadlines: { bg: 'bg-rose-100', text: 'text-rose-700' },
  Announcements: { bg: 'bg-teal-100', text: 'text-teal-700' },
};

// ── localStorage helpers ────────────────────────────────────────────
const BOOKMARKS_KEY = 'agri-govt-bookmarks';
const LAST_SEEN_KEY = 'agri-govt-last-seen';
const NOTIF_SENT_KEY = 'agri-govt-notif-sent';

function loadBookmarks(): string[] {
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]'); } catch { return []; }
}
function saveBookmarks(ids: string[]) { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids)); }
function getLastSeen(): string | null { return localStorage.getItem(LAST_SEEN_KEY); }
function setLastSeen(ts: string) { localStorage.setItem(LAST_SEEN_KEY, ts); }
function loadNotifSent(): string[] {
  try { return JSON.parse(localStorage.getItem(NOTIF_SENT_KEY) || '[]'); } catch { return []; }
}
function saveNotifSent(ids: string[]) { localStorage.setItem(NOTIF_SENT_KEY, JSON.stringify(ids)); }

// ── Exported helpers ────────────────────────────────────────────────

/** Count updates published since the last time the user visited the tab */
export function getNewUpdatesCount(): number {
  const lastSeen = getLastSeen();
  if (!lastSeen) return governmentUpdates.length;
  const lastSeenDate = new Date(lastSeen).getTime();
  return governmentUpdates.filter((u) => new Date(u.date).getTime() > lastSeenDate).length;
}

/** Call when the user opens the Govt Updates tab so the badge clears */
export function markGovtUpdatesSeen() {
  setLastSeen(new Date().toISOString());
}

/** Request browser notification permission. Returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

/** Fire browser notifications for unseen high-priority updates (once each). */
export function notifyNewHighPriorityUpdates() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const sent = loadNotifSent();
  const newHighPriority = governmentUpdates.filter(
    (u) => u.priority === 'high' && !sent.includes(u.id),
  );
  if (newHighPriority.length === 0) return;

  newHighPriority.forEach((u) => {
    const body = u.deadline
      ? `${u.summary} — Deadline: ${new Date(u.deadline).toLocaleDateString('en-IN')}`
      : u.summary;
    try {
      new Notification('🏛️ AgriConnect — Govt Update', {
        body,
        icon: '/favicon.ico',
        tag: u.id, // prevents duplicates in the OS notification tray
      });
    } catch {
      // Some environments (e.g. mobile Safari) don't support Notification constructor
    }
  });

  saveNotifSent([...sent, ...newHighPriority.map((u) => u.id)]);
}

// ── Formatting helpers ──────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
function shareText(u: { title: string; summary: string; officialUrl: string; category: string }) {
  return `🏛️ *${u.category} Update*\n\n${u.title}\n\n${u.summary}\n\n🔗 Official link: ${u.officialUrl}\n\n— Shared via AgriConnect`;
}

// ── Component ───────────────────────────────────────────────────────
export const GovernmentUpdates: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | UpdateCategory>('All');
  const [selectedState, setSelectedState] = useState('All India');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>(() => loadBookmarks());
  const [viewMode, setViewMode] = useState<'all' | 'bookmarked'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');

  // Persist bookmarks
  useEffect(() => { saveBookmarks(bookmarks); }, [bookmarks]);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const handleRequestNotif = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setNotifPermission(granted ? 'granted' : 'denied');
    if (granted) {
      notifyNewHighPriorityUpdates();
    }
  }, []);

  const toggleBookmark = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBookmarks((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
  }, []);

  const handleCopyLink = useCallback(async (e: React.MouseEvent, u: { title: string; summary: string; officialUrl: string; category: string }) => {
    e.stopPropagation();
    const text = shareText(u);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(u.title);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback: open a textarea
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(u.title);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const filteredUpdates = useMemo(() => {
    return governmentUpdates.filter((u) => {
      if (viewMode === 'bookmarked' && !bookmarks.includes(u.id)) return false;
      const matchesCategory =
        selectedCategory === 'All' ||
        (selectedCategory === 'Schemes'
          ? u.category === 'Schemes' || u.category === 'Announcements'
          : u.category === selectedCategory);
      const matchesState =
        selectedState === 'All India' || u.state === 'All India' || u.state === selectedState;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.title.toLowerCase().includes(q) ||
        u.summary.toLowerCase().includes(q) ||
        u.tags.some((t) => t.toLowerCase().includes(q)) ||
        u.source.toLowerCase().includes(q);
      return matchesCategory && matchesState && matchesSearch;
    });
  }, [searchQuery, selectedCategory, selectedState, viewMode, bookmarks]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4" id="govt-updates-container">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-800">
              Government Updates for Farmers
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest schemes, subsidies, MSP, insurance, loans &amp; policy announcements from verified government sources
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {bookmarks.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                <BookmarkCheck className="w-3.5 h-3.5" />
                {bookmarks.length}
              </span>
            )}
            {/* Notification bell */}
            {notifPermission !== 'granted' && (
              <button
                onClick={handleRequestNotif}
                className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                id="govt-enable-notif-btn"
                title="Enable browser notifications for new updates"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Notify Me</span>
              </button>
            )}
            {notifPermission === 'granted' && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                <Bell className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Notifications On</span>
              </span>
            )}
          </div>
        </div>

        {/* ── View Toggle (All / Bookmarked) ─────────────────────── */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            id="govt-view-all-btn"
          >
            All Updates
          </button>
          <button
            onClick={() => setViewMode('bookmarked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'bookmarked'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            id="govt-view-bookmarked-btn"
          >
            <Bookmark className="w-3 h-3" />
            Saved ({bookmarks.length})
          </button>
        </div>

        {/* ── Search + Filter Toggle ─────────────────────────────── */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schemes, MSP, subsidies, state..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition"
              id="govt-search-input"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              showFilters
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            id="govt-filter-toggle"
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* ── Expanded Filters ───────────────────────────────────── */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 animate-fade-in-up">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    selectedCategory === 'All' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                {CATEGORIES.filter((c) => c.value !== 'All').map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory((prev) => (prev === cat.value ? 'All' : cat.value))}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                      selectedCategory === cat.value ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">State / Region</p>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full sm:w-64 pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer appearance-none"
                  id="govt-state-filter"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Results count ────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-700">{filteredUpdates.length}</span>{' '}
          {filteredUpdates.length === 1 ? 'update' : 'updates'}
          {selectedState !== 'All India' && (
            <span> for <span className="font-semibold text-emerald-700">{selectedState}</span></span>
          )}
        </p>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-[10px] text-slate-500">High Priority</span>
        </div>
      </div>

      {/* ── Updates List ─────────────────────────────────────────── */}
      <div className="space-y-3">
        {filteredUpdates.length === 0 && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              {viewMode === 'bookmarked' ? (
                <Bookmark className="w-6 h-6 text-slate-400" />
              ) : (
                <Search className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <p className="text-sm font-bold text-slate-600">
              {viewMode === 'bookmarked' ? 'No saved updates' : 'No updates found'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {viewMode === 'bookmarked' ? 'Bookmark updates to see them here' : 'Try adjusting your search or filters'}
            </p>
          </div>
        )}

        {filteredUpdates.map((update) => {
          const isExpanded = expandedId === update.id;
          const isBookmarked = bookmarks.includes(update.id);
          const pStyle = PRIORITY_STYLES[update.priority];
          const cStyle = CATEGORY_COLORS[update.category];
          const hasDeadline = !!update.deadline;
          const deadlineDays = hasDeadline ? daysUntil(update.deadline!) : 0;
          const isNew = !getLastSeen() || new Date(update.date).getTime() > new Date(getLastSeen()!).getTime();
          const shareUrl = update.officialUrl;
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText(update))}`;
          const smsUrl = `sms:?body=${encodeURIComponent(shareText(update))}`;
          const isCopied = copiedId === update.title;

          return (
            <div
              key={update.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                update.priority === 'high' && hasDeadline && deadlineDays <= 30
                  ? 'border-rose-200'
                  : isBookmarked
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-slate-200 hover:border-slate-300'
              }`}
              id={`govt-update-${update.id}`}
            >
              {/* Card Header */}
              <div className="p-4 cursor-pointer select-none" onClick={() => toggleExpand(update.id)}>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex flex-col items-center gap-1 shrink-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${pStyle.dot} ${update.priority === 'high' ? 'animate-pulse' : ''}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      {isNew && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500 text-white">NEW</span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cStyle.bg} ${cStyle.text}`}>
                        {update.category}
                      </span>
                      {update.priority === 'high' && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pStyle.bg} ${pStyle.text} flex items-center gap-0.5`}>
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Urgent
                        </span>
                      )}
                      {hasDeadline && deadlineDays > 0 && deadlineDays <= 30 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {deadlineDays} days left
                        </span>
                      )}
                      {hasDeadline && deadlineDays <= 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          Deadline passed
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 leading-snug">{update.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{update.summary}</p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {formatDate(update.date)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin className="w-3 h-3" />
                        {update.state}
                      </span>
                      {hasDeadline && (
                        <span className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
                          <Clock className="w-3 h-3" />
                          Deadline: {formatDate(update.deadline!)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right side: bookmark + chevron */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => toggleBookmark(e, update.id)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
                        isBookmarked
                          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                      }`}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this update'}
                      id={`govt-bookmark-${update.id}`}
                    >
                      {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* ── Expanded Details ──────────────────────────────── */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3 animate-fade-in-up">
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Details</p>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{update.details}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {update.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* ── Source + Action buttons row ──────────────── */}
                    <div className="pt-2 border-t border-slate-100 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] text-slate-400">Source</p>
                          <p className="text-xs font-semibold text-slate-600">{update.source}</p>
                        </div>
                        <a
                          href={update.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer shrink-0 self-start"
                          id={`govt-link-${update.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Visit Official Website
                        </a>
                      </div>

                      {/* ── Share buttons ─────────────────────────── */}
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Share2 className="w-3 h-3" />
                          Share this update
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {/* WhatsApp */}
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1da851] text-white text-[11px] font-semibold transition cursor-pointer"
                            id={`govt-share-wa-${update.id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                          </a>
                          {/* SMS */}
                          <a
                            href={smsUrl}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-semibold transition cursor-pointer"
                            id={`govt-share-sms-${update.id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Smartphone className="w-3 h-3" />
                            SMS
                          </a>
                          {/* Copy */}
                          <button
                            onClick={(e) => handleCopyLink(e, update)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                              isCopied
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            }`}
                            id={`govt-share-copy-${update.id}`}
                          >
                            {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {isCopied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Disclaimer ───────────────────────────────────────────── */}
      <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] font-bold text-amber-700">Disclaimer</p>
          <p className="text-[11px] text-amber-600">
            All links point to verified official government websites. Always verify details on the
            official portal before applying. This information is curated for reference only and does
            not constitute legal or financial advice.
          </p>
        </div>
      </div>
    </div>
  );
};
