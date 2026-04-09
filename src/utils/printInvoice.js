import { format } from "date-fns";
import api from "../api/axios";

export const printInvoice = async (invoiceID) => {
  try {
    const response = await api.get(`/Invoice/${invoiceID}`);
    const inv = response.data;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    const html = `
      <html>
        <head>
          <title>Invoice - ${inv.invoiceNo}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 30px; }
            .brand { font-size: 24px; font-weight: bold; }
            .inv-details { text-align: right; }

            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { text-align: left; background: #f5f5f5; padding: 12px; border: 1px solid #eee; font-size: 13px; }
            td { padding: 12px; border: 1px solid #eee; font-size: 14px; }

            .totals-box { float: right; width: 280px; margin-top: 20px; }
            .row { display: flex; justify-content: space-between; padding: 6px 0; }
            .grand-total { border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 18px; }

            .text-right { text-align: right; }
            .footer-notes { margin-top: 50px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">InvoiceApp</div>
            <div class="inv-details">
              <strong>INVOICE #${inv.invoiceNo}</strong><br />
              Date: ${format(new Date(inv.invoiceDate), "dd MMM yyyy")}
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <strong>Billed To:</strong><br />
            ${inv.customerName}<br />
            ${inv.address || ""}<br />
            ${inv.city || ""}
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Disc %</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${inv.lines
                .map((line) => {
                  const qty = line.quantity || 0;
                  const rate = line.rate || 0;
                  const disc = line.discountPct || 0;
                  const amount = qty * rate * (1 - disc / 100);
                                                    
                  return `
                    <tr>
                      <td>${line.description}</td>
                      <td class="text-right">${qty}</td>
                      <td class="text-right">$${rate.toFixed(2)}</td>
                      <td class="text-right">${disc.toFixed(2)}%</td>
                      <td class="text-right">$${amount.toFixed(2)}</td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>

          <div class="totals-box">
            <div class="row">
              <span>Sub Total:</span>
              <span>$${inv.subTotal.toFixed(2)}</span>
            </div>
            <div class="row">
              <span>Tax (${inv.taxPercentage}%):</span>
              <span>$${inv.taxAmount.toFixed(2)}</span>
            </div>
            <div class="row grand-total">
              <span>Total Amount:</span>
              <span>$${inv.invoiceAmount.toFixed(2)}</span>
            </div>
          </div>

          <div style="clear: both;"></div>

          ${
            inv.notes
              ? `<div class="footer-notes"><strong>Notes:</strong><br/>${inv.notes}</div>`
              : ""
          }
        </body>
      </html>
    `;

    
    doc.open();
    doc.write(html);
    doc.close();

    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    };

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 500);

    
    iframe.contentWindow.onafterprint = () => {
      document.body.removeChild(iframe);
    };

  } catch (error) {
    console.error("Print Error:", error);
    throw error;
  }
};