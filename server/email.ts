import nodemailer from "nodemailer";

interface EmailParams {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Send an email using SMTP configuration from environment variables
 * @param params Email parameters
 * @returns Boolean indicating success/failure
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    // Hardcoded SMTP configuration
    const smtpHost = "smtp.gmail.com";
    const smtpPort = 587;
    const smtpUser = "devsamasi1@gmail.com"; // Replace with your Gmail address
    const smtpPassword = "goej tmnv fmpm qbzj"; // Replace with your Gmail app password
    const fromEmail = "devsamasi1@gmail.com"; // Replace with your Gmail address

    // Validate required configuration
    if (!smtpUser || !smtpPassword || !fromEmail) {
      console.error(
        "Cannot send email: Missing SMTP configuration. Please update the hardcoded values in server/email.ts",
      );
      return false;
    }

    // Log send attempt (without exposing sensitive data)
    console.log(
      `Attempting to send email to ${params.to} with subject: ${params.subject}`,
    );

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // Use SSL for port 465, TLS for 587
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Define email options
    const mailOptions: any = {
      from: params.from || fromEmail,
      to: params.to,
      subject: params.subject,
      text: params.text || "",
      html: params.html || "",
    };

    // Add attachments if provided
    if (params.attachments && params.attachments.length > 0) {
      mailOptions.attachments = params.attachments;
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Email sent successfully to ${params.to} (Message ID: ${info.messageId})`,
    );
    return true;
  } catch (error: any) {
    if (error.responseCode) {
      // Handle specific SMTP errors
      if (error.responseCode >= 400 && error.responseCode < 500) {
        console.error(
          `Authentication failed for SMTP. Check username/password in Replit Secrets.`,
        );
      } else if (error.responseCode >= 500) {
        console.error(
          `Server error on ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}. Response: ${error.response}`,
        );
      }
    } else {
      console.error(`Failed to send email to ${params.to}: ${error.message}`);
    }
    return false;
  }
}

/**
 * Send an invoice email with PDF attachment
 * @param recipientEmail Recipient email address
 * @param invoiceNumber Invoice number
 * @param companyName Company name
 * @param clientName Client name
 * @param pdfBuffer PDF buffer containing the invoice
 * @param invoiceAmount Invoice amount for display
 * @returns Boolean indicating success/failure
 */
export async function sendInvoiceEmail(
  recipientEmail: string,
  invoiceNumber: string,
  companyName: string,
  clientName: string,
  pdfBuffer: Buffer,
  invoiceAmount: number,
  currency: string = "USD",
): Promise<boolean> {
  try {
    const currentDate = new Date().toLocaleDateString();
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(invoiceAmount);

    // Create HTML version with professional formatting
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <!-- Header with Samasi branding -->
        <div style="background: linear-gradient(135deg, #c62d42, #dc3545, #e74c3c); padding: 25px; text-align: center; position: relative; box-shadow: 0 4px 12px rgba(198, 45, 66, 0.2);">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
            <img src="https://raw.githubusercontent.com/user-attachments/files/18362720/logo.png" alt="Samasi Logo" style="height: 50px; margin-right: 15px; filter: brightness(1.1);" />
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Samasi</h1>
          </div>
          <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; margin-top: 10px;">
            <h2 style="color: white; margin: 0; font-size: 22px; font-weight: normal;">Invoice #${invoiceNumber}</h2>
            <p style="color: rgba(255,255,255,0.95); margin: 8px 0 0 0; font-size: 14px; letter-spacing: 0.5px;">Professional Financial & Audit Services</p>
          </div>
        </div>
        
        <!-- Main content area -->
        <div style="padding: 30px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 2px solid #f87171; border-radius: 10px; padding: 18px; box-shadow: 0 2px 6px rgba(248, 113, 113, 0.15);">
              <h3 style="color: #c62d42; margin: 0; font-size: 18px; font-weight: 600;">📧 New Invoice Received</h3>
            </div>
          </div>
          <p style="color: #333; line-height: 1.5; font-size: 16px;">Dear ${clientName},</p>
          <p style="color: #333; line-height: 1.5;">We hope this email finds you well. Please find attached your invoice from <strong style="color: #2563eb;">Samasi</strong>, your trusted invoice management partner.</p>
          
          <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #f87171; border-radius: 12px; padding: 25px; margin: 25px 0; box-shadow: 0 4px 8px rgba(248, 113, 113, 0.1);">
            <h3 style="color: #c62d42; margin-top: 0; font-size: 18px; border-bottom: 2px solid #c62d42; padding-bottom: 8px; display: inline-block;">📋 Invoice Details</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
              <div>
                <p style="margin: 8px 0; color: #475569; font-size: 14px;"><strong style="color: #1e293b;">Invoice Number:</strong></p>
                <p style="margin: 0; color: #c62d42; font-size: 16px; font-weight: bold;">${invoiceNumber}</p>
              </div>
              <div>
                <p style="margin: 8px 0; color: #475569; font-size: 14px;"><strong style="color: #1e293b;">Amount:</strong></p>
                <p style="margin: 0; color: #059669; font-size: 18px; font-weight: bold;">${formattedAmount}</p>
              </div>
              <div>
                <p style="margin: 8px 0; color: #475569; font-size: 14px;"><strong style="color: #1e293b;">Date:</strong></p>
                <p style="margin: 0; color: #374151; font-size: 16px;">${currentDate}</p>
              </div>
              <div>
                <p style="margin: 8px 0; color: #475569; font-size: 14px;"><strong style="color: #1e293b;">From:</strong></p>
                <p style="margin: 0; color: #c62d42; font-size: 16px; font-weight: bold;">Samasi Professional Services</p>
              </div>
            </div>
          </div>
          
          <p style="color: #333; line-height: 1.5;">The invoice is attached as a PDF document. Please review the details and process payment according to the terms specified.</p>
          
          <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 18px; margin: 20px 0;">
            <h4 style="color: #c62d42; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">📄 Attachment Information</h4>
            <p style="color: #c62d42; margin: 0; font-size: 12px; line-height: 1.4;
              This email includes a PDF attachment containing the complete invoice details. 
              Please ensure you can open PDF files or contact us if you need the invoice in a different format.
            </p>
          </div>
          
          <p style="color: #333; line-height: 1.5;">If you have any questions about this invoice, please don't hesitate to contact us.</p>
          
          <p style="color: #333; line-height: 1.5;">Thank you for your business!</p>
          <p style="color: #333; line-height: 1.5;"><strong>${companyName}</strong></p>
        </div>
        
        <!-- Footer area -->
        <div style="background: linear-gradient(135deg, #f8fafc, #e2e8f0); padding: 30px; text-align: center; border-top: 2px solid #c62d42;">
          <div style="margin-bottom: 20px;">
            <img src="https://raw.githubusercontent.com/user-attachments/files/18362720/logo.png" alt="Samasi Logo" style="height: 35px;" />
          </div>
          <div style="background: white; border-radius: 10px; padding: 20px; margin: 0 auto; max-width: 400px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h4 style="color: #c62d42; font-size: 16px; margin: 0 0 10px 0; font-weight: bold;">Samasi Professional Services</h4>
            <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.5;">Registered Auditors & Tax Practitioners</p>
            <p style="color: #64748b; font-size: 13px; margin: 8px 0 0 0;">Johannesburg, South Africa</p>
            <p style="color: #64748b; font-size: 12px; margin: 15px 0 0 0;">© ${new Date().getFullYear()} Samasi Professional Services. All rights reserved.</p>
          </div>
          <div style="margin-top: 20px;">
            <a href="https://samasi.co.za" style="color: #c62d42; text-decoration: none; font-size: 12px; margin: 0 15px; font-weight: 500;">Website</a>
            <a href="mailto:info@samasi.co.za" style="color: #c62d42; text-decoration: none; font-size: 12px; margin: 0 15px; font-weight: 500;">Contact Us</a>
            <a href="#" style="color: #c62d42; text-decoration: none; font-size: 12px; margin: 0 15px; font-weight: 500;">Support</a>
          </div>
        </div>
      </div>
    `;

