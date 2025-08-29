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

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
