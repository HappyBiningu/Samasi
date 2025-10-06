import { formatCurrency, formatDate } from "@/lib/utils";
import logoPath from "@assets/logo.png";
import { useQuery } from "@tanstack/react-query";
import { Company } from "@shared/schema";

interface InvoiceTemplateProps {
  invoice: any;
}

const InvoiceTemplate = ({ invoice }: InvoiceTemplateProps) => {
  // Fetch company data if this is an external invoice
  const { data: company } = useQuery<Company>({
    queryKey: [`/api/companies/${invoice.companyId}`],
    enabled: invoice.invoiceType === "external" && !!invoice.companyId,
  });

  // Determine which company info to show
  const isExternal = invoice.invoiceType === "external" && company;
  const companyInfo = isExternal ? {
    name: company.name,
    address: company.address,
    regNumber: company.registrationNumber,
    vatNumber: company.vatNumber,
    logoUrl: company.logoPath ? `/uploads/logos/${company.logoPath.split('/').pop()}` : logoPath
  } : {
    name: "Samasi",
    address: "360 Rivonia Boulevard, Edenburg, 2192",
    regNumber: "2017/374222/21",
    vatNumber: "4650278411",
    logoUrl: logoPath
  };

  return (
    <div id="invoice-template" className="border border-neutral-300 p-8 bg-white font-sans">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-1">Invoice</h2>
          <p>{companyInfo.address}</p>
          <p>Registration Number: {companyInfo.regNumber}</p>
          <p>VAT No: {companyInfo.vatNumber}</p>
        </div>
        <div>
          {/* Company logo */}
          <img src={companyInfo.logoUrl} alt={`${companyInfo.name} Logo`} className="h-20 w-auto" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="font-bold mb-2">BILL TO</h3>
          <p>{invoice.clientName}</p>
          <p>Registration Number: {invoice.clientRegNumber}</p>
          <p>VAT No: {invoice.clientVatNumber}</p>
          <p>Address: {invoice.clientAddress}</p>
        </div>
        <div className="text-right">
          <p>
            <span className="inline-block w-32 font-bold">INVOICE #</span>
            <span>{invoice.invoiceNumber}</span>
          </p>
          <p>
            <span className="inline-block w-32 font-bold">INVOICE DATE</span>
            <span>{formatDate(invoice.invoiceDate)}</span>
          </p>
        </div>
      </div>
      
      <div className="mb-12">
        <div className="grid grid-cols-12 border-b-2 border-neutral-800 pb-2 mb-4">
          <div className="col-span-8 font-bold">DESCRIPTION</div>
          <div className="col-span-4 text-right font-bold">AMOUNT</div>
        </div>
        
        <div>
          {invoice.lineItems.map((item: any, index: number) => (
            <div key={index} className="grid grid-cols-12 py-2">
              <div className="col-span-8">{item.description}</div>
              <div className="col-span-4 text-right">
                {item.amount.toLocaleString('en-ZA', { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-12 pt-4 mt-4">
          <div className="col-span-8 text-right font-bold">Subtotal</div>
          <div className="col-span-4 text-right font-bold">
            {invoice.subtotal.toLocaleString('en-ZA', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })}
          </div>
        </div>
        
        <div className="grid grid-cols-12 py-2">
          <div className="col-span-8 text-right font-bold">15.0%</div>
          <div className="col-span-4 text-right font-bold">
            {invoice.vat.toLocaleString('en-ZA', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })}
          </div>
        </div>
        
        <div className="grid grid-cols-12 pt-4 mt-4 border-t-2 border-neutral-800">
          <div className="col-span-8 text-right font-bold text-lg">TOTAL</div>
          <div className="col-span-4 text-right font-bold text-lg">
            R{invoice.total.toLocaleString('en-ZA', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })}
          </div>
        </div>
      </div>
      
      <div className="text-center mb-6">
        <p className="font-bold">Thank you</p>
      </div>
      
      {invoice.bankDetails && (
        <div className="text-center mb-6">
          <h3 className="font-bold mb-2">Banking Details</h3>
          {invoice.bankDetails.bankName && <p>Bank: {invoice.bankDetails.bankName}</p>}
          {invoice.bankDetails.accountName && <p>Account Name: {invoice.bankDetails.accountName}</p>}
          {invoice.bankDetails.accountNumber && <p>Account Number: {invoice.bankDetails.accountNumber}</p>}
          {invoice.bankDetails.sortCode && <p>Sort Code: {invoice.bankDetails.sortCode}</p>}
          {invoice.bankDetails.iban && <p>IBAN: {invoice.bankDetails.iban}</p>}
          {invoice.bankDetails.swiftCode && <p>SWIFT Code: {invoice.bankDetails.swiftCode}</p>}
        </div>
      )}

      <div className="text-center mt-8 mb-6">
        <h3 className="font-bold mb-2">Terms & Conditions</h3>
      </div>
      
      <div className="text-right text-sm text-neutral-500 mt-8">
        Powered by Samasi
      </div>
    </div>
  );
};

export default InvoiceTemplate;
