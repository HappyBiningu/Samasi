import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Companies table for external company information
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  registrationNumber: text("registration_number").notNull(),
  vatNumber: text("vat_number").notNull(),
  logoPath: text("logo_path"), // Optional logo file path
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

// Line item for invoices
export const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0, "Amount must be a positive number"),
});

export type LineItem = z.infer<typeof lineItemSchema>;

// Bank details schema
export const bankDetailsSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountName: z.string().min(1, "Account name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  sortCode: z.string().optional(),
  iban: z.string().optional(),
  swiftCode: z.string().optional(),
});

export type BankDetails = z.infer<typeof bankDetailsSchema>;

// Invoice schema
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  invoiceDate: text("invoice_date").notNull(),
  clientName: text("client_name").notNull(),
  clientRegNumber: text("client_reg_number").notNull(),
  clientVatNumber: text("client_vat_number").notNull(),
  clientAddress: text("client_address").notNull(),
  lineItems: jsonb("line_items").notNull().$type<LineItem[]>(),
  bankDetails: jsonb("bank_details").$type<BankDetails>(),
  subtotal: integer("subtotal").notNull(),
  vat: integer("vat").notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("unpaid"),
  lastReminderSent: timestamp("last_reminder_sent"),
  reminderCount: integer("reminder_count").default(0),
  dueDate: text("due_date"),
  invoiceType: text("invoice_type").notNull().default("internal"), // 'internal' or 'external'
  companyId: integer("company_id"), // Foreign key to companies table, nullable
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoice type validation
export const invoiceTypeSchema = z.enum(["internal", "external"]);
export type InvoiceType = z.infer<typeof invoiceTypeSchema>;

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
}).extend({
  invoiceType: invoiceTypeSchema,
  companyId: z.number().optional(), // Optional for internal invoices
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  company: one(companies, {
    fields: [invoices.companyId],
    references: [companies.id],
  }),
}));
