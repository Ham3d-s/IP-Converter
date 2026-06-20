'use client';

import React from 'react';
import { useIP } from '@/context/IPContext';
import { History, Star, Trash2 } from 'lucide-react';
import { SoundFX } from '@/lib/audio';

export default function HistorySidebar() {
  const {
    isMounted,
    history,
    favorites,
    sidebarTab,
    setSidebarTab,
    handleIPInput,
    deleteSidebarItem,
    clearSidebarData,
  } = useIP();

  const handleTabSwap = (tab: 'history' | 'favorites') => {
    SoundFX.click();
    setSidebarTab(tab);
  };

  const activeList = sidebarTab === 'history' ? history : favorites;
  const emptyMessage = sidebarTab === 'history' ? 'تاریخچه‌ای یافت نشد.' : 'لیست نشانک‌ها خالی است.';

  if (!isMounted) {
    return (
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 animate-pulse select-none" dir="rtl">
        <div className="h-4 bg-slate-900 rounded w-1/3"></div>
        <div className="space-y-2">
          <div className="h-10 bg-slate-900 rounded"></div>
          <div className="h-10 bg-slate-900 rounded"></div>
          <div className="h-10 bg-slate-900 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4" dir="rtl">
      {/* Tabs headers */}
      <div className="flex border-b border-slate-950 pb-2 select-none" id="sidebar-tab-headers">
        <button
          onClick={() => handleTabSwap('history')}
          className={`flex-grow text-center pb-2 text-xs font-black border-b-2 transition-all duration-200 ${
            sidebarTab === 'history'
              ? 'border-indigo-500 text-indigo-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
          id="tab-history-btn"
        >
          <span className="flex items-center justify-center gap-1">
            <History className="w-3.5 h-3.5" />
            <span>تاریخچه محاسبات</span>
          </span>
        </button>

        <button
          onClick={() => handleTabSwap('favorites')}
          className={`flex-grow text-center pb-2 text-xs font-black border-b-2 transition-all duration-200 ${
            sidebarTab === 'favorites'
              ? 'border-indigo-500 text-indigo-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
          id="tab-favorites-btn"
        >
          <span className="flex items-center justify-center gap-1">
            <Star className="w-3.5 h-3.5" />
            <span>نشانک‌ها (مهم)</span>
          </span>
        </button>
      </div>

      {/* Structured dynamic list results */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar text-xs" id="sidebar-list-content">
        {activeList.length === 0 ? (
          <p className="text-center text-slate-500 py-6 text-xs font-medium select-none">{emptyMessage}</p>
        ) : (
          activeList.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 rounded-xl bg-slate-950/20 border border-slate-900 hover:border-indigo-500/30 transition-all duration-200 group"
              id={`sidebar-item-${index}`}
            >
              {/* Load item click state */}
              <button
                onClick={() => { SoundFX.click(); handleIPInput(item); }}
                className="flex-grow text-right font-mono font-bold text-slate-400 hover:text-slate-100 transition-colors"
                id={`sidebar-load-btn-${index}`}
              >
                {item}
              </button>

              {/* Trash delete item buttons */}
              <button
                onClick={() => deleteSidebarItem(item)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-rose-500/10 text-rose-400 transition-all duration-200"
                title="حذف"
                id={`sidebar-delete-btn-${index}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Bottom management row */}
      {activeList.length > 0 && (
        <div className="flex justify-end pt-1 border-t border-slate-950 select-none">
          <button
            onClick={clearSidebarData}
            className="text-[10px] text-slate-500 hover:text-rose-400 font-bold transition-colors"
            id="clear-sidebar-records"
          >
            پاکسازی کامل لیست
          </button>
        </div>
      )}
    </div>
  );
}
