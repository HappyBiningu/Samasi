import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Save, FileDown } from "lucide-react";
import InvoiceTemplate from "@/components/invoice-template";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";

interface InvoicePreviewProps {
  invoice: any;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}

const InvoicePreview = ({ invoice, onClose, onSave }: InvoicePreviewProps) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const element = document.getElementById('invoice-template');
      if (!element) {
        throw new Error("Invoice template element not found");
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      // Create PDF with correct dimensions for A4
      const pdf = new jsPDF({
        format: 'a4',
        unit: 'mm',
      });
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: `Invoice #${invoice.invoiceNumber} has been downloaded`,
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the PDF",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Invoice Preview</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="font-sans">
          <InvoiceTemplate invoice={invoice} />
        </div>
        
        <DialogFooter>
          <Button 
            variant="secondary"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center"
          >
            <FileDown className="mr-2 h-4 w-4" /> 
            {isDownloading ? "Downloading..." : "Download PDF"}
          </Button>
          <Button 
            onClick={onSave}
            className="flex items-center"
          >
            <Save className="mr-2 h-4 w-4" /> Save Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreview;
