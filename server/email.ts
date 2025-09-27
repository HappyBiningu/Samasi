import nodemailer from 'nodemailer';

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
    // Read SMTP configuration from environment variables (set via Replit Secrets)
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const fromEmail = process.env.FROM_EMAIL;

    // Validate required environment variables
    if (!smtpUser || !smtpPassword || !fromEmail) {
      console.error('Cannot send email: Missing SMTP configuration. Please set SMTP_USER, SMTP_PASSWORD, and FROM_EMAIL in Replit Secrets');
      return false;
    }

    // Log send attempt (without exposing sensitive data)
    console.log(`Attempting to send email to ${params.to} with subject: ${params.subject}`);

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
      text: params.text || '',
      html: params.html || '',
    };

    // Add attachments if provided
    if (params.attachments && params.attachments.length > 0) {
      mailOptions.attachments = params.attachments;
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${params.to} (Message ID: ${info.messageId})`);
    return true;
  } catch (error: any) {
    if (error.responseCode) {
      // Handle specific SMTP errors
      if (error.responseCode >= 400 && error.responseCode < 500) {
        console.error(`Authentication failed for SMTP. Check username/password in Replit Secrets.`);
      } else if (error.responseCode >= 500) {
        console.error(`Server error on ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}. Response: ${error.response}`);
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
  currency: string = 'USD'
): Promise<boolean> {
  try {
    const currentDate = new Date().toLocaleDateString();
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(invoiceAmount);

    // Create HTML version with professional formatting
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <!-- Header with Samasi branding -->
        <div style="background: linear-gradient(to right, #2563eb, #1d4ed8); padding: 20px; text-align: center; position: relative;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
            <img src="https://github.com/user-attachments/assets/logo.png" alt="Samasi Logo" style="height: 40px; margin-right: 10px;" />
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Samasi</h1>
          </div>
          <h2 style="color: white; margin: 0; font-size: 20px; font-weight: normal;">Invoice #${invoiceNumber}</h2>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Professional Invoice Management System</p>
        </div>
        
        <!-- Main content area -->
        <div style="padding: 30px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 15px;">
              <h3 style="color: #2563eb; margin: 0; font-size: 18px;">📧 New Invoice Received</h3>
            </div>
          </div>
          <p style="color: #333; line-height: 1.5; font-size: 16px;">Dear ${clientName},</p>
          <p style="color: #333; line-height: 1.5;">We hope this email finds you well. Please find attached your invoice from <strong style="color: #2563eb;">Samasi</strong>, your trusted invoice management partner.</p>
          
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 2px solid #cbd5e1; border-radius: 10px; padding: 25px; margin: 25px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #1e293b; margin-top: 0; font-size: 18px; border-bottom: 2px solid #2563eb; padding-bottom: 8px; display: inline-block;">📋 Invoice Details</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
              <div>
                <p style="margin: 8px 0; color: #475569; font-size: 14px;"><strong style="color: #1e293b;">Invoice Number:</strong></p>
                <p style="margin: 0; color: #2563eb; font-size: 16px; font-weight: bold;">${invoiceNumber}</p>
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
                <p style="margin: 0; color: #2563eb; font-size: 16px; font-weight: bold;">Samasi</p>
              </div>
            </div>
          </div>
          
          <p style="color: #333; line-height: 1.5;">The invoice is attached as a PDF document. Please review the details and process payment according to the terms specified.</p>
          
          <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #0369a1; margin: 0 0 10px 0; font-size: 14px;">📄 Attachment Information</h4>
            <p style="color: #0369a1; margin: 0; font-size: 12px; line-height: 1.4;">
              This email includes a PDF attachment containing the complete invoice details. 
              Please ensure you can open PDF files or contact us if you need the invoice in a different format.
            </p>
          </div>
          
          <p style="color: #333; line-height: 1.5;">If you have any questions about this invoice, please don't hesitate to contact us.</p>
          
          <p style="color: #333; line-height: 1.5;">Thank you for your business!</p>
          <p style="color: #333; line-height: 1.5;"><strong>${companyName}</strong></p>
        </div>
        
        <!-- Footer area -->
        <div style="background: linear-gradient(to right, #f8fafc, #e2e8f0); padding: 25px; text-align: center; border-top: 1px solid #cbd5e1;">
          <div style="margin-bottom: 15px;">
            <img src="https://github.com/user-attachments/assets/logo.png" alt="Samasi Logo" style="height: 30px;" />
          </div>
          <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.4;">This is an automated invoice email from <strong style="color: #2563eb;">Samasi</strong></p>
          <p style="color: #64748b; font-size: 13px; margin: 8px 0 0 0;">Professional Invoice Management • Trusted by Businesses</p>
          <p style="color: #64748b; font-size: 12px; margin: 15px 0 0 0;">© ${new Date().getFullYear()} Samasi. All rights reserved.</p>
          <div style="margin-top: 10px;">
            <a href="#" style="color: #2563eb; text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy Policy</a>
            <a href="#" style="color: #2563eb; text-decoration: none; font-size: 12px; margin: 0 10px;">Terms of Service</a>
            <a href="#" style="color: #2563eb; text-decoration: none; font-size: 12px; margin: 0 10px;">Support</a>
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
          contentType: 'application/pdf',
        },
      ],
    });
  } catch (error: any) {
    console.error('Error in sendInvoiceEmail:', error.message);
    return false;
  }
}

/**
 * Test email connectivity
 * @returns Boolean indicating if email service is properly configured
 */
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const fromEmail = process.env.FROM_EMAIL;

    if (!smtpHost || !smtpUser || !smtpPassword || !fromEmail) {
      console.error('Email configuration incomplete. Please set all required environment variables in Replit Secrets.');
      return false;
    }

    console.log('Email configuration appears complete.');
    return true;
  } catch (error) {
    console.error('Error testing email configuration:', error);
    return false;
  }
}