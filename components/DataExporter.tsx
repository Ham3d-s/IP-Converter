'use client';

import React from 'react';
import { useIP } from '@/context/IPContext';
import { calculateSubnetDetails, validateIPv4 } from '@/lib/ip-utils';
import { Download, FileCode, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { SoundFX } from '@/lib/audio';

export default function DataExporter() {
  const { ip, cidr, mode } = useIP();

  const handleExport = (format: 'json' | 'csv' | 'txt') => {
    SoundFX.click();
    if (mode === 'ipv4' && !validateIPv4(ip)) {
      alert('آدرس وارد شده برای خروجی گرفتن معتبر نیست.');
      return;
    }

    let payload: any = {};
    if (mode === 'ipv4') {
      const details = calculateSubnetDetails(ip, cidr);
      const octets = ip.split('.').map(Number);
      const binaryBits = octets.map((o) => o.toString(2).padStart(8, '0')).join('.');

      payload = {
        ipAddress: ip,
        cidrPrefix: `/${cidr}`,
        binaryRepresentation: binaryBits,
        ipClass: details.class,
        ownershipType: details.type,
        subnetMask: details.subnetMask,
        wildcardMask: details.wildcard,
        networkID: details.networkID,
        broadcastAddress: details.broadcast,
        totalAssignableHosts: details.hostsCount,
        usableHostRange: details.hostRange,
        exportTimestamp: new Date().toISOString(),
      };
    } else {
      payload = {
        ipAddress: ip,
        mode: 'ipv6',
        exportTimestamp: new Date().toISOString(),
      };
    }

    if (format === 'json') {
      const jsonString = JSON.stringify(payload, null, 4);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      triggerBlobDownload(blob, `ip-analysis-${ip.replace(/:/g, '-')}.json`);
    } else if (format === 'csv') {
      let csvContent = '\uFEFFویژگی,مقدار\n'; // UTF-8 BOM representation
      for (const [key, value] of Object.entries(payload)) {
        csvContent += `"${key}","${value}"\n`;
      }
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      triggerBlobDownload(blob, `ip-analysis-${ip.replace(/:/g, '-')}.csv`);
    } else if (format === 'txt') {
      let txtContent = `آزمایشگاه تخصصی تحلیل شبکه آی‌پی پلاس نسخه ۲.۰\n`;
      txtContent += `==============================================\n`;
      for (const [key, value] of Object.entries(payload)) {
        txtContent += `${key}: ${value}\n`;
      }
      txtContent += `==============================================\n`;
      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
      triggerBlobDownload(blob, `ip-analysis-${ip.replace(/:/g, '-')}.txt`);
    }
  };

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const triggerPrinter = () => {
    SoundFX.click();
    // Locate print action via dispatch or call native browser print wrapper onNetworkAnalysis
    const printBtn = document.getElementById('print-analysis-btn');
    if (printBtn) {
      printBtn.click();
    } else {
      window.print();
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4" dir="rtl">
      <h3 className="font-extrabold text-xs text-slate-400 flex items-center gap-2 border-b border-slate-900 pb-2 select-none">
        <Download className="w-4 h-4 text-indigo-400" />
        <span>خروجی گرفتن و صادرات نتایج محاسبات</span>
      </h3>
      
      <div className="grid grid-cols-2 gap-2 text-xs font-bold font-sans select-none">
        <button
          onClick={() => handleExport('json')}
          className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-xl transition-all flex items-center justify-center gap-1.5 text-slate-300"
          id="export-json-btn"
        >
          <FileCode className="w-4 h-4 text-amber-400" />
          <span>JSON</span>
        </button>

        <button
          onClick={() => handleExport('csv')}
          className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-xl transition-all flex items-center justify-center gap-1.5 text-slate-300"
          id="export-csv-btn"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>CSV</span>
        </button>

        <button
          onClick={() => handleExport('txt')}
          className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-xl transition-all flex items-center justify-center gap-1.5 text-slate-300"
          id="export-txt-btn"
        >
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>متنی (TXT)</span>
        </button>

        <button
          onClick={triggerPrinter}
          className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white rounded-xl transition-all flex items-center justify-center gap-1.5 text-slate-350"
          id="export-pdf-print-btn"
        >
          <Printer className="w-4 h-4 text-rose-400" />
          <span>نسخه PDF / چاپ</span>
        </button>
      </div>
    </div>
  );
}
