import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Save, FileOutput, Receipt } from "lucide-react";
import InvoiceTemplate from "@/components/invoice-template";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";
import logoPath from "@assets/logo.png";

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
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto border-primary/20">
        <DialogHeader className="bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-4 border-b border-primary/10 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold flex items-center">
            <Receipt className="mr-2 h-5 w-5 text-primary" />
            Invoice Preview
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 hover:bg-primary/10"
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
            variant="outline"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center border-primary text-primary hover:bg-primary/10"
          >
            <FileOutput className="mr-2 h-4 w-4" /> 
            {isDownloading ? "Downloading..." : "Download PDF"}
          </Button>
          <Button 
            onClick={onSave}
            className="flex items-center bg-secondary hover:bg-secondary/90"
          >
            <Save className="mr-2 h-4 w-4" /> Save Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreview;