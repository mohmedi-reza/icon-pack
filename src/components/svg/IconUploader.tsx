import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useSvg } from '@/lib/svg-context';

export function IconUploader() {
  const { addIcons } = useSvg();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    total: number;
    success: number;
    failed: number;
  } | null>(null);
  
  const handleFileChange = async (files: FileList | null) => {
    if (!files?.length) return;
    
    setIsProcessing(true);
    try {
      const svgFiles = Array.from(files).filter(file => 
        file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
      );
      
      if (svgFiles.length) {
        await addIcons(svgFiles);
        setUploadStatus({
          total: files.length,
          success: svgFiles.length,
          failed: files.length - svgFiles.length
        });
        
        // Clear status after 5 seconds
        setTimeout(() => {
          setUploadStatus(null);
        }, 5000);
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-md p-8 transition-all ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-4xl text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-10">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-lg">Drop your SVG files here</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Or click the button below to select files
            </p>
          </div>
          <div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".svg,image/svg+xml" 
              multiple 
              onChange={handleFileInputChange} 
              className="hidden"
              aria-label="Select SVG files"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              variant="outline"
            >
              {isProcessing ? 'Processing...' : 'Select SVG Files'}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Files will be automatically minified and normalized
          </div>
        </div>
      </div>
      
      {uploadStatus && (
        <div className={`text-sm p-3 rounded-md ${uploadStatus.failed > 0 ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
          <div className="font-medium mb-1">
            {uploadStatus.failed > 0 
              ? 'Some files were not uploaded' 
              : 'All files processed successfully'}
          </div>
          <div>
            Successfully processed: {uploadStatus.success} file{uploadStatus.success !== 1 ? 's' : ''}<br/>
            {uploadStatus.failed > 0 && (
              <span>Failed: {uploadStatus.failed} (only SVG files are supported)</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 