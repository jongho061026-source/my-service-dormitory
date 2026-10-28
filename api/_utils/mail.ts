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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="display: inline-block; background-color: #014B43; color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; letter-spacing: 0.5px;">
          연세대학교 기숙사 자원순환 연근 마켓
        </div>
      </div>
      <h2 style="color: #1E2923; text-align: center; font-size: 20px; margin-bottom: 8px;">
        웹메일 학생 인증번호
      </h2>
      <p style="color: #4A5568; font-size: 14px; text-align: center; line-height: 1.6; margin-bottom: 24px;">
        연근 마켓 서비스 이용을 위한 본인 인증 번호입니다.<br/>
        아래의 4자리 인증번호를 앱 화면에 입력해 주세요.
      </p>
      <div style="background-color: #F0FDF4; border: 2px dashed #014B43; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 12px; color: #014B43; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">인증번호 4자리</span>
        <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #014B43; font-family: monospace;">
          ${code}
        </span>
      </div>
      <p style="color: #718096; font-size: 12px; line-height: 1.5; text-align: center;">
        * 인증번호는 발송 후 <strong>3분간</strong> 유효합니다.<br/>
        * 본인이 요청하지 않은 경우 이 메일을 무시해 주세요.
      </p>
      <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0 16px 0;" />
      <div style="text-align: center; font-size: 11px; color: #A0AEC0;">
        연세대학교 송도학사 및 신촌학사 기숙사 에코 마일리지 플랫폼
      </div>
    </div>
  `;

  // 1. Check Resend (RESEND_API_KEY)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
      const res = await resend.emails.send({
        from: `연근 마켓 <${fromEmail}>`,
        to: targetEmail,
        subject: `[연근 마켓] 연세대학교 학생 웹메일 인증번호 [${code}]`,
        html: htmlContent,
      });
      if (res.error) {
        console.error("Resend API error:", res.error);
        return { sent: false, error: res.error.message };
      }
      return { sent: true, method: "Resend" };
    } catch (err: any) {
      console.error("Resend delivery failed:", err);
      return { sent: false, error: err.message || "Resend 전송 실패" };
    }
  }

  // 2. Check SMTP with flexible environment variable names
  const smtpUser =
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    process.env.GMAIL_USER ||
    process.env.NAVER_USER;
  const smtpPass =
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.EMAIL_PASS ||
    process.env.EMAIL_PASSWORD ||
    process.env.GMAIL_PASS ||
    process.env.NAVER_PASS;

  let smtpHost =
    process.env.SMTP_HOST ||
    process.env.EMAIL_HOST;

  if (!smtpHost && smtpUser) {
    if (smtpUser.includes("@naver.com")) {
      smtpHost = "smtp.naver.com";
    } else if (smtpUser.includes("@gmail.com")) {
      smtpHost = "smtp.gmail.com";
    } else if (smtpUser.includes("@daum.net") || smtpUser.includes("@kakao.com")) {
      smtpHost = "smtp.daum.net";
    }
  }

  const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const fromEmail = process.env.EMAIL_FROM || smtpUser;
      await transporter.sendMail({
        from: `"연근 마켓" <${fromEmail}>`,
        to: targetEmail,
        subject: `[연근 마켓] 연세대학교 학생 웹메일 인증번호 [${code}]`,
        html: htmlContent,
      });

      return { sent: true, method: "SMTP" };
    } catch (err: any) {
      console.error("SMTP delivery failed:", err);
      return { sent: false, error: err.message || "SMTP 전송 실패" };
    }
  }

  return {
    sent: false,
    method: "none",
    error: "EMAIL_CREDENTIALS_MISSING",
  };
}
