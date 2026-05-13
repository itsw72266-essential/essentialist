// D:\EssentialistMakeupStore\server\utils\forgotPasswordTemplate.js
const forgotPasswordTemplate = ({ name, otp }) => {
    return `
    <div style="max-width:480px;margin:36px auto;padding:0;background:#f472b6;border-radius:22px;box-shadow:0 8px 32px rgba(244,114,182,0.17),0 1.5px 6px rgba(244,114,182,0.16);font-family:'Segoe UI',Arial,sans-serif;">
      <div style="background:linear-gradient(120deg,#f472b6 85%,#fff0f6 100%);border-radius:22px 22px 0 0;padding:32px 24px 18px 24px;text-align:center;">
        <h2 style="font-weight:700;font-size:1.33rem;margin:18px 0 0 0;color:#fff;letter-spacing:.01em;line-height:1.25;">Password Reset Request</h2>
      </div>
      <div style="background:#fff;border-radius:0 0 22px 22px;padding:28px 24px 20px 24px;">
        <p style="font-size:1.05rem;margin-bottom:12px;color:#d6336c;">Hi <span style="font-weight:600;">${name || ''}</span>,</p>
        <p style="color:#222;font-size:1.01rem;margin-bottom:18px;">
          We received a request to reset your password.<br>
          Please use the following One-Time Password (OTP) to complete the process:
        </p>
        <div style="
          background:linear-gradient(90deg,#f472b6 0%,#fbcfe8 100%);
          color:#ad1457;
          font-size:2.1rem;
          padding:22px 0;
          margin:22px auto 18px auto;
          text-align:center;
          font-weight:900;
          border-radius:14px;
          letter-spacing:0.16em;
          box-shadow:0 2px 12px rgba(244,114,182,0.12);
          max-width:260px;
          border:2.5px dashed #f472b6;
        ">
          ${otp}
        </div>
        <p style="font-size:.99rem;margin:14px 0 10px 0;color:#444;">
          This OTP is valid for <strong>1 hour</strong> only.<br>
          Enter it in the <span style="color:#f472b6;font-weight:500;">EssentialistMakeupStore</span> app or website to proceed with resetting your password.
        </p>
        <p style="font-size:.96rem;color:#bdbdbd;text-align:center;margin-top:22px;">
          Did not request this? You can safely ignore this email.<br>
          <span style="font-size:.93em;color:#f472b6;">&mdash; EssentialistMakeup Team</span>
        </p>
      </div>
    </div>
    `
  }
  
  export default forgotPasswordTemplate