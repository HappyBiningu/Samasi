import { useQuery } from "@tanstack/react-query";
import { Invoice } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { FileText, PieChart, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const Home = () => {
  const [, navigate] = useLocation();

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const recentInvoices = invoices?.slice(0, 3) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        {/* Professional working on finances */}
        <Card className="overflow-hidden mb-8">
          <div className="w-full h-48 bg-[url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400')] bg-cover bg-center"></div>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Create New Invoice</h2>
            <p className="text-neutral-500 mb-4">Generate professional invoices for your clients with our easy-to-use tool.</p>
            <Button 
              onClick={() => navigate("/new-invoice")}
              className="bg-primary hover:bg-primary/90"
            >
              Create Invoice
            </Button>
          </CardContent>
        </Card>
        
        {/* Business financial charts */}
        <Card className="overflow-hidden">
          <div className="w-full h-48 bg-[url('https://images.unsplash.com/photo-1543286386-713bdd548da4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400')] bg-cover bg-center"></div>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Track Your Finances</h2>
            <p className="text-neutral-500 mb-4">Keep all your invoices organized and easily accessible in one place.</p>
            <Button 
              onClick={() => navigate("/invoices")} 
              variant="secondary"
            >
              View Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-neutral-200 rounded-lg p-4 flex justify-between items-center animate-pulse">
                    <div className="space-y-2">
                      <div className="h-5 w-40 bg-neutral-200 rounded"></div>
                      <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-5 w-24 bg-neutral-200 rounded"></div>
                      <div className="h-4 w-20 bg-neutral-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentInvoices.length > 0 ? (
              <div className="space-y-4">
                {recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="border border-neutral-200 rounded-lg p-4 flex justify-between items-center hover:bg-neutral-100 cursor-pointer transition"
                    onClick={() => navigate(`/edit-invoice/${invoice.id}`)}
                  >
                    <div>
                      <p className="font-medium">{invoice.clientName}</p>
                      <p className="text-sm text-neutral-500">{invoice.invoiceDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(invoice.total)}</p>
                      <p className="text-sm text-neutral-500">Invoice #{invoice.invoiceNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-neutral-300" />
                <h3 className="mt-2 text-sm font-semibold text-secondary">No invoices yet</h3>
                <p className="mt-1 text-sm text-neutral-500">Get started by creating a new invoice.</p>
                <div className="mt-6">
                  <Button 
                    onClick={() => navigate("/new-invoice")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Create Invoice
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Professional invoice on desk */}
        <Card className="overflow-hidden">
          <div className="w-full h-48 bg-[url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400')] bg-cover bg-center"></div>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Export Options</h2>
            <p className="text-neutral-500 mb-4">Download invoices as PDF files that match your company's branding.</p>
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary hover:text-primary/90 font-medium flex items-center"
              onClick={() => navigate("/invoices")} 
            >
              Learn More <Eye className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
