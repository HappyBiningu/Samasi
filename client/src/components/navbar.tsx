import { Link, useLocation } from "wouter";
import { Building } from "lucide-react";

const Navbar = () => {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <div className="h-10 w-10 bg-primary rounded-md flex items-center justify-center text-white font-bold">
              <Building size={24} />
            </div>
            <h1 className="ml-3 text-xl font-semibold text-secondary">Invoice Generator</h1>
          </div>
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/new-invoice">
                <a className={`${location === "/new-invoice" ? "text-primary" : "text-neutral-500 hover:text-primary"} font-medium`}>
                  New Invoice
                </a>
              </Link>
            </li>
            <li>
              <Link href="/invoices">
                <a className={`${location === "/invoices" ? "text-primary" : "text-neutral-500 hover:text-primary"} font-medium`}>
                  My Invoices
                </a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
