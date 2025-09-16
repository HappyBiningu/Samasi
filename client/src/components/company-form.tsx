import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileImage, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface Company {
  id: number;
  name: string;
  address: string;
  registrationNumber: string;
  vatNumber: string;
  logoPath?: string;
  createdAt: Date;
}

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  vatNumber: z.string().min(1, "VAT number is required"),
});

interface CompanyFormProps {
  company?: Company | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const apiRequest = async (method: string, url: string, data?: any) => {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("logo", file);

  const response = await fetch("/api/upload/logo", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed! status: ${response.status}`);
  }

  return response.json();
};

const CompanyForm = ({ company, onSuccess, onCancel }: CompanyFormProps) => {
  const [formData, setFormData] = useState({
    name: company?.name || "",
    address: company?.address || "",
    registrationNumber: company?.registrationNumber || "",
    vatNumber: company?.vatNumber || "",
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(company?.logoPath || null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // Upload logo if a new file was selected
      let logoPath = logoPreview;
      if (logoFile) {
        const uploadResult = await uploadFile(logoFile);
        logoPath = uploadResult.filePath;
      }

      const companyData = { ...data, logoPath };

      if (company) {
        return apiRequest("PUT", `/api/companies/${company.id}`, companyData);
      } else {
        return apiRequest("POST", "/api/companies", companyData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: company ? "Company updated" : "Company created",
        description: company 
          ? "The company has been successfully updated" 
          : "The company has been successfully created",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${company ? "update" : "create"} company: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a PNG or JPEG file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setLogoFile(null);
    setLogoPreview(company?.logoPath || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    try {
      companySchema.parse(formData);
      setErrors({});
      mutation.mutate(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo Upload */}
      <div>
        <Label className="text-sm font-medium">Company Logo</Label>
        <div className="mt-2">
          {logoPreview ? (
            <div className="relative inline-block">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-24 h-24 rounded-lg object-cover border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={clearLogo}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Card className="w-24 h-24 border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center justify-center h-full p-0">
                <div className="text-center">
                  <FileImage className="h-8 w-8 text-muted-foreground mx-auto mb-1" />
                </div>
              </CardContent>
            </Card>
          )}
          <div className="mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              {logoPreview ? "Change Logo" : "Upload Logo"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="registrationNumber">Registration Number *</Label>
          <Input
            id="registrationNumber"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleInputChange}
            className={errors.registrationNumber ? "border-destructive" : ""}
          />
          {errors.registrationNumber && (
            <p className="text-sm text-destructive mt-1">{errors.registrationNumber}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          name="address"
          rows={3}
          value={formData.address}
          onChange={handleInputChange}
          className={errors.address ? "border-destructive" : ""}
        />
        {errors.address && (
          <p className="text-sm text-destructive mt-1">{errors.address}</p>
        )}
      </div>

      <div>
        <Label htmlFor="vatNumber">VAT Number *</Label>
        <Input
          id="vatNumber"
          name="vatNumber"
          value={formData.vatNumber}
          onChange={handleInputChange}
          className={errors.vatNumber ? "border-destructive" : ""}
        />
        {errors.vatNumber && (
          <p className="text-sm text-destructive mt-1">{errors.vatNumber}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending 
            ? (company ? "Updating..." : "Creating...") 
            : (company ? "Update Company" : "Create Company")
          }
        </Button>
      </div>
    </form>
  );
};

export default CompanyForm;