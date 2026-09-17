import React, { useState } from 'react';
import { SiteData, SmtLine, PcaLine, CpuAssemblyLine, SubCategory, ShiftNumber } from '../types';
import { CostCenterMultiPicker, CostCenterPreset } from './CostCenterMultiPicker';
import { IEHistoricalManpowerOverview } from './IEHistoricalManpowerOverview';
import { FiveDepartmentMonthlyMaintenance } from './FiveDepartmentMonthlyMaintenance';
import { extractSiteSnapshot, updateSiteMonthData } from '../utils/monthlyDepartmentHelper';

const SMT_HR_PRESETS: CostCenterPreset[] = [
  { code: 'CC-SMT-7101', label: 'SMT MB Line Group A' },
  { code: 'CC-SMT-7102', label: 'SMT MB Line Group B' },
  { code: 'CC-SMT-7105', label: 'SMT Small-card Cell' },
  { code: 'CC-SMT-7109', label: 'SMT Prototype & NPI' },
];

const PCA_HR_PRESETS: CostCenterPreset[] = [
  { code: 'CC-PCA-7101', label: 'PCA FA Test Cell A' },
  { code: 'CC-PCA-7105', label: 'PCA Board Functional Test' },
  { code: 'CC-PCA-7108', label: 'PCA Small-Card Packing' },
  { code: 'CC-PCA-7112', label: 'PCA ICT & Burn-in Cell' },
];

const ASSEMBLY_HR_PRESETS: CostCenterPreset[] = [
  { code: 'CC-SYS-7110', label: 'System Assembly Main Line' },
  { code: 'CC-SYS-7115', label: 'Server Integration & Test' },
  { code: 'CC-SYS-7120', label: 'Chassis Final Packaging' },
  { code: 'CC-SYS-7125', label: 'Rack & Stack Custom Config' },
];

const PQC_HR_PRESETS: CostCenterPreset[] = [
  { code: 'CC-QC-7201', label: 'PQC Line Audit Team' },
  { code: 'CC-QC-7202', label: 'SQC Sampling & Reliability' },
  { code: 'CC-QC-7205', label: 'In-Process Quality Inspection' },
];

const OQC_HR_PRESETS: CostCenterPreset[] = [
  { code: 'CC-QC-7210', label: 'OQC Outgoing Inspection' },
  { code: 'CC-QC-7215', label: 'Finished Goods QA & Audit' },
  { code: 'CC-QC-7220', label: 'Customer Quality Assurance (CQA)' },
];

const TROUBLESHOOTING_HR_PRESETS: CostCenterPreset[] = [
  { code: 'CC-TS-7301', label: 'Trouble Shooting Debug Lab' },
  { code: 'CC-TS-7302', label: 'BGA & Board Repair Cell' },
  { code: 'CC-TS-7305', label: 'Failure Analysis (FA) & RMA' },
  { code: 'CC-TS-7308', label: 'Test Diagnostic & Fixture Lab' },
];

const WAREHOUSE_HR_PRESETS: CostCenterPreset[] = [
  { code: 'CC-WH-7401', label: 'Raw Materials & Receiving Hub' },
  { code: 'CC-WH-7402', label: 'WIP Inventory & Internal Logistics' },
  { code: 'CC-WH-7405', label: 'Finished Goods & Shipping Center' },
  { code: 'CC-WH-7408', label: 'Customs & Bonded Warehouse' },
];

const OTHER_SUPPORT_HR_PRESETS: CostCenterPreset[] = [
  { code: 'CC-OTH-7501', label: 'Plant Facility & Cleanroom Ops' },
  { code: 'CC-OTH-7502', label: 'EHS & Industrial Safety Dept' },
  { code: 'CC-OTH-7505', label: 'General Administration & Affairs' },
  { code: 'CC-OTH-7508', label: 'Plant Security & Facilities' },
];

interface IEForecastViewProps {
  site: SiteData;
  onUpdateSite: (updatedSite: SiteData) => void;
  selectedMonth?: number;
  selectedYear?: number;
  onChangeMonth?: (month: number) => void;
  onChangeYear?: (year: number) => void;
}

