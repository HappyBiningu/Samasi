import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Shield, Lock, Eye } from "lucide-react";
import logoPath from "@assets/logo.png";

export default function Privacy() {
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
              <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            </div>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <section>
              <div className="flex items-center mb-3">
                <Shield className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-semibold">1. Our Commitment to Privacy</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Samasi is committed to protecting your privacy and maintaining the confidentiality of your 
                personal and business information. As registered auditors and tax practitioners, we adhere 
                to strict professional standards and regulatory requirements for data protection.
              </p>
            </section>

            <section>
              <div className="flex items-center mb-3">
                <Eye className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-semibold">2. Information We Collect</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-3">
                Through our invoice management system and professional services, we may collect:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Contact information (name, email, phone, address)</li>
                <li>Business and financial information for professional services</li>
                <li>Invoice and transaction data</li>
                <li>System usage and authentication logs</li>
                <li>Communications related to our services</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center mb-3">
                <Lock className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-semibold">3. How We Protect Your Information</h2>
              </div>
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  We implement industry-standard security measures to protect your information:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Technical Safeguards</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Encrypted data transmission</li>
                      <li>• Secure authentication systems</li>
                      <li>• Regular security audits</li>
                      <li>• Access controls and monitoring</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Professional Standards</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• POPIA compliance</li>
                      <li>• Professional confidentiality</li>
                      <li>• Limited access protocols</li>
                      <li>• Secure data retention</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Your information is used solely for legitimate business purposes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Providing professional accounting, audit, and tax services</li>
                <li>Generating and managing invoices</li>
                <li>Maintaining accurate financial records</li>
                <li>Complying with regulatory and legal requirements</li>
                <li>Communicating about our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Information Sharing</h2>
              <p className="text-gray-700 leading-relaxed">
                We do not sell, trade, or rent your personal information. We may share information only:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>With your explicit consent</li>
                <li>As required by law or regulatory authorities</li>
                <li>To authorized third parties providing services on our behalf</li>
                <li>In connection with professional obligations and standards</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                Under South African privacy legislation (POPIA), you have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of personal information (subject to legal requirements)</li>
                <li>Object to processing in certain circumstances</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Contact Us</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  For privacy-related inquiries or to exercise your rights:
                </p>
                <p className="text-gray-700">
                  <strong>Samasi Professional Services</strong><br />
                  Email: info@samasi.co.za<br />
                  Subject: Privacy Inquiry<br />
                  Location: Johannesburg, South Africa
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}