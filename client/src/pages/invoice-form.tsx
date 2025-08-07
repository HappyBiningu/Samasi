import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineItem as LineItemType, Invoice, BankDetails } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, FileOutput, Receipt, FileEdit, FileText, Eye } from "lucide-react";
import { formatCurrency, calculateInvoiceTotals } from "@/lib/utils";
import InvoicePreview from "@/components/invoice-preview";
import LineItem from "@/components/line-item";
import logoPath from "@assets/logo.png";

interface InvoiceFormData {
  invoiceNumber: string;
  invoiceDate: string;
  clientName: string;
  clientRegNumber: string;
  clientVatNumber: string;
  lineItems: LineItemType[];
  bankDetails?: BankDetails;
  subtotal: number;
  vat: number;
  total: number;
  status: string;
  dueDate?: string;
  reminderCount?: number;
  lastReminderSent?: string;
}

const InvoiceForm = () => {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isEditing = Boolean(params.id);

  const initialLineItems: LineItemType[] = [
    { description: "", amount: 0 },
  ];

  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    clientName: "",
    clientRegNumber: "",
    clientVatNumber: "",
    lineItems: initialLineItems,
    subtotal: 0,
    vat: 0,
    total: 0,
    status: "unpaid",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Default: 30 days from now
    reminderCount: 0,
  });

  // Fetch invoice data if editing
  const { data: invoiceData, isLoading } = useQuery<Invoice>({
    queryKey: [isEditing ? `/api/invoices/${params.id}` : ""],
    enabled: isEditing,
  });

  // Set form data from fetched invoice
  useEffect(() => {
    if (invoiceData) {
      setFormData({
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceDate: invoiceData.invoiceDate,
        clientName: invoiceData.clientName,
        clientRegNumber: invoiceData.clientRegNumber,
        clientVatNumber: invoiceData.clientVatNumber,
        lineItems: invoiceData.lineItems,
        subtotal: invoiceData.subtotal,
        vat: invoiceData.vat,
        total: invoiceData.total,
        status: invoiceData.status,
        dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        reminderCount: invoiceData.reminderCount || 0,
        lastReminderSent: invoiceData.lastReminderSent ? invoiceData.lastReminderSent.toISOString() : undefined,
        bankDetails: invoiceData.bankDetails || undefined,
      });
    }
  }, [invoiceData]);

  // Create/Update invoice mutation
  const mutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      if (isEditing) {
        return apiRequest("PUT", `/api/invoices/${params.id}`, data);
      } else {
        return apiRequest("POST", "/api/invoices", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: [`/api/invoices/${params.id}`] });
      }
      toast({
        title: isEditing ? "Invoice updated" : "Invoice created",
        description: isEditing 
          ? "The invoice has been successfully updated" 
          : "The invoice has been successfully created",
      });
      navigate("/invoices");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} invoice: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value,
      } as BankDetails,
    }));
  };

  const handleLineItemChange = (index: number, field: keyof LineItemType, value: string | number) => {
    setFormData((prev) => {
      const newLineItems = [...prev.lineItems];
      newLineItems[index] = {
        ...newLineItems[index],
        [field]: field === "amount" ? Number(value) : value,
      };
      
      const { subtotal, vat, total } = calculateInvoiceTotals(newLineItems);
      
      return {
        ...prev,
        lineItems: newLineItems,
        subtotal,
        vat,
        total,
      };
    });
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: "", amount: 0 }],
    }));
  };

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length <= 1) {
      return; // Keep at least one line item
    }
    
    setFormData((prev) => {
      const newLineItems = prev.lineItems.filter((_, i) => i !== index);
      const { subtotal, vat, total } = calculateInvoiceTotals(newLineItems);
      
      return {
        ...prev,
        lineItems: newLineItems,
        subtotal,
        vat,
        total,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  if (isLoading && isEditing) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 bg-neutral-200 rounded"></div>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="h-60 bg-neutral-100 rounded"></div>
            <div className="h-40 bg-neutral-100 rounded"></div>
            <div className="h-60 bg-neutral-100 rounded"></div>
            <div className="h-20 bg-neutral-100 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <img src={logoPath} alt="Samasi Logo" className="h-10 w-auto mr-3" />
          <h2 className="text-2xl font-semibold flex items-center">
            {isEditing ? (
              <FileEdit className="mr-2 h-5 w-5 text-secondary" />
            ) : (
              <FileOutput className="mr-2 h-5 w-5 text-primary" />
            )}
            {isEditing ? "Edit Invoice" : "Create New Invoice"}
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
            Invoice Details
          </h3>
        </div>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Your Company Info (Non-editable) */}
              <div>
                <h3 className="text-lg font-medium mb-4 pb-2 border-b border-neutral-200">Your Company Info</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-neutral-500 mb-1">Company Name</Label>
                    <p className="font-medium">360 Rivonia Boulevard, Edenburg, 2192</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-neutral-500 mb-1">Registration Number</Label>
                    <p className="font-medium">2017/374222/21</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-neutral-500 mb-1">VAT Number</Label>
                    <p className="font-medium">4650278411</p>
                  </div>
                </div>
              </div>
              
              {/* Bill To Info (Editable) */}
              <div>
                <h3 className="text-lg font-medium mb-4 pb-2 border-b border-neutral-200">Bill To</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="clientName" className="text-sm font-medium text-neutral-500 mb-1">Client Name</Label>
                    <Input
                      type="text"
                      id="clientName"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientRegNumber" className="text-sm font-medium text-neutral-500 mb-1">Registration Number</Label>
                    <Input
                      type="text"
                      id="clientRegNumber"
                      name="clientRegNumber"
                      value={formData.clientRegNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientVatNumber" className="text-sm font-medium text-neutral-500 mb-1">VAT Number</Label>
                    <Input
                      type="text"
                      id="clientVatNumber"
                      name="clientVatNumber"
                      value={formData.clientVatNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-lg font-medium mb-4 pb-2 border-b border-neutral-200">Invoice Details</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="invoiceNumber" className="text-sm font-medium text-neutral-500 mb-1">Invoice Number</Label>
                    <Input
                      type="text"
                      id="invoiceNumber"
                      name="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoiceDate" className="text-sm font-medium text-neutral-500 mb-1">Invoice Date</Label>
                    <Input
                      type="date"
                      id="invoiceDate"
                      name="invoiceDate"
                      value={formData.invoiceDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dueDate" className="text-sm font-medium text-neutral-500 mb-1">Due Date</Label>
                    <Input
                      type="date"
                      id="dueDate"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4 pb-2 border-b border-neutral-200">Bank Details</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bankName" className="text-sm font-medium text-neutral-500 mb-1">Bank Name</Label>
                    <Input
                      type="text"
                      id="bankName"
                      name="bankName"
                      value={formData.bankDetails?.bankName || ""}
                      onChange={handleBankDetailsChange}
                      placeholder="e.g. First National Bank"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountName" className="text-sm font-medium text-neutral-500 mb-1">Account Name</Label>
                    <Input
                      type="text"
                      id="accountName"
                      name="accountName"
                      value={formData.bankDetails?.accountName || ""}
                      onChange={handleBankDetailsChange}
                      placeholder="Account holder name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber" className="text-sm font-medium text-neutral-500 mb-1">Account Number</Label>
                    <Input
                      type="text"
                      id="accountNumber"
                      name="accountNumber"
                      value={formData.bankDetails?.accountNumber || ""}
                      onChange={handleBankDetailsChange}
                      placeholder="Account number"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="sortCode" className="text-sm font-medium text-neutral-500 mb-1">Sort Code / Branch Code</Label>
                      <Input
                        type="text"
                        id="sortCode"
                        name="sortCode"
                        value={formData.bankDetails?.sortCode || ""}
                        onChange={handleBankDetailsChange}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="iban" className="text-sm font-medium text-neutral-500 mb-1">IBAN</Label>
                      <Input
                        type="text"
                        id="iban"
                        name="iban"
                        value={formData.bankDetails?.iban || ""}
                        onChange={handleBankDetailsChange}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="swiftCode" className="text-sm font-medium text-neutral-500 mb-1">SWIFT Code</Label>
                    <Input
                      type="text"
                      id="swiftCode"
                      name="swiftCode"
                      value={formData.bankDetails?.swiftCode || ""}
                      onChange={handleBankDetailsChange}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Line Items */}
            <div className="mt-6">
              <div className="flex items-center mb-4 pb-2 border-b border-primary/20">
                <FileText className="mr-2 h-5 w-5 text-secondary" />
                <h3 className="text-lg font-medium">Invoice Items</h3>
              </div>
              <div className="space-y-4">
                {formData.lineItems.map((item, index) => (
                  <LineItem
                    key={index}
                    index={index}
                    item={item}
                    onChange={handleLineItemChange}
                    onDelete={() => removeLineItem(index)}
                    canDelete={formData.lineItems.length > 1}
                  />
                ))}
              </div>
              
              <Button
                type="button"
                variant="ghost"
                onClick={addLineItem}
                className="mt-4 text-primary hover:bg-primary/10 font-medium py-2 px-4 h-auto rounded-md"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Line Item
              </Button>
            </div>
            
            {/* Totals */}
            <div className="mt-6 bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-lg border border-primary/10">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-right font-medium text-secondary">Subtotal:</div>
                <div className="text-right font-medium">{formatCurrency(formData.subtotal)}</div>
                
                <div className="text-right font-medium text-secondary">VAT (15%):</div>
                <div className="text-right font-medium">{formatCurrency(formData.vat)}</div>
                
                <div className="text-right text-lg font-semibold text-primary">TOTAL:</div>
                <div className="text-right text-lg font-semibold">{formatCurrency(formData.total)}</div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-end space-x-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                className="border-secondary text-secondary hover:bg-secondary/10"
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview Invoice
              </Button>
              <Button 
                type="submit"
                disabled={mutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                <FileOutput className="mr-2 h-4 w-4" />
                {mutation.isPending ? "Saving..." : "Save Invoice"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {isPreviewOpen && (
        <InvoicePreview
          invoice={formData}
          onClose={() => setIsPreviewOpen(false)}
          onSave={handleSubmit}
        />
      )}
    </>
  );
};

export default InvoiceForm;
