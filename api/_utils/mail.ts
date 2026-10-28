import nodemailer from "nodemailer";
import { Resend } from "resend";
import crypto from "crypto";

const SECRET_KEY = process.env.AUTH_SECRET || "yonsei-market-verification-secret-key-2026";

export function generateVerificationToken(email: string, code: string, expiresAt: number): string {
  const payload = `${email.toLowerCase().trim()}:${code.trim()}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", SECRET_KEY).update(payload).digest("hex");
  return `${payload}:${signature}`;
}

export function verifyVerificationToken(
  email: string,
  code: string,
  token?: string | null
): { valid: boolean; error?: string } {
  if (!token) {
    return { valid: false, error: "인증 토큰이 없습니다. 인증번호를 다시 요청해주세요." };
  }

  const parts = token.split(":");
  if (parts.length !== 4) {
    return { valid: false, error: "유효하지 않은 인증 토큰 형식입니다." };
  }

  const [tokenEmail, tokenCode, expiresAtStr, signature] = parts;
  const expiresAt = Number(expiresAtStr);

  if (tokenEmail.toLowerCase() !== email.toLowerCase().trim()) {
    return { valid: false, error: "인증 요청한 이메일 주소와 일치하지 않습니다." };
  }

  if (tokenCode.trim() !== code.trim()) {
    return { valid: false, error: "인증번호 4자리가 일치하지 않습니다. 수신된 메일을 확인해주세요." };
  }

  if (Date.now() > expiresAt) {
    return { valid: false, error: "인증 유효시간(3분)이 만료되었습니다. 인증번호를 다시 받아주세요." };
  }

  const expectedPayload = `${tokenEmail}:${tokenCode}:${expiresAtStr}`;
  const expectedSig = crypto.createHmac("sha256", SECRET_KEY).update(expectedPayload).digest("hex");

  if (signature !== expectedSig) {
    return { valid: false, error: "인증 서명이 변조되었거나 유효하지 않습니다." };
  }

  return { valid: true };
}

export async function sendVerificationEmail(
  targetEmail: string,
  code: string
): Promise<{ sent: boolean; method?: string; error?: string }> {
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px 24px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="display: inline-block; background-color: #014B43; color: white; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: bold; letter-spacing: 0.5px;">
          연세대학교 기숙사 자원순환 연근마켓
        </div>
      </div>
      <h2 style="color: #1E2923; text-align: center; font-size: 22px; font-weight: 800; margin-bottom: 8px;">
        웹메일 학생 인증번호
      </h2>
      <p style="color: #4A5568; font-size: 14px; text-align: center; line-height: 1.6; margin-bottom: 24px;">
        연근마켓 서비스 이용을 위한 연세대학교 학생 인증 번호입니다.<br/>
        아래의 4자리 인증번호를 앱 화면에 입력해 주세요.
      </p>
      <div style="background-color: #F0FDF4; border: 2px dashed #014B43; border-radius: 12px; padding: 22px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 12px; color: #014B43; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">인증번호 4자리</span>
        <span style="font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #014B43; font-family: monospace;">
          ${code}
        </span>
      </div>
      <p style="color: #718096; font-size: 12px; line-height: 1.6; text-align: center;">
        * 인증번호는 발송 후 <strong>3분간</strong> 유효합니다.<br/>
        * 본인이 인증을 요청하지 않은 경우 이 메일을 안전하게 무시해 주세요.
      </p>
      <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0 16px 0;" />
      <div style="text-align: center; font-size: 11px; color: #A0AEC0;">
        연세대학교 송도학사(국제캠퍼스) 및 신촌학사 기숙사 전용 에코 마일리지 플랫폼
      </div>
    </div>
  `;

  // 1. Gmail SMTP Transporter with host: 'smtp.gmail.com', port: 465, secure: true
  const rawUser = process.env.SMTP_USER || "jongho061026@gmail.com";
  const smtpUser = rawUser?.trim();
  const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, "");

  if (smtpUser && smtpPass) {
    try {
      console.log(`[Email Transporter Init] host: smtp.gmail.com, port: 465, secure: true, User: ${smtpUser}, USER설정여부: ${!!process.env.SMTP_USER}`);
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: `"연근마켓" <${smtpUser}>`,
        to: targetEmail,
        subject: `[연근마켓] 연세대학교 학생 웹메일 인증번호 [${code}]`,
        html: htmlContent,
      };

      console.log(`[Email Sending] From: "연근마켓" <${smtpUser}> -> To: ${targetEmail}`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Sent Success] MessageId: ${info.messageId}, Accepted: ${JSON.stringify(info.accepted)}`);
      return { sent: true, method: "Gmail-SMTP" };
    } catch (err: any) {
      console.error("[Email Send Error - Gmail SMTP Details]:", {
        message: err?.message,
        code: err?.code,
        command: err?.command,
        response: err?.response,
        responseCode: err?.responseCode,
      });

      const errorDetail = `[에러원인: ${err?.message || err} / USER설정여부: ${!!process.env.SMTP_USER}]`;

      // Fall through to Resend if available
      if (!process.env.RESEND_API_KEY) {
        return {
          sent: false,
          error: errorDetail,
        };
      }
    }
  } else {
    console.warn("[Email Send Warning] SMTP_USER or SMTP_PASS is missing in environment variables.");
    if (!process.env.RESEND_API_KEY) {
      return {
        sent: false,
        error: `[에러원인: SMTP_USER 또는 SMTP_PASS 환경변수 미설정 / USER설정여부: ${!!process.env.SMTP_USER} / PASS설정여부: ${!!process.env.SMTP_PASS}]`,
      };
    }
  }

  // 2. Resend Fallback (if RESEND_API_KEY is configured)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
      const res = await resend.emails.send({
        from: `연근마켓 <${fromEmail}>`,
        to: targetEmail,
        subject: `[연근마켓] 연세대학교 학생 웹메일 인증번호 [${code}]`,
        html: htmlContent,
      });
      if (res.error) {
        console.error("[Resend API Error]:", res.error);
        return {
          sent: false,
          error: `[에러원인: ${res.error.message} / USER설정여부: ${!!process.env.SMTP_USER}]`,
        };
      }
      return { sent: true, method: "Resend" };
    } catch (err: any) {
      console.error("[Resend Delivery Failed]:", err);
      return {
        sent: false,
        error: `[에러원인: ${err.message || "Resend 전송 실패"} / USER설정여부: ${!!process.env.SMTP_USER}]`,
      };
    }
  }

  return {
    sent: false,
    method: "none",
    error: `[에러원인: 이메일 발송 계정(SMTP_PASS) 설정 누락 / USER설정여부: ${!!process.env.SMTP_USER}]`,
  };
}
