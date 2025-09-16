import { useQuery } from "@tanstack/react-query";
import { Invoice } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { FileText, PieChart, Eye, Receipt, FileOutput, Building } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import logoPath from "@assets/logo.png";

const Home = () => {
  const [, navigate] = useLocation();

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const recentInvoices = invoices?.slice(0, 3) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        {/* Welcome card with logo */}
        <Card className="mb-8 overflow-hidden border-primary/20">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
            <div className="flex items-center mb-4">
              <img src={logoPath} alt="Samasi Logo" className="h-12 w-auto mr-4" />
              <h2 className="text-2xl font-bold">Samasi Invoice Generator</h2>
            </div>
            <p className="text-neutral-700 mb-6">Generate professional invoices for your clients with the Samasi branded template.</p>
            <div className="flex space-x-4">
              <Button 
                onClick={() => navigate("/new-invoice")}
                className="bg-primary hover:bg-primary/90"
              >
                <FileOutput className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
              <Button 
                onClick={() => navigate("/invoices")} 
                variant="secondary"
              >
                <Receipt className="mr-2 h-4 w-4" />
                View Invoices
              </Button>
            </div>
          </div>
        </Card>

        {/* Features card */}
        <Card className="overflow-hidden border-secondary/20">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-secondary" />
              Key Features
            </h2>
            <ul className="space-y-3 text-neutral-700">
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-primary text-xs">✓</span>
                </div>
                <span>Professional branded invoices with your company logo</span>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-primary text-xs">✓</span>
                </div>
                <span>Automatic VAT calculation at 15%</span>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-secondary text-xs">✓</span>
                </div>
                <span>Downloadable PDF invoices for your records</span>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-secondary text-xs">✓</span>
                </div>
                <span>Manage and track all your client invoices in one place</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="mb-8 border-primary/20 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-4 border-b border-primary/10">
            <h2 className="text-xl font-semibold flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Recent Invoices
            </h2>
          </div>
          <CardContent className="p-6">
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
                    className="border border-neutral-200 rounded-lg p-4 flex justify-between items-center hover:bg-neutral-50 hover:border-primary/30 cursor-pointer transition group"
                    onClick={() => navigate(`/edit-invoice/${invoice.id}`)}
                  >
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">{invoice.clientName}</p>
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
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-secondary">No invoices yet</h3>
                <p className="mt-1 text-sm text-neutral-500">Get started by creating a new invoice.</p>
                <div className="mt-6">
                  <Button 
                    onClick={() => navigate("/new-invoice")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <FileOutput className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PDF Export Card */}
        <Card className="overflow-hidden border-secondary/20">
          <div className="bg-gradient-to-r from-secondary/5 to-secondary/10 px-6 py-4 border-b border-secondary/10">
            <h2 className="text-xl font-semibold flex items-center">
              <Receipt className="mr-2 h-5 w-5 text-secondary" />
              PDF Exports
            </h2>
          </div>
          <CardContent className="p-6">
            <p className="text-neutral-700 mb-4">All invoices can be exported as professional PDF documents that match your company's branding.</p>
            <ul className="space-y-2 text-neutral-700 mb-6">
              <li className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-secondary mr-2"></div>
                <span>Professional formatting</span>
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-secondary mr-2"></div>
                <span>Includes your company logo</span>
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-secondary mr-2"></div>
                <span>Print-ready quality</span>
              </li>
            </ul>
            <Button 
              variant="outline" 
              className="border-secondary text-secondary hover:bg-secondary/10 w-full justify-center"
              onClick={() => navigate("/invoices")} 
            >
              View All Invoices <Eye className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;