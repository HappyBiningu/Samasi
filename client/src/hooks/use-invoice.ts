import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Invoice, LineItem } from "@shared/schema";
import { calculateInvoiceTotals } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function useInvoice(id?: number) {
  const { toast } = useToast();
  const isEditing = !!id;

  const initialLineItems: LineItem[] = [
    { description: "", amount: 0 },
  ];

  const [formData, setFormData] = useState<Partial<Invoice>>({
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
  });

  // Fetch invoice data if editing
  const { data: invoiceData, isLoading } = useQuery<Invoice>({
    queryKey: [isEditing ? `/api/invoices/${id}` : ""],
    enabled: isEditing,
  });

  // Set form data from fetched invoice
  useState(() => {
    if (invoiceData) {
      setFormData(invoiceData);
    }
  });

  // Create/Update invoice mutation
  const mutation = useMutation({
    mutationFn: async (data: Partial<Invoice>) => {
      if (isEditing && id) {
        return apiRequest("PUT", `/api/invoices/${id}`, data);
      } else {
        return apiRequest("POST", "/api/invoices", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      if (isEditing && id) {
        queryClient.invalidateQueries({ queryKey: [`/api/invoices/${id}`] });
      }
      toast({
        title: isEditing ? "Invoice updated" : "Invoice created",
        description: isEditing 
          ? "The invoice has been successfully updated" 
          : "The invoice has been successfully created",
      });
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

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    setFormData((prev) => {
      if (!prev.lineItems) return prev;
      
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
      lineItems: [...(prev.lineItems || []), { description: "", amount: 0 }],
    }));
  };

  const removeLineItem = (index: number) => {
    if (!formData.lineItems || formData.lineItems.length <= 1) {
      return; // Keep at least one line item
    }
    
    setFormData((prev) => {
      if (!prev.lineItems) return prev;
      
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

  return {
    formData,
    setFormData,
    isLoading,
    isEditing,
    mutation,
    handleInputChange,
    handleLineItemChange,
    addLineItem,
    removeLineItem
  };
}
