/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Terminal,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Code,
  Grid,
  List,
  FileSpreadsheet,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { extractPDFMetadata } from '../utils/pdfExtractor';
import { PDFDocumentModel, PDFTextItem } from '../types/pdf';

export default function ImportView() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedDoc, setParsedDoc] = useState<PDFDocumentModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPageFilter, setSelectedPageFilter] = useState<number | 'all'>('all');
  const [debugTab, setDebugTab] = useState<'table' | 'json' | 'spatial'>('table');
  const [copied, setCopied] = useState(false);

  // Table pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setError('Unsupported file format. Please upload ONLY PDF (.pdf) documents.');
        return;
      }
      await processFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setError('Unsupported file format. Please upload ONLY PDF (.pdf) documents.');
        return;
      }
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setIsLoading(true);
    setParsedDoc(null);
    setCurrentPage(1);
    
    try {
      const metadata = await extractPDFMetadata(file);
      setParsedDoc(metadata);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during PDF text extraction.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!parsedDoc) return;
    navigator.clipboard.writeText(JSON.stringify(parsedDoc, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setParsedDoc(null);
    setError(null);
    setSearchQuery('');
    setSelectedPageFilter('all');
  };

  // Compile items from all pages
  const allTextItems: (PDFTextItem & { pageNumber: number })[] = parsedDoc
    ? parsedDoc.pages.flatMap(page => 
        page.items.map(item => ({ ...item, pageNumber: page.number }))
      )
    : [];

  // Filter items based on search and page selection
  const filteredItems = allTextItems.filter(item => {
    const matchesSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.font.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPage = selectedPageFilter === 'all' || item.pageNumber === selectedPageFilter;
    return matchesSearch && matchesPage;
  });

  // Paginated items for the Table component
  const pageCount = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div id="pdf-import-view" className="space-y-6 pb-12 animate-fade-in relative">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-zinc-100 flex items-center gap-3">
            <Cpu className="w-6 h-6 text-blue-500" />
            PDF Extraction Engine
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Core high-precision PDF.js parsing platform. Extracts absolute coordinates, bounding boxes, matrices, and typography.
          </p>
        </div>
        {parsedDoc && (
          <button
            onClick={handleClear}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
          >
            Clear Document
          </button>
        )}
      </div>

      {/* Main Grid: Upload & Metrics & Error Banner */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Upload Target & File Overview */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 space-y-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Document Source Target</span>
            
            {/* Drag and Drop Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all relative cursor-pointer ${
                isDragging 
                  ? 'border-blue-500/60 bg-blue-500/5' 
                  : 'border-zinc-800 bg-zinc-900/10 hover:bg-zinc-900/30 hover:border-zinc-800'
              } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
            >
              <input
                id="pdf-file-picker"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />
              <label htmlFor="pdf-file-picker" className="cursor-pointer space-y-3 block">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                  <Upload className={`w-5 h-5 text-zinc-400 ${isLoading ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                  <span className="text-xs font-sans font-semibold text-zinc-200 block">
                    {isLoading ? 'Processing Document...' : 'Drag PDF here, or click to browse'}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 block mt-1.5">
                    Accepts only PDF documents (.pdf)
                  </span>
                </div>
              </label>
            </div>

            {/* Error Notification Block */}
            {error && (
              <div className="p-3.5 bg-red-950/20 border border-red-900/30 text-red-200 rounded-lg flex gap-3 text-xs">
                <AlertTriangle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed">
                  <span className="font-semibold block font-mono">EXTRACTION_FAILURE</span>
                  <p className="text-[11px] text-red-400/90">{error}</p>
                </div>
              </div>
            )}

            {/* Selected File Card */}
            {selectedFile && (
              <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <FileText className="w-8 h-8 text-blue-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-zinc-200 block truncate">{selectedFile.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500 block mt-1">
                      Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                {isLoading && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                      <span>Parsing streams with PDF.js...</span>
                      <span>Running</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full w-2/3 animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Execution Telemetry Metrics */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Parser Pipeline Telemetry</span>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* Metric 1 */}
                <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-xl">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Pages</span>
                  <span className="text-2xl font-display font-semibold text-zinc-100 block mt-2">
                    {parsedDoc ? parsedDoc.pageCount : '—'}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-600 block mt-1">Verified page streams</span>
                </div>

                {/* Metric 2 */}
                <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-xl">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Extracted Items</span>
                  <span className="text-2xl font-display font-semibold text-zinc-100 block mt-2">
                    {parsedDoc ? parsedDoc.itemCount : '—'}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-600 block mt-1">Physical glyph blocks</span>
                </div>

                {/* Metric 3 */}
                <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-xl col-span-2 md:col-span-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Parsing Speed</span>
                  <span className="text-2xl font-display font-semibold text-emerald-400 block mt-2">
                    {parsedDoc ? `${parsedDoc.parsingTimeMs} ms` : '—'}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-600 block mt-1">Performance benchmark</span>
                </div>
              </div>
            </div>

            {/* Quick Warning / Notice */}
            <div className="p-3 bg-zinc-900/10 border border-zinc-900/40 rounded-lg flex items-center gap-3 mt-4">
              <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="text-[10px] font-mono text-zinc-400 leading-relaxed">
                {parsedDoc 
                  ? 'All text matrix structures loaded. Ready for layout analysis mapping.' 
                  : 'Awaiting document drop to start the localized extraction engine.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Big Debug panel showing the extracted text items */}
      <AnimatePresence>
        {parsedDoc && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="border border-zinc-900 rounded-xl bg-zinc-950/40 overflow-hidden flex flex-col"
          >
            {/* Header / Tabs */}
            <div className="p-4 border-b border-zinc-900 bg-zinc-950/80 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
              <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-mono font-bold text-zinc-200">INTERMEDIATE DOCUMENT MODEL DEBUGGER</span>
              </div>

              {/* View Selector Tabs */}
              <div className="flex gap-1 bg-zinc-900/60 border border-zinc-900 p-1 rounded-lg">
                {[
                  { id: 'table', label: 'Items Table', icon: FileSpreadsheet },
                  { id: 'json', label: 'Raw Model JSON', icon: Code },
                  { id: 'spatial', label: 'Spatial Map', icon: Grid },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setDebugTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium font-sans flex items-center gap-2 transition-all cursor-pointer ${
                        debugTab === tab.id
                          ? 'bg-zinc-800 text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Toolbars */}
            <div className="px-4 py-3 bg-zinc-950/20 border-b border-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              {/* Search query input */}
              <div className="bg-zinc-900/50 border border-zinc-900 rounded-lg px-3 py-1.5 flex items-center gap-2.5 max-w-sm flex-1">
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter extracted items by text content..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent border-0 outline-0 text-xs text-zinc-300 placeholder-zinc-600 font-sans"
                />
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(''); setCurrentPage(1); }} 
                    className="text-zinc-500 hover:text-zinc-300 text-[10px]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Page Number select filter */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Page Filter:</span>
                <select
                  value={selectedPageFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedPageFilter(val === 'all' ? 'all' : Number(val));
                    setCurrentPage(1);
                  }}
                  className="bg-zinc-900 border border-zinc-900 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-400 outline-0 focus:border-zinc-800"
                >
                  <option value="all">ALL PAGES</option>
                  {Array.from({ length: parsedDoc.pageCount }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>Page {num}</option>
                  ))}
                </select>

                {debugTab === 'json' && (
                  <button
                    onClick={handleCopyJson}
                    className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-all text-xs font-mono flex items-center gap-2 text-zinc-300 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied Model</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Render Tab Content */}
            <div className="p-4 flex-1">
              
              {/* Tab 1: ITEMS TABLE LIST */}
              {debugTab === 'table' && (
                <div className="space-y-4">
                  <div className="border border-zinc-900 rounded-lg overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-400 border-collapse">
                      <thead className="bg-zinc-900/40 text-[10px] font-mono text-zinc-500 uppercase tracking-wider border-b border-zinc-900 select-none">
                        <tr>
                          <th className="px-4 py-3 text-center w-14">Page</th>
                          <th className="px-4 py-3 min-w-[200px]">Extracted Text</th>
                          <th className="px-4 py-3 text-right">X coord</th>
                          <th className="px-4 py-3 text-right">Y coord</th>
                          <th className="px-4 py-3 text-right">Width</th>
                          <th className="px-4 py-3 text-right">Height</th>
                          <th className="px-4 py-3">Font Name</th>
                          <th className="px-4 py-3 text-right">Size</th>
                          <th className="px-4 py-3 max-w-[120px] truncate">Matrix (Scale, Skew)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {paginatedItems.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-12 text-center text-zinc-600 font-mono text-xs">
                              No parsed items matched the filter criteria.
                            </td>
                          </tr>
                        ) : (
                          paginatedItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-zinc-900/20 font-mono text-[11px] text-zinc-300 transition-all">
                              <td className="px-4 py-2.5 text-center text-zinc-500 font-bold">{item.pageNumber}</td>
                              <td className="px-4 py-2.5 font-sans font-medium text-zinc-100 whitespace-pre-wrap break-all">{item.text || <span className="text-zinc-700 italic">None</span>}</td>
                              <td className="px-4 py-2.5 text-right text-blue-400/90">{item.x}</td>
                              <td className="px-4 py-2.5 text-right text-blue-400/90">{item.y}</td>
                              <td className="px-4 py-2.5 text-right text-zinc-500">{item.width}</td>
                              <td className="px-4 py-2.5 text-right text-zinc-500">{item.height}</td>
                              <td className="px-4 py-2.5 text-zinc-400 font-sans truncate max-w-[150px]" title={item.font}>{item.font}</td>
                              <td className="px-4 py-2.5 text-right text-amber-500">{item.fontSize}</td>
                              <td className="px-4 py-2.5 text-right text-zinc-600 truncate max-w-[120px]" title={JSON.stringify(item.transform)}>
                                {`[${item.transform.slice(0,4).join(',')}]`}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination footer */}
                  {pageCount > 1 && (
                    <div className="flex items-center justify-between border-t border-zinc-900/60 pt-4 font-mono text-[11px] text-zinc-500 select-none">
                      <span>
                        Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 flex items-center border border-zinc-900 bg-zinc-950 rounded text-zinc-300">
                          {currentPage} / {pageCount}
                        </span>
                        <button
                          disabled={currentPage === pageCount}
                          onClick={() => setCurrentPage(prev => Math.min(pageCount, prev + 1))}
                          className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: RAW MODEL JSON SPEC */}
              {debugTab === 'json' && (
                <div className="space-y-4">
                  <pre className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl text-[11px] font-mono text-blue-300 overflow-auto max-h-[600px] leading-relaxed select-text">
                    {JSON.stringify(
                      selectedPageFilter === 'all' 
                        ? parsedDoc 
                        : {
                            ...parsedDoc,
                            pages: parsedDoc.pages.filter(p => p.number === selectedPageFilter)
                          }, 
                      null, 
                      2
                    )}
                  </pre>
                  <p className="text-[10px] font-mono text-zinc-500 mt-2">
                    * Showing intermediate document model output according to the JSON specification. Direct mapping matching standard layout analyzer targets.
                  </p>
                </div>
              )}

              {/* Tab 3: SPATIAL CANVAS MAP PREVIEW */}
              {debugTab === 'spatial' && (
                <div className="space-y-4">
                  <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-lg text-[11px] font-mono text-zinc-500 leading-relaxed select-none">
                    Spatial coordinate maps display relative position vectors (x, y coords) directly inside page bounds. Perfect for visual mapping checks.
                  </div>

                  {/* Render mapping pages */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {parsedDoc.pages
                      .filter(page => selectedPageFilter === 'all' || page.number === selectedPageFilter)
                      .slice(0, 4) // Show up to 4 pages for efficiency
                      .map((page) => {
                        // Dynamically scale/position points relative to the coordinate box
                        // Find bounds of text blocks
                        const xCoords = page.items.map(item => item.x);
                        const yCoords = page.items.map(item => item.y);
                        const minX = xCoords.length ? Math.min(...xCoords) : 0;
                        const maxX = xCoords.length ? Math.max(...xCoords) : 500;
                        const minY = yCoords.length ? Math.min(...yCoords) : 0;
                        const maxY = yCoords.length ? Math.max(...yCoords) : 800;

                        const spanX = Math.max(maxX - minX, 100);
                        const spanY = Math.max(maxY - minY, 100);

                        return (
                          <div key={page.number} className="border border-zinc-900 rounded-xl bg-zinc-950/90 overflow-hidden">
                            <div className="bg-zinc-900/40 px-3.5 py-2 border-b border-zinc-900 flex items-center justify-between font-mono text-[10px] text-zinc-500 select-none">
                              <span>PAGE {page.number} VIEWPORTS</span>
                              <span>{page.items.length} Text Blocks</span>
                            </div>

                            {/* Coordinate bounding box simulation */}
                            <div className="h-80 bg-zinc-950 relative border-b border-zinc-900 overflow-hidden group">
                              
                              {/* Background grids */}
                              <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

                              {page.items.map((item, idx) => {
                                // Convert database coordinate metrics to scaled CSS percents
                                // Normalizing coordinates relative to parent viewport box
                                const pctLeft = ((item.x - minX) / spanX) * 85 + 7;
                                // In PDF space, y usually increases bottom-up. We mirror it top-down for standard browser canvas.
                                const pctTop = 90 - (((item.y - minY) / spanY) * 80 + 5);

                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      left: `${pctLeft}%`,
                                      top: `${pctTop}%`,
                                    }}
                                    className="absolute p-0.5 max-w-[120px] border border-blue-500/20 bg-blue-500/5 hover:border-amber-400 hover:bg-amber-500/10 rounded group/item transition-all select-none pointer-events-auto"
                                  >
                                    <span className="text-[7px] font-sans text-zinc-400 group-hover/item:text-zinc-100 truncate block">
                                      {item.text}
                                    </span>
                                    
                                    {/* Hover info tooltip */}
                                    <div className="absolute left-1/2 -translate-x-1/2 -top-12 opacity-0 group-hover/item:opacity-100 transition-opacity bg-zinc-900 border border-zinc-800 text-[8px] font-mono text-zinc-300 p-1.5 rounded shadow-xl z-20 pointer-events-none whitespace-nowrap space-y-0.5">
                                      <div>Text: "{item.text}"</div>
                                      <div className="text-blue-400">Coord: X {item.x} | Y {item.y}</div>
                                      <div className="text-amber-500">Font: {item.font} ({item.fontSize}px)</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="p-3 flex items-center justify-between font-mono text-[9px] text-zinc-600 select-none">
                              <span>Bounds: [{minX.toFixed(0)}, {minY.toFixed(0)}] to [{maxX.toFixed(0)}, {maxY.toFixed(0)}]</span>
                              <span>* Scaling factor applied</span>
                            </div>
                          </div>
                        );
                      })}
                    {parsedDoc.pageCount > 4 && (
                      <div className="col-span-full py-3.5 text-center font-mono text-[10px] text-zinc-600 border border-dashed border-zinc-900 rounded-lg select-none">
                        Page count exceeds viewport size. Use the page filters to inspect additional pages.
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
