import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInvoiceSchema, type InsertInvoice } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Get all invoices
  app.get("/api/invoices", async (req: Request, res: Response) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Get a specific invoice
  app.get("/api/invoices/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }

      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  // Create a new invoice
  app.post("/api/invoices", async (req: Request, res: Response) => {
    try {
      const parseResult = insertInvoiceSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const newInvoice = await storage.createInvoice(parseResult.data);
      res.status(201).json(newInvoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // Update an invoice
  app.put("/api/invoices/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }

      // Partial validation is fine for updates
      const parseResult = insertInvoiceSchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const updatedInvoice = await storage.updateInvoice(id, parseResult.data);
      if (!updatedInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.json(updatedInvoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  // Delete an invoice
  app.delete("/api/invoices/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }

      const success = await storage.deleteInvoice(id);
      if (!success) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/overview", async (req: Request, res: Response) => {
    try {
      const invoices = await storage.getAllInvoices();
      
      const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
      const totalInvoices = invoices.length;
      const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
      const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid').length;
      const overdueInvoices = invoices.filter(inv => {
        if (!inv.dueDate) return false;
        return new Date(inv.dueDate) < new Date() && inv.status !== 'paid';
      }).length;
      
      const averageInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
      const paymentRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
      
      res.json({
        totalRevenue,
        totalInvoices,
        paidInvoices,
        unpaidInvoices,
        overdueInvoices,
        averageInvoiceValue,
        paymentRate
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics overview" });
    }
  });

  app.get("/api/analytics/revenue-by-month", async (req: Request, res: Response) => {
    try {
      const invoices = await storage.getAllInvoices();
      
      const revenueByMonth = invoices.reduce((acc: Record<string, number>, invoice) => {
        const date = new Date(invoice.invoiceDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[monthKey]) {
          acc[monthKey] = 0;
        }
        
        if (invoice.status === 'paid') {
          acc[monthKey] += invoice.total;
        }
        
        return acc;
      }, {});
      
      const chartData = Object.entries(revenueByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, revenue]) => ({
          month,
          revenue
        }));
      
      res.json(chartData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch revenue by month" });
    }
  });

  app.get("/api/analytics/status-breakdown", async (req: Request, res: Response) => {
    try {
      const invoices = await storage.getAllInvoices();
      
      const statusCounts = invoices.reduce((acc: Record<string, number>, invoice) => {
        const status = invoice.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      const chartData = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        value: count
      }));
      
      res.json(chartData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch status breakdown" });
    }
  });

  app.get("/api/analytics/invoice-timeline", async (req: Request, res: Response) => {
    try {
      const invoices = await storage.getAllInvoices();
      
      const timelineData = invoices.map(invoice => ({
        date: invoice.invoiceDate,
        amount: invoice.total,
        status: invoice.status,
        clientName: invoice.clientName,
        invoiceNumber: invoice.invoiceNumber
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      res.json(timelineData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice timeline" });
    }
  });

  app.get("/api/analytics/client-performance", async (req: Request, res: Response) => {
    try {
      const invoices = await storage.getAllInvoices();
      
      const clientStats = invoices.reduce((acc: Record<string, any>, invoice) => {
        const client = invoice.clientName;
        if (!acc[client]) {
          acc[client] = {
            clientName: client,
            totalAmount: 0,
            invoiceCount: 0,
            paidAmount: 0,
            paidCount: 0
          };
        }
        
        acc[client].totalAmount += invoice.total;
        acc[client].invoiceCount += 1;
        
        if (invoice.status === 'paid') {
          acc[client].paidAmount += invoice.total;
          acc[client].paidCount += 1;
        }
        
        return acc;
      }, {});
      
      const chartData = Object.values(clientStats).map((client: any) => ({
        ...client,
        averageInvoice: client.invoiceCount > 0 ? client.totalAmount / client.invoiceCount : 0,
        paymentRate: client.invoiceCount > 0 ? (client.paidCount / client.invoiceCount) * 100 : 0
      }));
      
      res.json(chartData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client performance" });
    }
  });

  app.get("/api/analytics/amount-distribution", async (req: Request, res: Response) => {
    try {
      const invoices = await storage.getAllInvoices();
      
      // Create amount ranges for distribution
      const ranges = [
        { min: 0, max: 1000, label: 'R0 - R1,000' },
        { min: 1000, max: 5000, label: 'R1,000 - R5,000' },
        { min: 5000, max: 10000, label: 'R5,000 - R10,000' },
        { min: 10000, max: 50000, label: 'R10,000 - R50,000' },
        { min: 50000, max: Infinity, label: 'R50,000+' }
      ];
      
      const distribution = ranges.map(range => {
        const count = invoices.filter(invoice => 
          invoice.total >= range.min && invoice.total < range.max
        ).length;
        
        return {
          range: range.label,
          count,
          value: count
        };
      }).filter(item => item.count > 0);
      
      res.json(distribution);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch amount distribution" });
    }
  });

  // CSV Export endpoints
  app.get("/api/export/invoices.csv", async (req: Request, res: Response) => {
    try {
      const invoices = await storage.getAllInvoices();
      
      // Create CSV headers
      const headers = [
        'Invoice Number',
        'Invoice Date',
        'Client Name',
        'Client Reg Number',
        'Client VAT Number',
        'Subtotal (R)',
        'VAT (R)',
        'Total (R)',
        'Status',
        'Due Date',
        'Reminder Count',
        'Last Reminder Sent',
        'Created At',
        'Line Items',
        'Bank Name',
        'Account Name',
        'Account Number',
        'Sort Code',
        'IBAN',
        'Swift Code'
      ];
      
      // Convert invoices to CSV rows
      const csvRows = invoices.map(invoice => [
        invoice.invoiceNumber,
        invoice.invoiceDate,
        invoice.clientName,
        invoice.clientRegNumber,
        invoice.clientVatNumber,
        invoice.subtotal,
        invoice.vat,
        invoice.total,
        invoice.status,
        invoice.dueDate || '',
        invoice.reminderCount,
        invoice.lastReminderSent || '',
        invoice.createdAt,
        JSON.stringify(invoice.lineItems),
        invoice.bankDetails?.bankName || '',
        invoice.bankDetails?.accountName || '',
        invoice.bankDetails?.accountNumber || '',
        invoice.bankDetails?.sortCode || '',
        invoice.bankDetails?.iban || '',
        invoice.bankDetails?.swiftCode || ''
      ]);
      
      // Combine headers and rows
      const csvContent = [headers, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="invoices.csv"');
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to export invoices" });
    }
  });

  app.get("/api/export/analytics.csv", async (req: Request, res: Response) => {
    try {
      const invoices = await storage.getAllInvoices();
      
      // Create analytics summary CSV
      const analytics = {
        totalRevenue: invoices.reduce((sum, inv) => sum + inv.total, 0),
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
        unpaidInvoices: invoices.filter(inv => inv.status === 'unpaid').length,
        averageInvoiceValue: invoices.length > 0 ? invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length : 0,
        paymentRate: invoices.length > 0 ? (invoices.filter(inv => inv.status === 'paid').length / invoices.length) * 100 : 0
      };
      
      const headers = ['Metric', 'Value'];
      const csvRows = [
        ['Total Revenue (R)', analytics.totalRevenue],
        ['Total Invoices', analytics.totalInvoices],
        ['Paid Invoices', analytics.paidInvoices],
        ['Unpaid Invoices', analytics.unpaidInvoices],
        ['Average Invoice Value (R)', analytics.averageInvoiceValue.toFixed(2)],
        ['Payment Rate (%)', analytics.paymentRate.toFixed(1)]
      ];
      
      const csvContent = [headers, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics_summary.csv"');
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to export analytics" });
    }
  });

  app.get("/api/export/clients.csv", async (req: Request, res: Response) => {
    try {
      const invoices = await storage.getAllInvoices();
      
      // Group by clients
      const clientStats = invoices.reduce((acc: Record<string, any>, invoice) => {
        const client = invoice.clientName;
        if (!acc[client]) {
          acc[client] = {
            clientName: client,
            clientRegNumber: invoice.clientRegNumber,
            clientVatNumber: invoice.clientVatNumber,
            totalAmount: 0,
            invoiceCount: 0,
            paidAmount: 0,
            paidCount: 0,
            lastInvoiceDate: invoice.invoiceDate
          };
        }
        
        acc[client].totalAmount += invoice.total;
        acc[client].invoiceCount += 1;
        
        if (invoice.status === 'paid') {
          acc[client].paidAmount += invoice.total;
          acc[client].paidCount += 1;
        }
        
        // Update last invoice date if newer
        if (new Date(invoice.invoiceDate) > new Date(acc[client].lastInvoiceDate)) {
          acc[client].lastInvoiceDate = invoice.invoiceDate;
        }
        
        return acc;
      }, {});
      
      const headers = [
        'Client Name',
        'Registration Number',
        'VAT Number',
        'Total Amount (R)',
        'Invoice Count',
        'Paid Amount (R)',
        'Paid Count',
        'Payment Rate (%)',
        'Average Invoice (R)',
        'Last Invoice Date'
      ];
      
      const csvRows = Object.values(clientStats).map((client: any) => [
        client.clientName,
        client.clientRegNumber,
        client.clientVatNumber,
        client.totalAmount,
        client.invoiceCount,
        client.paidAmount,
        client.paidCount,
        client.invoiceCount > 0 ? ((client.paidCount / client.invoiceCount) * 100).toFixed(1) : '0',
        client.invoiceCount > 0 ? (client.totalAmount / client.invoiceCount).toFixed(2) : '0',
        client.lastInvoiceDate
      ]);
      
      const csvContent = [headers, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="clients_summary.csv"');
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to export client data" });
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
