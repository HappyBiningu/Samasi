import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Invoice } from "@shared/schema";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  FileEdit,
  FileOutput,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Receipt,
  List,
} from "lucide-react";
import logoPath from "@assets/logo.png";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const InvoicesList = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/invoices/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice deleted",
        description: "The invoice has been successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete invoice: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const filteredInvoices = invoices?.filter((invoice) => {
    const matchesSearch = 
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteInvoiceMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const downloadPdf = async (invoice: Invoice) => {
    try {
      // Get the invoice data first
      const response = await apiRequest("GET", `/api/invoices/${invoice.id}`);
      
      // Create a temporary component for rendering
      const element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      document.body.appendChild(element);
      
      // Create a new instance of jsPDF
      const { jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      // Render the invoice template to the hidden div
      const tempDiv = document.createElement('div');
      tempDiv.id = 'invoice-template';
      tempDiv.className = 'border border-neutral-300 p-8 bg-white font-sans';
      
      // Build simplified invoice HTML
      tempDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">Invoice</h2>
            <p>360 Rivonia Boulevard, Edenburg, 2192</p>
            <p>Registration Number: 2017/374222/21</p>
            <p>VAT No: 4650278411</p>
          </div>
          <div>
            <div style="width: 80px; text-align: right;">
              <img src="${window.location.origin}/assets/logo.png" alt="Samasi Logo" style="max-width: 100%;" />
            </div>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <h3 style="font-weight: bold; margin-bottom: 5px;">BILL TO</h3>
            <p>${invoice.clientName}</p>
            <p>Registration Number: ${invoice.clientRegNumber}</p>
            <p>VAT No: ${invoice.clientVatNumber}</p>
          </div>
          <div style="text-align: right;">
            <p>
              <span style="display: inline-block; width: 120px; font-weight: bold;">INVOICE #</span>
              <span>${invoice.invoiceNumber}</span>
            </p>
            <p>
              <span style="display: inline-block; width: 120px; font-weight: bold;">INVOICE DATE</span>
              <span>${invoice.invoiceDate}</span>
            </p>
          </div>
        </div>
        
        <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #333;">
              <th style="text-align: left; padding: 8px; font-weight: bold;">DESCRIPTION</th>
              <th style="text-align: right; padding: 8px; font-weight: bold;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.lineItems.map((item: any) => `
              <tr>
                <td style="text-align: left; padding: 8px;">${item.description}</td>
                <td style="text-align: right; padding: 8px;">${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr style="border-top: 1px solid #ddd;">
              <td style="text-align: right; padding: 8px; font-weight: bold;">Subtotal</td>
              <td style="text-align: right; padding: 8px; font-weight: bold;">${invoice.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="text-align: right; padding: 8px; font-weight: bold;">VAT (15.0%)</td>
              <td style="text-align: right; padding: 8px; font-weight: bold;">${invoice.vat.toFixed(2)}</td>
            </tr>
            <tr style="border-top: 2px solid #333;">
              <td style="text-align: right; padding: 8px; font-weight: bold; font-size: 18px;">TOTAL</td>
              <td style="text-align: right; padding: 8px; font-weight: bold; font-size: 18px;">R${invoice.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div style="text-align: center; margin-bottom: 15px;">
          <h3 style="font-weight: bold; margin-bottom: 5px;">Terms & Conditions</h3>
        </div>
        
        <div style="text-align: center; margin-bottom: 15px;">
          <p style="font-weight: bold;">Thank you</p>
        </div>
        
        <div style="text-align: center;">
          <p>Bank: First National Bank(FNB)</p>
          <p>Account Number: 62417570993</p>
          <p>Branch Code: 250655</p>
        </div>
        
        <div style="text-align: right; margin-top: 20px; font-size: 12px; color: #777;">
          Powered by Samasi
        </div>
      `;
      
      element.appendChild(tempDiv);
      
      // Capture the rendered template as an image
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      // Create PDF with correct dimensions for A4
      const pdf = new jsPDF({
        format: 'a4',
        unit: 'mm'
      });
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
      
      // Clean up the temporary element
      document.body.removeChild(element);
      
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
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "unpaid":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Unpaid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <img src={logoPath} alt="Samasi Logo" className="h-10 w-auto mr-3" />
          <h2 className="text-2xl font-semibold flex items-center">
            <List className="mr-2 h-5 w-5 text-primary" />
            My Invoices
          </h2>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="text-neutral-500 hover:text-primary flex items-center border-primary/20 hover:bg-primary/5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
      
      <Card className="border-primary/20 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-4 border-b border-primary/10">
          <h3 className="font-medium flex items-center">
            <Receipt className="mr-2 h-5 w-5 text-primary" />
            Invoice Management
          </h3>
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search invoices..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Invoices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Invoices</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-10 bg-neutral-100 animate-pulse rounded"></div>
              <div className="h-16 bg-neutral-50 animate-pulse rounded"></div>
              <div className="h-16 bg-neutral-50 animate-pulse rounded"></div>
              <div className="h-16 bg-neutral-50 animate-pulse rounded"></div>
            </div>
          ) : filteredInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-neutral-50 transition">
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell className="text-neutral-500">{invoice.invoiceDate}</TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(invoice.total)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/edit-invoice/${invoice.id}`)}
                          title="View"
                          className="hover:bg-primary/10"
                        >
                          <Eye className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/edit-invoice/${invoice.id}`)}
                          title="Edit"
                          className="hover:bg-secondary/10"
                        >
                          <FileEdit className="h-4 w-4 text-secondary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => downloadPdf(invoice)}
                          title="Download PDF"
                          className="hover:bg-primary/10"
                        >
                          <FileOutput className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(invoice.id)}
                          title="Delete"
                          className="hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4 text-neutral-500 hover:text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Receipt className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-secondary">No invoices found</h3>
              <p className="mt-1 text-sm text-neutral-500">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter"
                  : "Get started by creating a new invoice."}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <div className="mt-6">
                  <Button 
                    onClick={() => navigate("/new-invoice")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <FileOutput className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {filteredInvoices.length > 0 && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-neutral-500">
                Showing <span className="font-medium">1-{filteredInvoices.length}</span> of{" "}
                <span className="font-medium">{filteredInvoices.length}</span> invoices
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 p-0"
                  disabled
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 bg-primary text-white hover:bg-primary/90"
                >
                  1
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 p-0"
                  disabled
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              invoice and all of its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InvoicesList;
