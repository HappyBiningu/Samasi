import { formatCurrency, formatDate } from "@/lib/utils";
import logoPath from "@assets/logo.png";

interface InvoiceTemplateProps {
  invoice: any;
}

const InvoiceTemplate = ({ invoice }: InvoiceTemplateProps) => {
  return (
    <div id="invoice-template" className="border border-neutral-300 p-8 bg-white font-sans">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-1">Invoice</h2>
          <p>360 Rivonia Boulevard, Edenburg, 2192</p>
          <p>Registration Number: 2017/374222/21</p>
          <p>VAT No: 4650278411</p>
        </div>
        <div>
          {/* Company logo */}
          <img src={logoPath} alt="Samasi Logo" className="h-20 w-auto" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="font-bold mb-2">BILL TO</h3>
          <p>{invoice.clientName}</p>
          <p>Registration Number: {invoice.clientRegNumber}</p>
          <p>VAT No: {invoice.clientVatNumber}</p>
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
      
      <div className="text-center mb-6">
        <p>Bank: First National Bank(FNB)</p>
        <p>Account Number: 62417570993</p>
        <p>Branch Code: 250655</p>
      </div>

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