    // Plain text version as fallback
    const textContent = `
      Invoice #${invoiceNumber} - Samasi
      
      Dear ${clientName},
      
      We hope this email finds you well. Please find attached your invoice from Samasi, your trusted invoice management partner.
      
      Invoice Details:
      - Invoice Number: ${invoiceNumber}
      - Amount: ${formattedAmount}
      - Date: ${currentDate}
      - From: Samasi
      
      The invoice is attached as a PDF document. Please review the details and process payment according to the terms specified.
      
      If you have any questions about this invoice, please don't hesitate to contact us.
      
      Thank you for choosing Samasi for your business needs!
      
      Best regards,
      The Samasi Team
      
      ---
      Samasi - Professional Invoice Management
      © ${new Date().getFullYear()} Samasi. All rights reserved.
    `;

    // Send the email with PDF attachment
    return await sendEmail({
      to: recipientEmail,
      subject: `Invoice #${invoiceNumber} from ${companyName}`,
      text: textContent,
      html: htmlContent,
      attachments: [
        {
          filename: `Invoice-${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
  } catch (error: any) {
    console.error("Error in sendInvoiceEmail:", error.message);
    return false;
  }
}

/**
 * Test email connectivity
 * @returns Boolean indicating if email service is properly configured
 */
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    const smtpHost = "smtp.gmail.com";
    const smtpUser = "devsamasi1@gmail.com"; // Replace with your Gmail address
    const smtpPassword = "goej tmnv fmpm qbzj"; // Replace with your Gmail app password
    const fromEmail = "devsamasi1@gmail.com"; // Replace with your Gmail address

    if (!smtpHost || !smtpUser || !smtpPassword || !fromEmail) {
      console.error(
        "Email configuration incomplete. Please update the hardcoded values in server/email.ts.",
      );
      return false;
    }

    console.log("Email configuration appears complete.");
    return true;
  } catch (error) {
    console.error("Error testing email configuration:", error);
    return false;
  }
}
