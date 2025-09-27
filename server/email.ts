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
    const transporter = nodemailer.createTransporter({
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
        <!-- Header -->
        <div style="background: linear-gradient(to right, #2563eb, #1d4ed8); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Invoice</h1>
          <p style="color: white; margin: 5px 0 0 0; font-size: 14px;">Professional Invoice Management</p>
        </div>
        
        <!-- Main content area -->
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #1f2937; margin-top: 0;">Invoice #${invoiceNumber}</h2>
          <p style="color: #333; line-height: 1.5;">Dear ${clientName},</p>
          <p style="color: #333; line-height: 1.5;">Please find attached your invoice #${invoiceNumber} from ${companyName}.</p>
          
          <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Invoice Details:</h3>
            <p style="margin: 8px 0; color: #333;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Amount:</strong> ${formattedAmount}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Date:</strong> ${currentDate}</p>
            <p style="margin: 8px 0; color: #333;"><strong>From:</strong> ${companyName}</p>
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
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 12px; margin: 0;">This is an automated invoice email.</p>
          <p style="color: #666; font-size: 12px; margin: 8px 0 0 0;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
      </div>
    `;

    // Plain text version as fallback
    const textContent = `
      Invoice #${invoiceNumber} - ${companyName}
      
      Dear ${clientName},
      
      Please find attached your invoice #${invoiceNumber} from ${companyName}.
      
      Invoice Details:
      - Invoice Number: ${invoiceNumber}
      - Amount: ${formattedAmount}
      - Date: ${currentDate}
      - From: ${companyName}
      
      The invoice is attached as a PDF document. Please review the details and process payment according to the terms specified.
      
      If you have any questions about this invoice, please don't hesitate to contact us.
      
      Thank you for your business!
      ${companyName}
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