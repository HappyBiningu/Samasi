import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInvoiceSchema, insertCompanySchema, type InsertInvoice, type InsertCompany } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { PaymentDelayPredictor, ClientRiskScorer, AnomalyDetector, ClientSegmentation } from "./ml-models";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { sendInvoiceEmail, testEmailConfiguration } from "./email";
import jsPDF from "jspdf";
import { z } from "zod";
export async function registerRoutes(app: Express): Promise<Server> {
  
  // Configure multer for file uploads
  const storage_multer = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/logos');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage: storage_multer,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['.png', '.jpg', '.jpeg'];
      const fileExt = path.extname(file.originalname).toLowerCase();
      
      if (allowedTypes.includes(fileExt)) {
        cb(null, true);
      } else {
        cb(new Error('Only PNG, JPG, and JPEG files are allowed'));
      }
    }
  });

  // Serve uploaded files statically
  app.use('/uploads', express.static('public/uploads'));
  
  // put application routes here
  // prefix all routes with /api

  // File upload endpoint
  app.post("/api/upload/logo", upload.single('logo'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filePath = `/uploads/logos/${req.file.filename}`;
      
      res.status(200).json({ 
        message: "File uploaded successfully",
        filePath: filePath,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

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

  // Company management endpoints
  // Get all companies
  app.get("/api/companies", async (req: Request, res: Response) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  // Get a specific company
  app.get("/api/companies/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  // Create a new company
  app.post("/api/companies", async (req: Request, res: Response) => {
    try {
      const parseResult = insertCompanySchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const newCompany = await storage.createCompany(parseResult.data);
      res.status(201).json(newCompany);
    } catch (error) {
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  // Update a company
  app.put("/api/companies/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      // Partial validation is fine for updates
      const parseResult = insertCompanySchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const updatedCompany = await storage.updateCompany(id, parseResult.data);
      if (!updatedCompany) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(updatedCompany);
    } catch (error) {
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  // Delete a company
  app.delete("/api/companies/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      // Check if any invoices are using this company
      const invoices = await storage.getAllInvoices();
      const hasInvoices = invoices.some(inv => inv.companyId === id);
      
      if (hasInvoices) {
        return res.status(400).json({ 
          message: "Cannot delete company as it has associated invoices. Please delete or reassign the invoices first." 
        });
      }

      const success = await storage.deleteCompany(id);
      if (!success) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete company" });
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

  // PDF Generation utility function
  async function generateInvoicePDF(invoice: any, companyName: string): Promise<Buffer> {
    const doc = new jsPDF();
    
    // Set font
    doc.setFont("helvetica");
    
    // Header
    doc.setFontSize(20);
    doc.text("INVOICE", 105, 30, { align: "center" });
    
    // Company info
    doc.setFontSize(12);
    doc.text(companyName, 20, 50);
    
    // Invoice details
    doc.setFontSize(10);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 20, 70);
    doc.text(`Invoice Date: ${invoice.invoiceDate}`, 20, 80);
    doc.text(`Due Date: ${invoice.dueDate || 'N/A'}`, 20, 90);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 120, 70);
    
    // Client details
    doc.setFontSize(12);
    doc.text("Bill To:", 20, 110);
    doc.setFontSize(10);
    doc.text(invoice.clientName, 20, 120);
    doc.text(`Reg Number: ${invoice.clientRegNumber}`, 20, 130);
    doc.text(`VAT Number: ${invoice.clientVatNumber}`, 20, 140);
    
    // Line items table
    let yPosition = 160;
    doc.setFontSize(10);
    doc.text("Description", 20, yPosition);
    doc.text("Amount", 150, yPosition);
    
    // Draw line under headers
    doc.line(20, yPosition + 2, 190, yPosition + 2);
    yPosition += 10;
    
    // Add line items
    invoice.lineItems.forEach((item: any) => {
      doc.text(item.description, 20, yPosition);
      doc.text(`R${(item.amount / 100).toFixed(2)}`, 150, yPosition);
      yPosition += 10;
    });
    
    // Totals
    yPosition += 10;
    doc.line(120, yPosition, 190, yPosition);
    yPosition += 10;
    
    doc.text(`Subtotal: R${(invoice.subtotal / 100).toFixed(2)}`, 120, yPosition);
    yPosition += 10;
    doc.text(`VAT: R${(invoice.vat / 100).toFixed(2)}`, 120, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`Total: R${(invoice.total / 100).toFixed(2)}`, 120, yPosition);
    
    // Bank details if available
    if (invoice.bankDetails) {
      yPosition += 20;
      doc.setFontSize(12);
      doc.text("Banking Details:", 20, yPosition);
      doc.setFontSize(10);
      yPosition += 10;
      doc.text(`Bank: ${invoice.bankDetails.bankName}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Account Name: ${invoice.bankDetails.accountName}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Account Number: ${invoice.bankDetails.accountNumber}`, 20, yPosition);
      if (invoice.bankDetails.sortCode) {
        yPosition += 8;
        doc.text(`Sort Code: ${invoice.bankDetails.sortCode}`, 20, yPosition);
      }
    }
    
    // Convert to buffer
    const pdfArrayBuffer = doc.output('arraybuffer');
    return Buffer.from(pdfArrayBuffer);
  }

  // Email functionality

  // Email configuration test endpoint
  app.get("/api/email/test", async (req: Request, res: Response) => {
    try {
      const isConfigured = await testEmailConfiguration();
      res.json({ 
        configured: isConfigured, 
        message: isConfigured ? "Email configuration is valid" : "Email configuration is incomplete" 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to test email configuration" });
    }
  });

  // Generate and send invoice via email
  app.post("/api/invoices/:id/send-email", async (req: Request, res: Response) => {
    try {
      console.log("📧 Email request received for invoice:", req.params.id);
      console.log("📧 Request body:", req.body);
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }

      // Validate request body
      const emailSchema = z.object({
        recipientEmail: z.string().email("Invalid email address"),
        message: z.string().optional()
      });

      const parseResult = emailSchema.safeParse(req.body);
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        console.error("📧 Email validation failed:", validationError.message);
        return res.status(400).json({ message: validationError.message });
      }

      const { recipientEmail, message } = parseResult.data;
      console.log("📧 Sending email to:", recipientEmail);

      // Get the invoice
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        console.error("📧 Invoice not found:", id);
        return res.status(404).json({ message: "Invoice not found" });
      }

      console.log("📧 Found invoice:", invoice.invoiceNumber);

      // Get company details if it's an external invoice
      let companyName = "Your Company";
      if (invoice.invoiceType === "external" && invoice.companyId) {
        const company = await storage.getCompany(invoice.companyId);
        if (company) {
          companyName = company.name;
        }
      }

      console.log("📧 Company name:", companyName);
      console.log("📧 Generating PDF...");

      // Generate PDF
      const pdfBuffer = await generateInvoicePDF(invoice, companyName);
      console.log("📧 PDF generated, size:", pdfBuffer.length, "bytes");

      console.log("📧 Sending email...");
      // Send email
      const emailSent = await sendInvoiceEmail(
        recipientEmail,
        invoice.invoiceNumber,
        companyName,
        invoice.clientName,
        pdfBuffer,
        invoice.total / 100, // Convert from cents to currency
        "ZAR" // South African Rand
      );

      console.log("📧 Email sent result:", emailSent);

      if (emailSent) {
        res.json({ 
          success: true, 
          message: `Invoice #${invoice.invoiceNumber} sent successfully to ${recipientEmail}` 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Failed to send email. Please check email configuration and try again." 
        });
      }
    } catch (error) {
      console.error("📧 Error sending invoice email:", error);
      res.status(500).json({ message: "Failed to send invoice email" });
    }
  });

  // Initialize ML models
  const paymentPredictor = new PaymentDelayPredictor();
  const riskScorer = new ClientRiskScorer();
  const anomalyDetector = new AnomalyDetector();
  const clientSegmentation = new ClientSegmentation();

  // ML API endpoints
  app.get("/api/ml/payment-predictions", async (req: Request, res: Response) => {
    try {
      const invoices = await storage.getAllInvoices();
      
      // Train the model if not already trained
      paymentPredictor.train(invoices);
      
      const predictions = invoices
        .filter(inv => inv.status === 'unpaid')
        .map(invoice => ({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          amount: invoice.total,
          ...paymentPredictor.predict(invoice, invoices)
        }));

      res.json(predictions);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate payment predictions" });
    }
  });

  app.get("/api/ml/client-risk-scores", async (req: Request, res: Response) => {
    try {
      const invoices = await storage.getAllInvoices();
      
      // Get unique clients
      const clients = Array.from(new Set(invoices.map(inv => inv.clientName)));
      
      const riskScores = clients.map(clientName => ({
        clientName,
        ...riskScorer.calculateRiskScore(clientName, invoices)
      }));

      res.json(riskScores);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate risk scores" });
    }
  });

  app.get("/api/ml/anomaly-detection", async (req: Request, res: Response) => {
    try {
      const invoices = await storage.getAllInvoices();
      const results = anomalyDetector.detectAnomalies(invoices);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to detect anomalies" });
    }
  });

  app.get("/api/ml/client-segmentation", async (req: Request, res: Response) => {
    try {
      const invoices = await storage.getAllInvoices();
      const segmentation = clientSegmentation.segmentClients(invoices);
      res.json(segmentation);
    } catch (error) {
      res.status(500).json({ message: "Failed to segment clients" });
    }
  });

  app.post("/api/ml/predict-single", async (req: Request, res: Response) => {
    try {
      const { invoiceId } = req.body;
      
      if (!invoiceId) {
        return res.status(400).json({ message: "Invoice ID required" });
      }

      const invoices = await storage.getAllInvoices();
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Train the model
      paymentPredictor.train(invoices);
      
      const prediction = paymentPredictor.predict(invoice, invoices);
      const riskScore = riskScorer.calculateRiskScore(invoice.clientName, invoices);

      res.json({
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          total: invoice.total
        },
        prediction,
        riskScore
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate prediction" });
    }
  });

  app.get("/api/ml/insights-summary", async (req: Request, res: Response) => {
    try {
      const invoices = await storage.getAllInvoices();
      
      // Train payment predictor
      const trainingResult = paymentPredictor.train(invoices);
      
      // Get all insights
      const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid');
      const predictions = unpaidInvoices.map(invoice => 
        paymentPredictor.predict(invoice, invoices)
      );
      
      const clients = Array.from(new Set(invoices.map(inv => inv.clientName)));
      const riskScores = clients.map(clientName => 
        riskScorer.calculateRiskScore(clientName, invoices)
      );
      
      const anomalies = anomalyDetector.detectAnomalies(invoices);
      const segmentation = clientSegmentation.segmentClients(invoices);

      // Calculate summary metrics
      const avgDelayDays = predictions.length > 0 
        ? predictions.reduce((sum, p) => sum + p.delayDays, 0) / predictions.length 
        : 0;
      
      const highRiskClients = riskScores.filter(r => r.category === 'high').length;
      const atRiskRevenue = unpaidInvoices
        .filter(inv => {
          const prediction = paymentPredictor.predict(inv, invoices);
          return prediction.riskLevel === 'high';
        })
        .reduce((sum, inv) => sum + inv.total, 0);

      res.json({
        summary: {
          totalInvoices: invoices.length,
          unpaidInvoices: unpaidInvoices.length,
          avgPredictedDelay: Math.round(avgDelayDays),
          highRiskClients,
          atRiskRevenue,
          totalAnomalies: anomalies.summary.totalAnomalies,
          clientSegments: segmentation.segmentSummary.length,
          modelTrained: trainingResult.success
        },
        recentPredictions: predictions.slice(0, 5),
        topRiskClients: riskScores
          .sort((a, b) => b.score - a.score)
          .slice(0, 5),
        recentAnomalies: anomalies.anomalies
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate insights summary" });
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
