const nodemailer = require('nodemailer');

const sendInvoice = async (email, billData) => {
    try {
        let transporter;

        // Use Gmail if credentials are provided in .env
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        } else {
            // Fallback to Ethereal for testing
            console.log("No email credentials found in .env, using Ethereal test account.");
            let testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }

        const { saleId, items, total } = billData;

        let itemListText = items.map((item, index) => {
            return `${index + 1}. ${item.name || 'Product'} - Qty: ${item.quantity} - Price: $${item.priceAtSale}`;
        }).join('\n');

        const mailOptions = {
            from: process.env.EMAIL_USER ? `"JMD POS" <${process.env.EMAIL_USER}>` : '"JMD POS System" <pos@meru.com>',
            to: email,
            subject: `Invoice for Order #${saleId}`,
            text: `
        Thank you for your purchase!
        
        Order Reference: ${saleId}
        Date: ${new Date().toLocaleString()}
        
        Items Purchased:
        ----------------------------------
        ${itemListText}
        ----------------------------------
        
        TOTAL: $${total.toFixed(2)}
        
        Have a great day!
        `,
        };

        let info = await transporter.sendMail(mailOptions);

        console.log("Message sent: %s", info.messageId);

        if (!process.env.EMAIL_USER) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        return null;
    }
};

module.exports = sendInvoice;
