const nodemailer = require('nodemailer');

/**
 * Tạo transporter để gửi email thông qua Mailtrap
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true cho port 465, false cho các port khác
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Gửi email chung
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending email: ${error.message}`);
    // Không throw error để tránh crash app nếu gửi mail fail, 
    // nhưng trong thực tế có thể cần xử lý retry hoặc log kỹ hơn.
    return null;
  }
};

/**
 * Template email đặt lại mật khẩu
 */
const sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `${process.env.DOMAIN_SEND_EMAIL}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #533afd; text-align: center;">Khôi phục mật khẩu</h2>
      <p>Chào bạn,</p>
      <p>Bạn nhận được email này vì chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản Cake Shop của bạn.</p>
      <p>Vui lòng nhấn vào nút bên dưới để tiến hành thiết lập mật khẩu mới:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #533afd; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đặt lại mật khẩu</a>
      </div>
      <p>Liên kết này sẽ hết hạn sau <strong>1 giờ</strong>.</p>
      <p>Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">Đây là email tự động, vui lòng không trả lời.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: '[Cake Shop] Yêu cầu đặt lại mật khẩu',
    html,
  });
};

/**
 * Gửi email xác nhận đặt hàng thành công
 */
const sendOrderConfirmationEmail = async (email, order) => {
  const orderUrl = `${process.env.DOMAIN_SEND_EMAIL}/profile/orders/${order._id}`;

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.cake_id.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price_at_buy.toLocaleString('vi-VN')}đ</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #28a745; text-align: center;">Đặt hàng thành công!</h2>
      <p>Chào bạn,</p>
      <p>Cảm ơn bạn đã đặt hàng tại <strong>Cake Shop</strong>. Đơn hàng của bạn đang được chúng tôi xử lý.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Mã đơn hàng:</strong> #${order._id}</p>
        <p><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleString('vi-VN')}</p>
        <p><strong>Địa chỉ giao hàng:</strong> ${order.address}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #eee;">
            <th style="padding: 10px; text-align: left;">Sản phẩm</th>
            <th style="padding: 10px; text-align: center;">SL</th>
            <th style="padding: 10px; text-align: right;">Giá</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Tổng cộng:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: #d9534f;">${order.final_price.toLocaleString('vi-VN')}đ</td>
          </tr>
        </tfoot>
      </table>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${orderUrl}" style="background-color: #533afd; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Xem chi tiết đơn hàng</a>
      </div>

      <p>Chúng tôi sẽ sớm liên hệ với bạn để xác nhận và giao hàng.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">Đây là email tự động, vui lòng không trả lời.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `[Cake Shop] Xác nhận đơn hàng #${order._id}`,
    html,
  });
};

/**
 * Gửi email thông báo cập nhật trạng thái đơn hàng
 */
const sendOrderStatusUpdateEmail = async (email, order) => {
  const statusMap = {
    'PENDING': 'Đang chờ xử lý',
    'CONFIRMED': 'Đã xác nhận & Đang chuẩn bị',
    'DONE': 'Giao hàng thành công',
    'REJECTED': 'Đã bị hủy'
  };

  const statusColorMap = {
    'PENDING': '#ffc107',
    'CONFIRMED': '#17a2b8',
    'DONE': '#28a745',
    'REJECTED': '#dc3545'
  };

  const statusText = statusMap[order.status] || order.status;
  const statusColor = statusColorMap[order.status] || '#533afd';
  const orderUrl = `${process.env.DOMAIN_SEND_EMAIL}/profile/orders/${order._id}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: ${statusColor}; text-align: center;">Cập nhật đơn hàng #${order._id}</h2>
      <p>Chào bạn,</p>
      <p>Trạng thái đơn hàng của bạn đã được cập nhật thành:</p>
      
      <div style="text-align: center; margin: 30px 0; padding: 15px; border: 2px solid ${statusColor}; border-radius: 5px; color: ${statusColor}; font-size: 20px; font-weight: bold;">
        ${statusText}
      </div>

      <p>Bạn có thể theo dõi hành trình đơn hàng bằng cách nhấn vào nút bên dưới:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${orderUrl}" style="background-color: #533afd; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Xem chi tiết đơn hàng</a>
      </div>

      <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua số điện thoại hỗ trợ.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">Cảm ơn bạn đã tin tưởng Cake Shop!</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `[Cake Shop] Đơn hàng #${order._id} - ${statusText}`,
    html,
  });
};

module.exports = {
  sendEmail,
  sendResetPasswordEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
};
