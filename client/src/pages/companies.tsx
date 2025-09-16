import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, Edit, Trash2, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CompanyForm from "@/components/company-form";

interface Company {
  id: number;
  name: string;
  address: string;
  registrationNumber: string;
  vatNumber: string;
  logoPath?: string;
  createdAt: Date;
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

  return method === "DELETE" ? null : response.json();
};

const Companies = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch companies
  const { data: companies, isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    queryFn: () => apiRequest("GET", "/api/companies"),
  });

  // Delete company mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/companies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Company deleted",
        description: "The company has been successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete company: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this company?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingCompany(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading companies...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">External Companies</h1>
          <p className="text-muted-foreground">Manage companies for external invoicing</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCompany(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCompany ? "Edit Company" : "Add New Company"}
              </DialogTitle>
            </DialogHeader>
            <CompanyForm
              company={editingCompany}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {!companies || companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No companies found</h3>
            <p className="text-muted-foreground mb-4">
              Add your first external company to start creating invoices for other businesses.
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    {company.logoPath ? (
                      <img
                        src={company.logoPath}
                        alt={`${company.name} logo`}
                        className="w-12 h-12 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <FileImage className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        External
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(company)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(company.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Address:</span>
                    <p className="text-muted-foreground">{company.address}</p>
                  </div>
                  <div>
                    <span className="font-medium">Reg Number:</span>
                    <span className="text-muted-foreground ml-2">
                      {company.registrationNumber}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">VAT Number:</span>
                    <span className="text-muted-foreground ml-2">
                      {company.vatNumber}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Companies;