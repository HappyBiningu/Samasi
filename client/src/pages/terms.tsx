import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import logoPath from "@assets/logo.png";

export default function Terms() {
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
              <CardTitle className="text-3xl">Terms of Service</CardTitle>
            </div>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. About Samasi</h2>
              <p className="text-gray-700 leading-relaxed">
                Samasi is a professional services firm based in Johannesburg, South Africa, providing comprehensive 
                financial advisory, tax, audit, and accounting services. We are registered auditors and tax practitioners 
                committed to delivering excellence in commercial and residential services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Invoice Management System Usage</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                This invoice management system is provided for authorized users of Samasi's services. By accessing 
                and using this system, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Use the system only for legitimate business purposes</li>
                <li>Maintain the confidentiality of your login credentials</li>
                <li>Ensure accuracy of all invoice data entered</li>
                <li>Comply with applicable tax and accounting regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Professional Services</h2>
              <p className="text-gray-700 leading-relaxed">
                Samasi provides the following professional services subject to separate engagement agreements:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Advisory and consulting services</li>
                <li>Tax preparation and planning</li>
                <li>External audit and independent reviews</li>
                <li>Annual Financial Statements preparation</li>
                <li>Company secretarial services</li>
                <li>Risk management consulting</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                While we strive for accuracy in all our services, Samasi's liability is limited to the scope 
                defined in individual service agreements. Users are responsible for verifying the accuracy 
                of generated invoices and maintaining proper backup records.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Contact Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Samasi Professional Services</strong><br />
                  Location: Johannesburg, South Africa<br />
                  Email: info@samasi.co.za<br />
                  Website: <a href="https://samasi.co.za" className="text-primary hover:underline">www.samasi.co.za</a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Modifications</h2>
              <p className="text-gray-700 leading-relaxed">
                Samasi reserves the right to modify these terms at any time. Continued use of the system 
                constitutes acceptance of any changes to these terms.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}