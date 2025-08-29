import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Mail, Phone, MapPin, Clock, HelpCircle, FileText, Users } from "lucide-react";
import logoPath from "@assets/logo.png";

export default function Support() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <img src={logoPath} alt="Samasi Logo" className="h-12 w-auto mr-4" />
              <CardTitle className="text-3xl">Support Center</CardTitle>
            </div>
            <p className="text-gray-600">We're here to help with all your professional service needs</p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <section>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center p-6">
                  <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Email Support</h3>
                  <p className="text-sm text-gray-600 mb-3">Get help via email</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="mailto:info@samasi.co.za">info@samasi.co.za</a>
                  </Button>
                </Card>
                
                <Card className="text-center p-6">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Visit Our Office</h3>
                  <p className="text-sm text-gray-600 mb-3">Johannesburg, South Africa</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://samasi.co.za" target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Button>
                </Card>
                
                <Card className="text-center p-6">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Business Hours</h3>
                  <p className="text-sm text-gray-600 mb-3">Monday - Friday</p>
                  <p className="text-xs text-gray-500">8:00 AM - 5:00 PM SAST</p>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <HelpCircle className="h-6 w-6 text-primary mr-2" />
                Our Professional Services
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Financial Services</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <FileText className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                      <span>Advisory and consulting services</span>
                    </li>
                    <li className="flex items-start">
                      <FileText className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                      <span>Tax preparation and planning</span>
                    </li>
                    <li className="flex items-start">
                      <FileText className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                      <span>External audit and independent reviews</span>
                    </li>
                    <li className="flex items-start">
                      <FileText className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                      <span>Annual Financial Statements preparation</span>
                    </li>
                    <li className="flex items-start">
                      <FileText className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                      <span>Company secretarial services</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Additional Services</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <Users className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                      <span>Risk management consulting</span>
                    </li>
                    <li className="flex items-start">
                      <Users className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                      <span>Public sector services</span>
                    </li>
                    <li className="flex items-start">
                      <Users className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                      <span>IFRS training and development</span>
                    </li>
                    <li className="flex items-start">
                      <Users className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                      <span>Accounting packages training</span>
                    </li>
                    <li className="flex items-start">
                      <Users className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                      <span>Construction & project management</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Invoice System Support</h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3">Common Questions</h3>
                <div className="space-y-3">
                  <details className="cursor-pointer">
                    <summary className="font-medium text-gray-800 hover:text-primary">
                      How do I create a new invoice?
                    </summary>
                    <p className="mt-2 text-gray-600 text-sm">
                      Click "New Invoice" from the dashboard, fill in client details, add line items, 
                      and save. The system will automatically calculate VAT and totals.
                    </p>
                  </details>
                  
                  <details className="cursor-pointer">
                    <summary className="font-medium text-gray-800 hover:text-primary">
                      Can I customize the invoice template?
                    </summary>
                    <p className="mt-2 text-gray-600 text-sm">
                      The invoice template includes Samasi branding. For customization requests, 
                      please contact our support team.
                    </p>
                  </details>
                  
                  <details className="cursor-pointer">
                    <summary className="font-medium text-gray-800 hover:text-primary">
                      How do I export invoices to PDF?
                    </summary>
                    <p className="mt-2 text-gray-600 text-sm">
                      View any invoice and click the "Download PDF" button to generate a 
                      professional PDF version for sending to clients.
                    </p>
                  </details>
                </div>
              </div>
            </section>

            <section className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Need Additional Help?</h2>
              <p className="text-gray-600 mb-6">
                Our team of registered auditors and tax practitioners is ready to assist with 
                all your professional service needs.
              </p>
              <Button size="lg" asChild>
                <a href="mailto:info@samasi.co.za?subject=Support Request">
                  Contact Our Team
                </a>
              </Button>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}