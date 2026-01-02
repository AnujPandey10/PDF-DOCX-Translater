import React, { useEffect, useRef, useState } from 'react';

interface DocumentViewerProps {
  originalUrl: string;
  translatedHtml: string | null;
  isLoading: boolean;
  statusMessage?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ originalUrl, translatedHtml, isLoading, statusMessage }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);

  // Load PDF document using pdf.js
  useEffect(() => {
    if (!originalUrl) return;

    const loadPdf = async () => {
      try {
        // @ts-ignore
        const loadingTask = window.pdfjsLib.getDocument(originalUrl);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPdf();
  }, [originalUrl]);

  // Render all pages
  useEffect(() => {
    if (!pdfDoc || !containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    const renderPages = async () => {
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        try {
          const page = await pdfDoc.getPage(pageNum);
          
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.style.width = '100%';
          canvas.style.height = 'auto';
          canvas.style.marginBottom = '20px';
          canvas.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
          
          // Append before rendering to ensure order
          containerRef.current?.appendChild(canvas);

          if (context) {
            await page.render({
              canvasContext: context,
              viewport: viewport
            }).promise;
          }
        } catch (error) {
          console.error(`Error rendering page ${pageNum}:`, error);
        }
      }
    };

    renderPages();
  }, [pdfDoc, numPages]);
  
  const handleDownload = () => {
    const element = document.getElementById('translated-content');
    if (!element) return;

    // Use html2pdf if available globally
    // @ts-ignore
    if (typeof window.html2pdf !== 'undefined') {
        const opt = {
            margin: [10, 10],
            filename: 'translated_document.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        // @ts-ignore
        window.html2pdf().set(opt).from(element).save();
    } else {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Translated Document</title>
                    <style>
                    body { font-family: sans-serif; padding: 40px; }
                    img { max-width: 100%; }
                    </style>
                </head>
                <body>
                    ${translatedHtml}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    }
  };

  // Helper to sanitize HTML and prevent external image loading errors
  const getSafeHtml = (html: string) => {
    if (!html) return '';
    // Regex to find img tags and replace them with a safe div placeholder
    return html.replace(/<img[^>]*>/gi, '<div style="background:#f8fafc; border: 1px dashed #cbd5e1; padding:1rem; text-align:center; margin: 1rem 0; color: #94a3b8; font-size: 0.8rem; border-radius: 6px;">[Image/Figure]</div>');
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 pb-4">
      {/* Original Document - Canvas Render */}
      <div className="flex-1 bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden">
        <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Original</span>
            <span className="text-xs text-slate-400">{numPages} Pages</span>
        </div>
        <div className="flex-1 bg-slate-200 overflow-y-auto custom-scrollbar p-4 flex flex-col items-center">
            {/* Canvases will be injected here */}
            <div ref={containerRef} className="w-full max-w-[800px]"></div>
            
            {!pdfDoc && (
                 <div className="flex flex-col items-center justify-center h-full text-slate-400">
                     <i className="fa-solid fa-spinner fa-spin text-2xl mb-2"></i>
                     <p>Loading PDF preview...</p>
                 </div>
            )}
        </div>
      </div>

      {/* Translated Document */}
      <div className="flex-1 bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden relative">
         <div className="h-10 bg-brand-50 border-b border-brand-100 flex items-center px-4 justify-between">
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Translated Preview</span>
             {translatedHtml && !isLoading && (
                 <button 
                    onClick={handleDownload}
                    className="text-xs flex items-center gap-1.5 text-brand-700 hover:text-brand-900 font-medium transition-colors"
                 >
                    <i className="fa-solid fa-download"></i> Download PDF
                 </button>
             )}
        </div>
        <div className="flex-1 relative overflow-hidden bg-white">
          {isLoading && !translatedHtml && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-brand-600">
                    <i className="fa-solid fa-language text-xl"></i>
                </div>
              </div>
              <p className="mt-4 text-brand-900 font-medium animate-pulse">{statusMessage || "Preparing translation..."}</p>
            </div>
          )}
          
          {translatedHtml ? (
            <div 
                id="translated-content"
                className="w-full h-full overflow-y-auto p-8 custom-scrollbar bg-white text-slate-900 font-sans"
            >
               {/* We render the HTML directly with sanitization */}
               <div dangerouslySetInnerHTML={{ __html: getSafeHtml(translatedHtml) }} />
               
               {/* Small indicator at the bottom if still streaming */}
               {isLoading && (
                   <div className="mt-4 p-2 text-center text-xs text-brand-500 italic animate-pulse">
                       Generating more content...
                   </div>
               )}
            </div>
          ) : (
            !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <i className="fa-solid fa-file-signature text-4xl mb-3 opacity-50"></i>
                    <p>Translation will appear here</p>
                </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;