const nodemailer = require('nodemailer');

/**
 * Tạo transporter để gửi email
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

module.exports = {
  sendEmail,
  sendResetPasswordEmail,
};