export const IEForecastView: React.FC<IEForecastViewProps> = ({
  site,
  onUpdateSite: parentOnUpdateSite,
  selectedMonth = 9,
  selectedYear = 2026,
  onChangeMonth,
  onChangeYear,
}) => {
  // Wrapper that synchronizes any deep-dive edits into the active month's snapshot
  const onUpdateSite = (updatedSite: SiteData) => {
    const snap = extractSiteSnapshot(updatedSite);
    const withMonthly = updateSiteMonthData(updatedSite, selectedMonth, snap, selectedMonth);
    parentOnUpdateSite(withMonthly);
  };
  const [smtCategoryFilter, setSmtCategoryFilter] = useState<SubCategory>('MB');
  const [pcaCategoryFilter, setPcaCategoryFilter] = useState<SubCategory>('MB');

  const [mfgOpen, setMfgOpen] = useState(true);
  const [smtOpen, setSmtOpen] = useState(true);
  const [pcaOpen, setPcaOpen] = useState(true);
  const [assyOpen, setAssyOpen] = useState(true);
  const [qcOpen, setQcOpen] = useState(true);

  // Subtotal calculations for SMT
  const smtOnlineDL = (site.smtLines || []).reduce((acc, l) => {
    const shiftCount = typeof l.shift === 'number' ? l.shift : 1;
    return acc + (l.onlineStdDL || 0) * shiftCount;
  }, 0);
  const smtOfflineDL = site.smtOfflineDL || 0;
  const smtTotalDL = smtOnlineDL + smtOfflineDL;

  // Subtotal calculations for PCA
  const pcaOnlineDL = (site.pcaLines || []).reduce((acc, l) => {
    const faShifts = typeof l.faShift === 'number' ? l.faShift : 1;
    const testShifts = typeof l.testShift === 'number' ? l.testShift : 1;
    const packShifts = typeof l.packingShift === 'number' ? l.packingShift : 1;
    return acc + (l.faStdDL || 0) * faShifts + (l.testStdDL || 0) * testShifts + (l.packingStdDL || 0) * packShifts;
  }, 0);
  const pcaOfflineDL = site.pcaOfflineDL || 0;
  const pcaTotalDL = pcaOnlineDL + pcaOfflineDL;

  // Subtotal calculations for System Assembly
  const assyOnlineDL = (site.cpuAssemblyLines || []).reduce((acc, l) => {
    const assyShifts = typeof l.assyShift === 'number' ? l.assyShift : 1;
    const testShifts = typeof l.testShift === 'number' ? l.testShift : 1;
    const packShifts = typeof l.packShift === 'number' ? l.packShift : 1;
    return acc + (l.assyDL || 0) * assyShifts + (l.testDL || 0) * testShifts + (l.packDL || 0) * packShifts;
  }, 0);
  const assyOfflineDL = site.assemblyOfflineDL || 0;
  const assyTotalDL = assyOnlineDL + assyOfflineDL;

  // Total Manufacturing DL
  const totalMfgOnlineDL = smtOnlineDL + pcaOnlineDL + assyOnlineDL;
  const totalMfgOfflineDL = smtOfflineDL + pcaOfflineDL + assyOfflineDL;
  const totalMfgDL = smtTotalDL + pcaTotalDL + assyTotalDL;
  const totalMfgIDL = (site.smtIdl || 0) + (site.pcaIdl || 0) + (site.assemblyIdl || 0);

  // Handlers for SMT
  const handleSmtOfflineChange = (val: number) => {
    onUpdateSite({ ...site, smtOfflineDL: val });
  };

  const handleSmtIdlChange = (val: number) => {
    onUpdateSite({ ...site, smtIdl: val });
  };

  const handleSmtCostCenterChange = (val: string[]) => {
    onUpdateSite({ ...site, smtCostCenter: val });
  };

  const handleAddSmtLine = () => {
    const newLine: SmtLine = {
      id: `smt-${Date.now()}`,
      name: `Line-S${String(site.smtLines.length + 1).padStart(2, '0')}`,
      shift: 2,
      category: smtCategoryFilter,
      onlineStdDL: 12,
    };
    onUpdateSite({ ...site, smtLines: [...site.smtLines, newLine] });
  };

  const handleUpdateSmtLine = (id: string, field: keyof SmtLine, value: any) => {
    const updated = site.smtLines.map((line) =>
      line.id === id ? { ...line, [field]: value } : line
    );
    onUpdateSite({ ...site, smtLines: updated });
  };

  const handleDeleteSmtLine = (id: string) => {
    onUpdateSite({ ...site, smtLines: site.smtLines.filter((l) => l.id !== id) });
  };

  // Handlers for PCA
  const handlePcaOfflineChange = (val: number) => {
    onUpdateSite({ ...site, pcaOfflineDL: val });
  };

  const handlePcaIdlChange = (val: number) => {
    onUpdateSite({ ...site, pcaIdl: val });
  };

  const handlePcaCostCenterChange = (val: string[]) => {
    onUpdateSite({ ...site, pcaCostCenter: val });
  };

  const handleAddPcaLine = () => {
    const newLine: PcaLine = {
      id: `pca-${Date.now()}`,
      name: `PCA-P${String(site.pcaLines.length + 1).padStart(2, '0')}`,
      category: pcaCategoryFilter,
      faStdDL: 8,
      faShift: 2,
      testStdDL: 4,
      testShift: 2,
      packingStdDL: 2,
      packingShift: 1,
    };
    onUpdateSite({ ...site, pcaLines: [...site.pcaLines, newLine] });
  };

  const handleUpdatePcaLine = (id: string, field: keyof PcaLine, value: any) => {
    const updated = site.pcaLines.map((line) =>
      line.id === id ? { ...line, [field]: value } : line
    );
    onUpdateSite({ ...site, pcaLines: updated });
  };

  const handleDeletePcaLine = (id: string) => {
    onUpdateSite({ ...site, pcaLines: site.pcaLines.filter((l) => l.id !== id) });
  };

  // Handlers for CPU Assembly
  const handleAssemblyOfflineChange = (val: number) => {
    onUpdateSite({ ...site, assemblyOfflineDL: val });
  };

  const handleAssemblyIdlChange = (val: number) => {
    onUpdateSite({ ...site, assemblyIdl: val });
  };

  const handleAssemblyCostCenterChange = (val: string[]) => {
    onUpdateSite({ ...site, assemblyCostCenter: val });
  };

  const handleAddAssemblyLine = () => {
    const newLine: CpuAssemblyLine = {
      id: `cpu-${Date.now()}`,
      name: `CPU-L${String(site.cpuAssemblyLines.length + 1).padStart(2, '0')}`,
      assyDL: 24,
      assyShift: 2,
      testDL: 8,
      testShift: 2,
      packDL: 4,
      packShift: 1,
    };
    onUpdateSite({
      ...site,
      cpuAssemblyLines: [...site.cpuAssemblyLines, newLine],
    });
  };

  const handleUpdateAssemblyLine = (id: string, field: keyof CpuAssemblyLine, value: any) => {
    const updated = site.cpuAssemblyLines.map((line) =>
      line.id === id ? { ...line, [field]: value } : line
    );
    onUpdateSite({ ...site, cpuAssemblyLines: updated });
  };

  const handleDeleteAssemblyLine = (id: string) => {
    onUpdateSite({
      ...site,
      cpuAssemblyLines: site.cpuAssemblyLines.filter((l) => l.id !== id),
    });
  };

  // Filtered lists
  const filteredSmtLines = (site.smtLines || []).filter((l) => l.category === smtCategoryFilter);
  const filteredPcaLines = (site.pcaLines || []).filter((l) => l.category === pcaCategoryFilter);

  return (
    <div className="space-y-6 pb-8">
      {/* Consolidated Overall Banner */}
      {site.id === 'overall' && (
        <div className="bg-[#1C1D22] border border-[#ffb86b]/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ffb86b]/20 border border-[#ffb86b]/40 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#ffb86b] text-2xl">public</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Inter'] font-bold text-[#ffb86b] text-sm">
                  Overall Consolidated View
                </span>
                <span className="px-2 py-0.5 rounded bg-[#ffb86b]/20 text-[#ffb86b] font-['JetBrains_Mono'] text-[10px] font-bold border border-[#ffb86b]/40">
                  ALL 9 PLANTS
                </span>
              </div>
              <p className="text-[#d7c3b2]/80 mt-0.5 text-xs font-['Inter']">
                Displaying aggregated Industrial Engineering manpower standards, production lines, and DL/IDL totals across all manufacturing sites.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-[11px] font-['JetBrains_Mono'] text-[#4edea3] flex items-center gap-1 bg-[#4edea3]/10 border border-[#4edea3]/30 px-2.5 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
              LIVE CONSOLIDATION
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 0. IE Historical Manpower Bar Chart (DL/IDL) & 5 Departments Matrix (MANUFACTURING etc.) */}
      {/* ========================================================================= */}
      <IEHistoricalManpowerOverview site={site} />

      {/* ========================================================================= */}
      {/* 1. MASTER SEGMENT: MANUFACTURING & 5-Department Monthly Data Maintenance  */}
      {/* ========================================================================= */}
      <div
        id="segment-manufacturing"
        className="space-y-6"
      >
        {/* Monthly 5 Departments DL & IDL Baseline Maintenance Center */}
        <FiveDepartmentMonthlyMaintenance
          site={site}
          onUpdateSite={parentOnUpdateSite}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onChangeMonth={onChangeMonth}
        />

        {/* Manufacturing Segment Deep Dive Container */}
        <div className="bg-[#1C1D22] border-2 border-[#ffb86b]/40 rounded-xl overflow-hidden shadow-lg">
        {/* Manufacturing Segment Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#2a231d] via-[#1f1e24] to-[#1C1D22] border-b border-[#524437]/60">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#ffb86b]/20 border border-[#ffb86b]/50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#ffb86b] text-2xl">
                  precision_manufacturing
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#ffb86b] text-[#331c00] font-black text-[10px] rounded uppercase font-['JetBrains_Mono'] tracking-wider">
                    Core Segment
                  </span>
                  <h3 className="font-['Inter'] text-xl font-bold text-[#e5e1e6]">
                    MANUFACTURING
                  </h3>
                </div>
              </div>
            </div>

            {/* Manufacturing Overview Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="px-3 py-1.5 bg-[#131316] rounded-lg border border-[#524437]/50 flex items-center gap-2">
                <span className="text-[11px] font-['JetBrains_Mono'] text-[#d7c3b2]/70">MFG Online DL:</span>
                <span className="text-xs font-['JetBrains_Mono'] font-bold text-[#e5e1e6]">
                  {totalMfgOnlineDL} DL
                </span>
              </div>
              <div className="px-3 py-1.5 bg-[#131316] rounded-lg border border-[#524437]/50 flex items-center gap-2">
                <span className="text-[11px] font-['JetBrains_Mono'] text-[#d7c3b2]/70">MFG Offline DL:</span>
                <span className="text-xs font-['JetBrains_Mono'] font-bold text-[#ffb86b]">
                  {totalMfgOfflineDL} DL
                </span>
              </div>
              <div className="px-3.5 py-1.5 bg-[#ffb86b]/15 rounded-lg border border-[#ffb86b]/40 flex items-center gap-2">
                <span className="text-[11px] font-['JetBrains_Mono'] text-[#ffb86b] font-medium">TOTAL MFG DL:</span>
                <span className="text-sm font-['JetBrains_Mono'] font-extrabold text-[#ffb86b]">
                  {totalMfgDL} DL
                </span>
              </div>
              <div className="px-3 py-1.5 bg-[#131316] rounded-lg border border-[#5de6ff]/30 flex items-center gap-2">
                <span className="text-[11px] font-['JetBrains_Mono'] text-[#5de6ff]">MFG IDL:</span>
                <span className="text-xs font-['JetBrains_Mono'] font-bold text-[#5de6ff]">
                  {totalMfgIDL} IDL
                </span>
              </div>

              <button
                id="btn-toggle-mfg-segment"
                onClick={() => setMfgOpen(!mfgOpen)}
                className="p-1.5 rounded-lg bg-[#131316] hover:bg-[#2a292d] text-[#d7c3b2] transition-colors border border-[#524437]/40"
                title="Toggle Manufacturing Segment"
              >
                <span
                  className={`material-symbols-outlined text-lg transition-transform duration-200 block ${
                    mfgOpen ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>
            </div>
          </div>
        </div>

        {mfgOpen && (
          <div className="p-4 sm:p-6 space-y-8">
            {/* ------------------------------------------------------------- */}
            {/* SUB-SECTION 1: SMT (Surface Mount Technology)                 */}
            {/* ------------------------------------------------------------- */}
            <div
              id="subsegment-smt"
              className="bg-[#17181c] border border-[#524437]/50 rounded-lg p-4 sm:p-5"
            >
              {/* SMT Section Title Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#524437]/30">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#ffb86b]/15 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#ffb86b] text-sm">memory</span>
                    </div>
                    <h4 className="font-['Inter'] text-base font-bold text-[#e5e1e6]">
                      SMT
                    </h4>
                  </div>
                  <span className="text-[11px] font-medium text-[#d7c3b2]/80 font-['JetBrains_Mono'] tracking-wide pl-8">
                    Online: {smtOnlineDL} + Offline: {smtOfflineDL} = Total {smtTotalDL} DL
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {/* Cost Center multi-select picker */}
                  <CostCenterMultiPicker
                    id="input-smt-cost-center"
                    departmentName="SMT"
                    value={site.smtCostCenter}
                    onChange={handleSmtCostCenterChange}
                    hrPresets={SMT_HR_PRESETS}
                    placeholder="e.g. CC-SMT-7102"
                  />

                  {/* Parallel Offline DL */}
                  <div className="flex items-center h-[34px] box-border gap-1.5 bg-[#131316] px-2.5 rounded-md border border-[#524437]/40 hover:border-[#ffb86b]/60 transition-colors shrink-0">
                    <label className="font-['JetBrains_Mono'] text-[10px] text-[#ffb86b] font-semibold uppercase whitespace-nowrap flex items-center gap-1 leading-none">
                      <span className="material-symbols-outlined text-[13px] text-[#ffb86b] leading-none">engineering</span>
                      Offline DL:
                    </label>
                    <input
                      id="input-smt-offline-dl"
                      type="number"
                      min="0"
                      value={site.smtOfflineDL ?? 0}
                      onChange={(e) => handleSmtOfflineChange(Math.max(0, Number(e.target.value)))}
                      className="w-14 h-6 px-1.5 bg-[#201f23] border border-[#ffb86b]/40 rounded text-center text-xs font-bold text-[#ffb86b] font-['JetBrains_Mono'] focus:outline-none focus:border-[#ffb86b] leading-none"
                      title="SMT Department Independent Offline DL pool"
                    />
                  </div>

                  {/* Parallel SMT IDL */}
                  <div className="flex items-center h-[34px] box-border gap-1.5 bg-[#131316] px-2.5 rounded-md border border-[#524437]/40 hover:border-[#5de6ff]/60 transition-colors shrink-0">
                    <label className="font-['JetBrains_Mono'] text-[10px] text-[#5de6ff] font-semibold uppercase whitespace-nowrap flex items-center gap-1 leading-none">
                      <span className="material-symbols-outlined text-[13px] text-[#5de6ff] leading-none">support_agent</span>
                      SMT IDL:
                    </label>
                    <input
                      id="input-smt-idl"
                      type="number"
                      min="0"
                      value={site.smtIdl ?? 0}
                      onChange={(e) => handleSmtIdlChange(Math.max(0, Number(e.target.value)))}
                      className="w-14 h-6 px-1.5 bg-[#201f23] border border-[#5de6ff]/40 rounded text-center text-xs font-bold text-[#5de6ff] font-['JetBrains_Mono'] focus:outline-none focus:border-[#5de6ff] leading-none"
                      title="SMT Segment Indirect Labor"
                    />
                  </div>
                </div>
              </div>

              {/* SMT Line Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1 bg-[#131316] p-1 rounded-md border border-[#524437]/30">
                    <button
                      id="btn-smt-cat-mb"
                      onClick={() => setSmtCategoryFilter('MB')}
                      className={`px-3 py-1 text-xs font-['JetBrains_Mono'] rounded font-medium transition-all ${
                        smtCategoryFilter === 'MB'
                          ? 'bg-[#ffb86b] text-[#492900] font-bold shadow'
                          : 'text-[#d7c3b2]/70 hover:text-[#e5e1e6]'
                      }`}
                    >
                      MB (Motherboard)
                    </button>
                    <button
                      id="btn-smt-cat-sc"
                      onClick={() => setSmtCategoryFilter('SC')}
                      className={`px-3 py-1 text-xs font-['JetBrains_Mono'] rounded font-medium transition-all ${
                        smtCategoryFilter === 'SC'
                          ? 'bg-[#ffb86b] text-[#492900] font-bold shadow'
                          : 'text-[#d7c3b2]/70 hover:text-[#e5e1e6]'
                      }`}
                    >
                      SC (Small-card)
                    </button>
                  </div>

                  <button
                    id="btn-add-smt-line"
                    onClick={handleAddSmtLine}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#ffb86b]/20 hover:bg-[#ffb86b]/30 text-[#ffb86b] border border-[#ffb86b]/50 rounded-md transition-colors text-xs font-['JetBrains_Mono'] font-bold"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    <span>ADD SMT LINE</span>
                  </button>
                </div>

                <div className="text-xs font-['JetBrains_Mono'] text-[#d7c3b2]/70">
                  Showing {filteredSmtLines.length} SMT Lines in {smtCategoryFilter} category
                </div>
              </div>

              {/* SMT Table */}
              <div className="overflow-x-auto rounded-lg border border-[#524437]/40 bg-[#131316]">
                <table className="w-full text-left font-['Inter'] text-xs">
                  <thead className="bg-[#201f23] text-[#d7c3b2]/90 font-['JetBrains_Mono'] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3 border-b border-[#524437]/40">LINE NAME</th>
                      <th className="p-3 border-b border-[#524437]/40 text-center w-36">
                        SHIFTS
                      </th>
                      <th className="p-3 border-b border-[#524437]/40 text-right w-44">
                        ONLINE STD DL / SHIFT
                      </th>
                      <th className="p-3 border-b border-[#524437]/40 text-right w-40 text-[#ffb86b]">
                        TOTAL LINE ONLINE DL
                      </th>
                      <th className="p-3 border-b border-[#524437]/40 text-center w-16">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSmtLines.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-[#d7c3b2]/50 italic">
                          No SMT lines configured for {smtCategoryFilter} category. Click "ADD SMT LINE" to create.
                        </td>
                      </tr>
                    ) : (
                      filteredSmtLines.map((line) => {
                        const shiftCount = typeof line.shift === 'number' ? line.shift : 1;
                        const lineTotal = (line.onlineStdDL || 0) * shiftCount;

                        return (
                          <tr
                            key={line.id}
                            className="hover:bg-[#1c1b1f] border-b border-[#524437]/20 transition-colors"
                          >
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={line.name}
                                onChange={(e) => handleUpdateSmtLine(line.id, 'name', e.target.value)}
                                className="data-table-input data-table-input-left text-[#e5e1e6] font-semibold font-['JetBrains_Mono']"
                              />
                            </td>
                            <td className="p-2.5 text-center">
                              <select
                                value={shiftCount}
                                onChange={(e) =>
                                  handleUpdateSmtLine(line.id, 'shift', Number(e.target.value) as ShiftNumber)
                                }
                                className="px-3 py-1.5 bg-[#201f23] border border-[#524437] rounded text-xs font-bold text-[#ffb86b] font-['JetBrains_Mono'] focus:outline-none focus:border-[#ffb86b] text-center"
                              >
                                <option value={0}>0 Shifts (Offline)</option>
                                <option value={1}>1 Shift</option>
                                <option value={2}>2 Shifts</option>
                                <option value={3}>3 Shifts</option>
                                <option value={4}>4 Shifts</option>
                              </select>
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                min="0"
                                value={line.onlineStdDL}
                                onChange={(e) =>
                                  handleUpdateSmtLine(line.id, 'onlineStdDL', Math.max(0, Number(e.target.value)))
                                }
                                className="data-table-input text-right font-['JetBrains_Mono'] text-[#e5e1e6]"
                              />
                            </td>
                            <td className="p-2.5 text-right font-['JetBrains_Mono'] font-bold text-[#ffb86b] text-sm">
                              {lineTotal} DL
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => handleDeleteSmtLine(line.id)}
                                className="text-[#d7c3b2]/50 hover:text-[#F43F5E] p-1.5 transition-colors rounded hover:bg-[#2a1b22]"
                                title="Delete line"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SUB-SECTION 2: PCA (Printed Circuit Assembly / Board Test)   */}
            {/* ------------------------------------------------------------- */}
            <div
              id="subsegment-pca"
              className="bg-[#17181c] border border-[#524437]/50 rounded-lg p-4 sm:p-5"
            >
              {/* PCA Section Title Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#524437]/30">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#ffb86b]/15 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#ffb86b] text-sm">developer_board</span>
                    </div>
                    <h4 className="font-['Inter'] text-base font-bold text-[#e5e1e6]">
                      PCA
                    </h4>
                  </div>
                  <span className="text-[11px] font-medium text-[#d7c3b2]/80 font-['JetBrains_Mono'] tracking-wide pl-8">
                    Online: {pcaOnlineDL} + Offline: {pcaOfflineDL} = Total {pcaTotalDL} DL
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {/* Cost Center multi-select picker */}
                  <CostCenterMultiPicker
                    id="input-pca-cost-center"
                    departmentName="PCA"
                    value={site.pcaCostCenter}
                    onChange={handlePcaCostCenterChange}
                    hrPresets={PCA_HR_PRESETS}
                    placeholder="e.g. CC-PCA-7105"
                  />

                  {/* Parallel Offline DL */}
                  <div className="flex items-center h-[34px] box-border gap-1.5 bg-[#131316] px-2.5 rounded-md border border-[#524437]/40 hover:border-[#ffb86b]/60 transition-colors shrink-0">
                    <label className="font-['JetBrains_Mono'] text-[10px] text-[#ffb86b] font-semibold uppercase whitespace-nowrap flex items-center gap-1 leading-none">
                      <span className="material-symbols-outlined text-[13px] text-[#ffb86b] leading-none">engineering</span>
                      Offline DL:
                    </label>
                    <input
                      id="input-pca-offline-dl"
                      type="number"
                      min="0"
                      value={site.pcaOfflineDL ?? 0}
                      onChange={(e) => handlePcaOfflineChange(Math.max(0, Number(e.target.value)))}
                      className="w-14 h-6 px-1.5 bg-[#201f23] border border-[#ffb86b]/40 rounded text-center text-xs font-bold text-[#ffb86b] font-['JetBrains_Mono'] focus:outline-none focus:border-[#ffb86b] leading-none"
                      title="PCA Department Independent Offline DL pool"
                    />
                  </div>

                  {/* Parallel PCA IDL */}
                  <div className="flex items-center h-[34px] box-border gap-1.5 bg-[#131316] px-2.5 rounded-md border border-[#524437]/40 hover:border-[#5de6ff]/60 transition-colors shrink-0">
                    <label className="font-['JetBrains_Mono'] text-[10px] text-[#5de6ff] font-semibold uppercase whitespace-nowrap flex items-center gap-1 leading-none">
                      <span className="material-symbols-outlined text-[13px] text-[#5de6ff] leading-none">support_agent</span>
                      PCA IDL:
                    </label>
                    <input
                      id="input-pca-idl"
                      type="number"
                      min="0"
                      value={site.pcaIdl ?? 0}
                      onChange={(e) => handlePcaIdlChange(Math.max(0, Number(e.target.value)))}
                      className="w-14 h-6 px-1.5 bg-[#201f23] border border-[#5de6ff]/40 rounded text-center text-xs font-bold text-[#5de6ff] font-['JetBrains_Mono'] focus:outline-none focus:border-[#5de6ff] leading-none"
                      title="PCA Segment Indirect Labor"
                    />
                  </div>
                </div>
              </div>

              {/* PCA Line Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1 bg-[#131316] p-1 rounded-md border border-[#524437]/30">
                    <button
                      id="btn-pca-cat-mb"
                      onClick={() => setPcaCategoryFilter('MB')}
                      className={`px-3 py-1 text-xs font-['JetBrains_Mono'] rounded font-medium transition-all ${
                        pcaCategoryFilter === 'MB'
                          ? 'bg-[#ffb86b] text-[#492900] font-bold shadow'
                          : 'text-[#d7c3b2]/70 hover:text-[#e5e1e6]'
                      }`}
                    >
                      MB (Motherboard)
                    </button>
                    <button
                      id="btn-pca-cat-sc"
                      onClick={() => setPcaCategoryFilter('SC')}
                      className={`px-3 py-1 text-xs font-['JetBrains_Mono'] rounded font-medium transition-all ${
                        pcaCategoryFilter === 'SC'
                          ? 'bg-[#ffb86b] text-[#492900] font-bold shadow'
                          : 'text-[#d7c3b2]/70 hover:text-[#e5e1e6]'
                      }`}
                    >
                      SC (Small-card)
                    </button>
                  </div>

                  <button
                    id="btn-add-pca-line"
                    onClick={handleAddPcaLine}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#ffb86b]/20 hover:bg-[#ffb86b]/30 text-[#ffb86b] border border-[#ffb86b]/50 rounded-md transition-colors text-xs font-['JetBrains_Mono'] font-bold"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    <span>ADD PCA LINE</span>
                  </button>
                </div>

                <div className="text-xs font-['JetBrains_Mono'] text-[#d7c3b2]/70">
                  Each station (FA, Test, Packing) has independent Shift configuration
                </div>
              </div>

              {/* PCA Table with Station Shifts */}
              <div className="overflow-x-auto rounded-lg border border-[#524437]/40 bg-[#131316]">
                <table className="w-full text-left font-['Inter'] text-xs">
                  <thead className="bg-[#201f23] text-[#d7c3b2]/90 font-['JetBrains_Mono'] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3 border-b border-[#524437]/40 min-w-[140px]">LINE NAME</th>
                      <th className="p-3 border-b border-[#524437]/40 text-center min-w-[170px]">
                        FA (DL × SHIFT)
                      </th>
                      <th className="p-3 border-b border-[#524437]/40 text-center min-w-[170px]">
                        TEST (DL × SHIFT)
                      </th>
                      <th className="p-3 border-b border-[#524437]/40 text-center min-w-[170px]">
                        PACKING (DL × SHIFT)
                      </th>
                      <th className="p-3 border-b border-[#524437]/40 text-right w-36 text-[#ffb86b]">
                        TOTAL LINE DL
                      </th>
                      <th className="p-3 border-b border-[#524437]/40 text-center w-14">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPcaLines.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-[#d7c3b2]/50 italic">
                          No PCA lines configured for {pcaCategoryFilter} category. Click "ADD PCA LINE" to create.
                        </td>
                      </tr>
                    ) : (
                      filteredPcaLines.map((line) => {
                        const faShifts = typeof line.faShift === 'number' ? line.faShift : 1;
                        const testShifts = typeof line.testShift === 'number' ? line.testShift : 1;
                        const packShifts = typeof line.packingShift === 'number' ? line.packingShift : 1;
                        const lineTotal =
                          (line.faStdDL || 0) * faShifts +
                          (line.testStdDL || 0) * testShifts +
                          (line.packingStdDL || 0) * packShifts;

                        return (
                          <tr
                            key={line.id}
                            className="hover:bg-[#1c1b1f] border-b border-[#524437]/20 transition-colors"
                          >
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={line.name}
                                onChange={(e) => handleUpdatePcaLine(line.id, 'name', e.target.value)}
                                className="data-table-input data-table-input-left text-[#e5e1e6] font-semibold font-['JetBrains_Mono']"
                              />
                            </td>

                            {/* FA Station: DL & Shift */}
                            <td className="p-2.5">
                              <div className="flex items-center justify-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  value={line.faStdDL}
                                  onChange={(e) =>
                                    handleUpdatePcaLine(line.id, 'faStdDL', Math.max(0, Number(e.target.value)))
                                  }
                                  className="w-14 px-2 py-1 bg-[#201f23] border border-[#524437] rounded text-right text-xs font-['JetBrains_Mono'] text-[#e5e1e6] focus:outline-none focus:border-[#ffb86b]"
                                  title="FA Standard DL per shift"
                                />
                                <span className="text-[#d7c3b2]/60 text-[11px] font-['JetBrains_Mono']">×</span>
                                <select
                                  value={faShifts}
                                  onChange={(e) =>
                                    handleUpdatePcaLine(line.id, 'faShift', Number(e.target.value) as ShiftNumber)
                                  }
                                  className="px-2 py-1 bg-[#201f23] border border-[#524437] rounded text-xs font-bold text-[#ffb86b] font-['JetBrains_Mono'] focus:outline-none focus:border-[#ffb86b]"
                                  title="FA Shift count (0 to 4)"
                                >
                                  <option value={0}>0S</option>
                                  <option value={1}>1S</option>
                                  <option value={2}>2S</option>
                                  <option value={3}>3S</option>
                                  <option value={4}>4S</option>
                                </select>
                              </div>
                            </td>

                            {/* TEST Station: DL & Shift */}
                            <td className="p-2.5">
                              <div className="flex items-center justify-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  value={line.testStdDL}
                                  onChange={(e) =>
                                    handleUpdatePcaLine(line.id, 'testStdDL', Math.max(0, Number(e.target.value)))
                                  }
                                  className="w-14 px-2 py-1 bg-[#201f23] border border-[#524437] rounded text-right text-xs font-['JetBrains_Mono'] text-[#e5e1e6] focus:outline-none focus:border-[#ffb86b]"
                                  title="Test Standard DL per shift"
                                />
                                <span className="text-[#d7c3b2]/60 text-[11px] font-['JetBrains_Mono']">×</span>
                                <select
                                  value={testShifts}
                                  onChange={(e) =>
                                    handleUpdatePcaLine(line.id, 'testShift', Number(e.target.value) as ShiftNumber)
                                  }
                                  className="px-2 py-1 bg-[#201f23] border border-[#524437] rounded text-xs font-bold text-[#ffb86b] font-['JetBrains_Mono'] focus:outline-none focus:border-[#ffb86b]"
                                  title="Test Shift count (0 to 4)"
                                >
                                  <option value={0}>0S</option>
                                  <option value={1}>1S</option>
                                  <option value={2}>2S</option>
                                  <option value={3}>3S</option>
                                  <option value={4}>4S</option>
                                </select>
                              </div>
                            </td>

                            {/* PACKING Station: DL & Shift */}
                            <td className="p-2.5">
                              <div className="flex items-center justify-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  value={line.packingStdDL}
                                  onChange={(e) =>
                                    handleUpdatePcaLine(line.id, 'packingStdDL', Math.max(0, Number(e.target.value)))
                                  }
                                  className="w-14 px-2 py-1 bg-[#201f23] border border-[#524437] rounded text-right text-xs font-['JetBrains_Mono'] text-[#e5e1e6] focus:outline-none focus:border-[#ffb86b]"
                                  title="Packing Standard DL per shift"
                                />
                                <span className="text-[#d7c3b2]/60 text-[11px] font-['JetBrains_Mono']">×</span>
                                <select
                                  value={packShifts}
                                  onChange={(e) =>
                                    handleUpdatePcaLine(line.id, 'packingShift', Number(e.target.value) as ShiftNumber)
                                  }
                                  className="px-2 py-1 bg-[#201f23] border border-[#524437] rounded text-xs font-bold text-[#ffb86b] font-['JetBrains_Mono'] focus:outline-none focus:border-[#ffb86b]"
                                  title="Packing Shift count (0 to 4)"
                                >
                                  <option value={0}>0S</option>
                                  <option value={1}>1S</option>
                                  <option value={2}>2S</option>
                                  <option value={3}>3S</option>
                                  <option value={4}>4S</option>
                                </select>
                              </div>
                            </td>

                            <td className="p-2.5 text-right font-['JetBrains_Mono'] font-bold text-[#ffb86b] text-sm">
                              {lineTotal} DL
                            </td>

                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => handleDeletePcaLine(line.id)}
                                className="text-[#d7c3b2]/50 hover:text-[#F43F5E] p-1.5 transition-colors rounded hover:bg-[#2a1b22]"
                                title="Delete line"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SUB-SECTION 3: SYSTEM ASSEMBLY (CPU / Server Chassis)        */}
            {/* ------------------------------------------------------------- */}
            <div
              id="subsegment-system-assembly"
              className="bg-[#17181c] border border-[#524437]/50 rounded-lg p-4 sm:p-5"
            >
              {/* Assembly Section Title Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#524437]/30">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#ffb86b]/15 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#ffb86b] text-sm">
                        settings_suggest
                      </span>
                    </div>
                    <h4 className="font-['Inter'] text-base font-bold text-[#e5e1e6]">
                      System Assembly
                    </h4>
                  </div>
                  <span className="text-[11px] font-medium text-[#d7c3b2]/80 font-['JetBrains_Mono'] tracking-wide pl-8">
                    Online: {assyOnlineDL} + Offline: {assyOfflineDL} = Total {assyTotalDL} DL
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {/* Cost Center multi-select picker */}
                  <CostCenterMultiPicker
                    id="input-assembly-cost-center"
                    departmentName="System Assembly"
                    value={site.assemblyCostCenter}
                    onChange={handleAssemblyCostCenterChange}
                    hrPresets={ASSEMBLY_HR_PRESETS}
                    placeholder="e.g. CC-SYS-7110"
                  />

                  {/* Parallel Offline DL */}
                  <div className="flex items-center h-[34px] box-border gap-1.5 bg-[#131316] px-2.5 rounded-md border border-[#524437]/40 hover:border-[#ffb86b]/60 transition-colors shrink-0">
                    <label className="font-['JetBrains_Mono'] text-[10px] text-[#ffb86b] font-semibold uppercase whitespace-nowrap flex items-center gap-1 leading-none">
                      <span className="material-symbols-outlined text-[13px] text-[#ffb86b] leading-none">engineering</span>
                      Offline DL:
                    </label>
                    <input
                      id="input-assembly-offline-dl"
                      type="number"
                      min="0"
                      value={site.assemblyOfflineDL ?? 0}
                      onChange={(e) => handleAssemblyOfflineChange(Math.max(0, Number(e.target.value)))}
                      className="w-14 h-6 px-1.5 bg-[#201f23] border border-[#ffb86b]/40 rounded text-center text-xs font-bold text-[#ffb86b] font-['JetBrains_Mono'] focus:outline-none focus:border-[#ffb86b] leading-none"
                      title="System Assembly Independent Offline DL pool"
                    />
                  </div>

                  {/* Parallel ASSY IDL */}
                  <div className="flex items-center h-[34px] box-border gap-1.5 bg-[#131316] px-2.5 rounded-md border border-[#524437]/40 hover:border-[#5de6ff]/60 transition-colors shrink-0">
                    <label className="font-['JetBrains_Mono'] text-[10px] text-[#5de6ff] font-semibold uppercase whitespace-nowrap flex items-center gap-1 leading-none">
                      <span className="material-symbols-outlined text-[13px] text-[#5de6ff] leading-none">support_agent</span>
                      ASSY IDL:
                    </label>
                    <input
                      id="input-assembly-idl"
                      type="number"
                      min="0"
                      value={site.assemblyIdl ?? 0}
                      onChange={(e) => handleAssemblyIdlChange(Math.max(0, Number(e.target.value)))}
                      className="w-14 h-6 px-1.5 bg-[#201f23] border border-[#5de6ff]/40 rounded text-center text-xs font-bold text-[#5de6ff] font-['JetBrains_Mono'] focus:outline-none focus:border-[#5de6ff] leading-none"
                      title="Assembly Segment Indirect Labor"
                    />
                  </div>
                </div>
              </div>

              {/* Assembly Line Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 mb-3">
                <div className="flex items-center gap-3">
                  <button
                    id="btn-add-assembly-line"
                    onClick={handleAddAssemblyLine}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#ffb86b]/20 hover:bg-[#ffb86b]/30 text-[#ffb86b] border border-[#ffb86b]/50 rounded-md transition-colors text-xs font-['JetBrains_Mono'] font-bold"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    <span>ADD ASSEMBLY LINE</span>
                  </button>
                </div>

                <div className="text-xs font-['JetBrains_Mono'] text-[#d7c3b2]/70">
                  Each station (Assy, Test, Packing) has independent Shift configuration
                </div>
              </div>

              {/* System Assembly Table with Station Shifts */}
              <div className="overflow-x-auto rounded-lg border border-[#524437]/40 bg-[#131316]">
                <table className="w-full text-left font-['Inter'] text-xs">
                  <thead className="bg-[#201f23] text-[#d7c3b2]/90 font-['JetBrains_Mono'] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3 border-b border-[#524437]/40 min-w-[140px]">LINE NAME</th>
                      <th className="p-3 border-b border-[#524437]/40 text-center min-w-[170px]">
                        ASSY (DL × SHIFT)
                      </th>
                      <th className="p-3 border-b border-[#524437]/40 text-center min-w-[170px]">
                        TEST (DL × SHIFT)
                      </th>
                      <th className="p-3 border-b border-[#524437]/40 text-center min-w-[170px]">
                        PACKING (DL × SHIFT)
                      </th>
                      <th className="p-3 border-b border-[#524437]/40 text-right w-36 text-[#ffb86b]">
                        TOTAL LINE DL
                      </th>
                      <th className="p-3 border-b border-[#524437]/40 text-center w-14">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(site.cpuAssemblyLines || []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-[#d7c3b2]/50 italic">
                          No Assembly lines configured. Click "ADD ASSEMBLY LINE" to create.
                        </td>
                      </tr>
                    ) : (
                      site.cpuAssemblyLines.map((line) => {
                        const assyShifts = typeof line.assyShift === 'number' ? line.assyShift : 1;
                        const testShifts = typeof line.testShift === 'number' ? line.testShift : 1;
                        const packShifts = typeof line.packShift === 'number' ? line.packShift : 1;
                        const lineTotal =
                          (line.assyDL || 0) * assyShifts +
                          (line.testDL || 0) * testShifts +
                          (line.packDL || 0) * packShifts;

                        return (
                          <tr
                            key={line.id}
                            className="hover:bg-[#1c1b1f] border-b border-[#524437]/20 transition-colors"
                          >
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={line.name}
                                onChange={(e) => handleUpdateAssemblyLine(line.id, 'name', e.target.value)}
                                className="data-table-input data-table-input-left text-[#e5e1e6] font-semibold font-['JetBrains_Mono']"
                              />
                            </td>

                            {/* ASSY Station: DL & Shift */}
                            <td className="p-2.5">
                              <div className="flex items-center justify-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  value={line.assyDL}
                                  onChange={(e) =>
                                    handleUpdateAssemblyLine(line.id, 'assyDL', Math.max(0, Number(e.target.value)))
                                  }
                                  className="w-14 px-2 py-1 bg-[#201f23] border border-[#524437] rounded text-right text-xs font-['JetBrains_Mono'] text-[#e5e1e6] focus:outline-none focus:border-[#ffb86b]"
                                  title="Assembly Standard DL per shift"
                                />
                                <span className="text-[#d7c3b2]/60 text-[11px] font-['JetBrains_Mono']">×</span>
                                <select
                                  value={assyShifts}
                                  onChange={(e) =>
                                    handleUpdateAssemblyLine(line.id, 'assyShift', Number(e.target.value) as ShiftNumber)
                                  }
                                  className="px-2 py-1 bg-[#201f23] border border-[#524437] rounded text-xs font-bold text-[#ffb86b] font-['JetBrains_Mono'] focus:outline-none focus:border-[#ffb86b]"
                                  title="Assembly Shift count (0 to 4)"
                                >
                                  <option value={0}>0S</option>
                                  <option value={1}>1S</option>
                                  <option value={2}>2S</option>
                                  <option value={3}>3S</option>
                                  <option value={4}>4S</option>
                                </select>
                              </div>
                            </td>

                            {/* TEST Station: DL & Shift */}
                            <td className="p-2.5">
                              <div className="flex items-center justify-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  value={line.testDL}
                                  onChange={(e) =>
                                    handleUpdateAssemblyLine(line.id, 'testDL', Math.max(0, Number(e.target.value)))
                                  }
                                  className="w-14 px-2 py-1 bg-[#201f23] border border-[#524437] rounded text-right text-xs font-['JetBrains_Mono'] text-[#e5e1e6] focus:outline-none focus:border-[#ffb86b]"
                                  title="Test Standard DL per shift"
                                />
                                <span className="text-[#d7c3b2]/60 text-[11px] font-['JetBrains_Mono']">×</span>
                                <select
                                  value={testShifts}
                                  onChange={(e) =>
                                    handleUpdateAssemblyLine(line.id, 'testShift', Number(e.target.value) as ShiftNumber)
                                  }
                                  className="px-2 py-1 bg-[#201f23] border border-[#524437] rounded text-xs font-bold text-[#ffb86b] font-['JetBrains_Mono'] focus:outline-none focus:border-[#ffb86b]"
                                  title="Test Shift count (0 to 4)"
                                >
                                  <option value={0}>0S</option>
                                  <option value={1}>1S</option>
                                  <option value={2}>2S</option>
                                  <option value={3}>3S</option>
                                  <option value={4}>4S</option>
                                </select>
                              </div>
                            </td>

                            {/* PACK Station: DL & Shift */}
                            <td className="p-2.5">
                              <div className="flex items-center justify-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  value={line.packDL}
                                  onChange={(e) =>
                                    handleUpdateAssemblyLine(line.id, 'packDL', Math.max(0, Number(e.target.value)))
                                  }
                                  className="w-14 px-2 py-1 bg-[#201f23] border border-[#524437] rounded text-right text-xs font-['JetBrains_Mono'] text-[#e5e1e6] focus:outline-none focus:border-[#ffb86b]"
                                  title="Packing Standard DL per shift"
                                />
                                <span className="text-[#d7c3b2]/60 text-[11px] font-['JetBrains_Mono']">×</span>
                                <select
                                  value={packShifts}
                                  onChange={(e) =>
                                    handleUpdateAssemblyLine(line.id, 'packShift', Number(e.target.value) as ShiftNumber)
                                  }
                                  className="px-2 py-1 bg-[#201f23] border border-[#524437] rounded text-xs font-bold text-[#ffb86b] font-['JetBrains_Mono'] focus:outline-none focus:border-[#ffb86b]"
                                  title="Packing Shift count (0 to 4)"
                                >
                                  <option value={0}>0S</option>
                                  <option value={1}>1S</option>
                                  <option value={2}>2S</option>
                                  <option value={3}>3S</option>
                                  <option value={4}>4S</option>
                                </select>
                              </div>
                            </td>

                            <td className="p-2.5 text-right font-['JetBrains_Mono'] font-bold text-[#ffb86b] text-sm">
                              {lineTotal} DL
                            </td>

                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => handleDeleteAssemblyLine(line.id)}
                                className="text-[#d7c3b2]/50 hover:text-[#F43F5E] p-1.5 transition-colors rounded hover:bg-[#2a1b22]"
                                title="Delete line"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. QUALITY CONTROL SEGMENT                                                */}
      {/* ========================================================================= */}
      <div id="segment-quality-control" className="bg-[#1C1D22] border border-[#524437]/60 rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => setQcOpen(!qcOpen)}
          className="w-full flex items-center justify-between p-4 bg-[#1C1D22] hover:bg-[#201f23] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ffb86b] text-xl">verified_user</span>
            <span className="font-['Inter'] text-lg font-semibold text-[#e5e1e6]">
              Quality Control Segment
            </span>
          </div>
          <span
            className={`material-symbols-outlined text-[#d7c3b2]/70 transition-transform duration-200 ${
              qcOpen ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </button>

        {qcOpen && (
          <div className="p-4 border-t border-[#524437]/40">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PQC / SQC AUDIT */}
              <div className="bg-[#131316] p-4 rounded border border-[#524437]/40 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#524437]/30">
                  <h4 className="font-['JetBrains_Mono'] text-xs font-semibold text-[#d7c3b2]/90 tracking-wider uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs text-[#ffb86b]">fact_check</span>
                    PQC / SQC AUDIT
                  </h4>
                  <CostCenterMultiPicker
                    id="input-pqc-cost-center"
                    departmentName="PQC / SQC"
                    value={site.qualityControl.pqcCostCenter}
                    onChange={(val) =>
                      onUpdateSite({
                        ...site,
                        qualityControl: {
                          ...site.qualityControl,
                          pqcCostCenter: val,
                        },
                      })
                    }
                    hrPresets={PQC_HR_PRESETS}
                    placeholder="e.g. CC-QC-7201"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#e5e1e6]">DL</span>
                    <input
                      type="number"
                      min="0"
                      value={site.qualityControl.pqcDL ?? 0}
                      onChange={(e) =>
                        onUpdateSite({
                          ...site,
                          qualityControl: {
                            ...site.qualityControl,
                            pqcDL: Number(e.target.value),
                          },
                        })
                      }
                      className="data-table-input w-24 font-bold text-[#ffb86b]"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#e5e1e6]">IDL</span>
                    <input
                      type="number"
                      min="0"
                      value={
                        site.qualityControl.pqcIDL ??
                        ((site.qualityControl.pqcDayShift || 0) + (site.qualityControl.pqcNightShift || 0))
                      }
                      onChange={(e) =>
                        onUpdateSite({
                          ...site,
                          qualityControl: {
                            ...site.qualityControl,
                            pqcIDL: Number(e.target.value),
                            pqcDayShift: Number(e.target.value),
                            pqcNightShift: 0,
                          },
                        })
                      }
                      className="data-table-input w-24 text-[#5de6ff] font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* OQC INSPECTION */}
              <div className="bg-[#131316] p-4 rounded border border-[#524437]/40 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#524437]/30">
                  <h4 className="font-['JetBrains_Mono'] text-xs font-semibold text-[#d7c3b2]/90 tracking-wider uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs text-[#ffb86b]">inventory</span>
                    OQC INSPECTION
                  </h4>
                  <CostCenterMultiPicker
                    id="input-oqc-cost-center"
                    departmentName="OQC Inspection"
                    value={site.qualityControl.oqcCostCenter}
                    onChange={(val) =>
                      onUpdateSite({
                        ...site,
                        qualityControl: {
                          ...site.qualityControl,
                          oqcCostCenter: val,
                        },
                      })
                    }
                    hrPresets={OQC_HR_PRESETS}
                    placeholder="e.g. CC-QC-7210"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#e5e1e6]">DL</span>
                    <input
                      type="number"
                      min="0"
                      value={site.qualityControl.oqcStandardDL}
                      onChange={(e) =>
                        onUpdateSite({
                          ...site,
                          qualityControl: {
                            ...site.qualityControl,
                            oqcStandardDL: Number(e.target.value),
                          },
                        })
                      }
                      className="data-table-input w-24 font-bold text-[#ffb86b]"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#e5e1e6]">IDL</span>
                    <input
                      type="number"
                      min="0"
                      value={site.qualityControl.oqcIndirectIDL}
                      onChange={(e) =>
                        onUpdateSite({
                          ...site,
                          qualityControl: {
                            ...site.qualityControl,
                            oqcIndirectIDL: Number(e.target.value),
                          },
                        })
                      }
                      className="data-table-input w-24 text-[#5de6ff] font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. SUPPORT SEGMENTS: Trouble Shooting, Warehouse, Other Support           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trouble Shooting */}
        <div id="segment-troubleshooting" className="bg-[#1C1D22] border border-[#524437]/60 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#524437]/30">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#ffb86b] text-xl">build</span>
              <span className="font-['Inter'] text-base font-semibold text-[#e5e1e6]">
                Trouble Shooting
              </span>
            </div>
            <CostCenterMultiPicker
              id="input-troubleshooting-cost-center"
              departmentName="Trouble Shooting"
              value={site.troubleShooting.costCenter}
              onChange={(val) =>
                onUpdateSite({
                  ...site,
                  troubleShooting: {
                    ...site.troubleShooting,
                    costCenter: val,
                  },
                })
              }
              hrPresets={TROUBLESHOOTING_HR_PRESETS}
              placeholder="e.g. CC-TS-7301"
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className="font-['JetBrains_Mono'] text-[10px] text-[#d7c3b2]/70 uppercase block mb-1">
                DL ENTRY
              </label>
              <input
                type="number"
                value={site.troubleShooting.dlEntry}
                onChange={(e) =>
                  onUpdateSite({
                    ...site,
                    troubleShooting: {
                      ...site.troubleShooting,
                      dlEntry: Number(e.target.value),
                    },
                  })
                }
                className="data-table-input data-table-input-left text-lg font-bold text-[#e5e1e6]"
              />
            </div>
            <div>
              <label className="font-['JetBrains_Mono'] text-[10px] text-[#d7c3b2]/70 uppercase block mb-1">
                IDL ENTRY
              </label>
              <input
                type="number"
                value={site.troubleShooting.idlEntry}
                onChange={(e) =>
                  onUpdateSite({
                    ...site,
                    troubleShooting: {
                      ...site.troubleShooting,
                      idlEntry: Number(e.target.value),
                    },
                  })
                }
                className="data-table-input data-table-input-left text-lg font-bold text-[#5de6ff]"
              />
            </div>
          </div>
        </div>

        {/* Warehouse */}
        <div id="segment-warehouse" className="bg-[#1C1D22] border border-[#524437]/60 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#524437]/30">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#ffb86b] text-xl">
                inventory_2
              </span>
              <span className="font-['Inter'] text-base font-semibold text-[#e5e1e6]">
                Warehouse Logistic
              </span>
            </div>
            <CostCenterMultiPicker
              id="input-warehouse-cost-center"
              departmentName="Warehouse Logistic"
              value={site.warehouse.costCenter}
              onChange={(val) =>
                onUpdateSite({
                  ...site,
                  warehouse: {
                    ...site.warehouse,
                    costCenter: val,
                  },
                })
              }
              hrPresets={WAREHOUSE_HR_PRESETS}
              placeholder="e.g. CC-WH-7401"
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className="font-['JetBrains_Mono'] text-[10px] text-[#d7c3b2]/70 uppercase block mb-1">
                MATERIAL DL
              </label>
              <input
                type="number"
                value={site.warehouse.logisticsDL}
                onChange={(e) =>
                  onUpdateSite({
                    ...site,
                    warehouse: {
                      ...site.warehouse,
                      logisticsDL: Number(e.target.value),
                    },
                  })
                }
                className="data-table-input data-table-input-left text-lg font-bold text-[#e5e1e6]"
              />
            </div>
            <div>
              <label className="font-['JetBrains_Mono'] text-[10px] text-[#d7c3b2]/70 uppercase block mb-1">
                IDL
              </label>
              <input
                type="number"
                value={site.warehouse.adminIDL}
                onChange={(e) =>
                  onUpdateSite({
                    ...site,
                    warehouse: {
                      ...site.warehouse,
                      adminIDL: Number(e.target.value),
                    },
                  })
                }
                className="data-table-input data-table-input-left text-lg font-bold text-[#5de6ff]"
              />
            </div>
          </div>
        </div>

        {/* Other Support */}
        <div id="segment-othersupport" className="bg-[#1C1D22] border border-[#524437]/60 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#524437]/30">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#ffb86b] text-xl">
                support_agent
              </span>
              <span className="font-['Inter'] text-base font-semibold text-[#e5e1e6]">
                Other Support
              </span>
            </div>
            <CostCenterMultiPicker
              id="input-othersupport-cost-center"
              departmentName="Other Support"
              value={site.otherSupport.costCenter}
              onChange={(val) =>
                onUpdateSite({
                  ...site,
                  otherSupport: {
                    ...site.otherSupport,
                    costCenter: val,
                  },
                })
              }
              hrPresets={OTHER_SUPPORT_HR_PRESETS}
              placeholder="e.g. CC-OTH-7501"
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className="font-['JetBrains_Mono'] text-[10px] text-[#d7c3b2]/70 uppercase block mb-1">
                DL
              </label>
              <input
                type="number"
                min="0"
                value={site.otherSupport.dl ?? 0}
                onChange={(e) =>
                  onUpdateSite({
                    ...site,
                    otherSupport: {
                      ...site.otherSupport,
                      dl: Number(e.target.value),
                    },
                  })
                }
                className="data-table-input data-table-input-left text-lg font-bold text-[#ffb86b]"
              />
            </div>
            <div>
              <label className="font-['JetBrains_Mono'] text-[10px] text-[#d7c3b2]/70 uppercase block mb-1">
                IDL
              </label>
              <input
                type="number"
                min="0"
                value={site.otherSupport.generalIDL}
                onChange={(e) =>
                  onUpdateSite({
                    ...site,
                    otherSupport: {
                      ...site.otherSupport,
                      generalIDL: Number(e.target.value),
                    },
                  })
                }
                className="data-table-input data-table-input-left text-lg font-bold text-[#5de6ff]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
