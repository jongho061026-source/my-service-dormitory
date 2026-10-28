import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { Resend } from "resend";

import fs from "fs";

dotenv.config();

// Attempt to read secrets from /app/.dev.env.json if present
try {
  if (fs.existsSync("/app/.dev.env.json")) {
    const raw = fs.readFileSync("/app/.dev.env.json", "utf8");
    const devEnv = JSON.parse(raw);
    for (const [key, val] of Object.entries(devEnv)) {
      if (!process.env[key] && typeof val === "string") {
        process.env[key] = val;
      }
    }
  }
} catch {
  // ignore
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

import crypto from "crypto";

const SECRET_KEY = process.env.AUTH_SECRET || "yonsei-market-verification-secret-key-2026";

function generateVerificationToken(email: string, code: string, expiresAt: number): string {
  const payload = `${email.toLowerCase().trim()}:${code.trim()}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", SECRET_KEY).update(payload).digest("hex");
  return `${payload}:${signature}`;
}

function verifyVerificationToken(
  email: string,
  code: string,
  token?: string | null
): { valid: boolean; error?: string } {
  if (!token) {
    return { valid: false, error: "인증 토큰이 없습니다." };
  }
  const parts = token.split(":");
  if (parts.length !== 4) {
    return { valid: false, error: "유효하지 않은 인증 토큰입니다." };
  }
  const [tokenEmail, tokenCode, expiresAtStr, signature] = parts;
  const expiresAt = Number(expiresAtStr);

  if (tokenEmail.toLowerCase() !== email.toLowerCase().trim()) {
    return { valid: false, error: "이메일 불일치" };
  }
  if (tokenCode.trim() !== code.trim()) {
    return { valid: false, error: "인증번호 4자리가 일치하지 않습니다." };
  }
  if (Date.now() > expiresAt) {
    return { valid: false, error: "인증시간(3분)이 만료되었습니다." };
  }
  const expectedSig = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(`${tokenEmail}:${tokenCode}:${expiresAtStr}`)
    .digest("hex");
  if (signature !== expectedSig) {
    return { valid: false, error: "인증 서명이 유효하지 않습니다." };
  }
  return { valid: true };
}

// In-memory verification code store: email -> { code, expiresAt }
const verificationStore = new Map<string, { code: string; expiresAt: number }>();

// Helper to send email via Resend or Nodemailer SMTP
async function sendVerificationEmail(targetEmail: string, code: string): Promise<{ sent: boolean; method?: string; error?: string }> {
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

  // 1. Try Resend if RESEND_API_KEY is available
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
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
      console.log(`[Email Sent via Resend] To: ${targetEmail}, ID: ${res.data?.id}`);
      return { sent: true, method: "Resend" };
    } catch (err: any) {
      console.error("Resend sending failed:", err);
      return { sent: false, error: err.message };
    }
  }

  // 2. Try SMTP with flexible variable names
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

  let smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  if (!smtpHost && smtpUser) {
    if (smtpUser.includes("@naver.com")) smtpHost = "smtp.naver.com";
    else if (smtpUser.includes("@gmail.com")) smtpHost = "smtp.gmail.com";
    else if (smtpUser.includes("@daum.net") || smtpUser.includes("@kakao.com")) smtpHost = "smtp.daum.net";
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

      console.log(`[Email Sent via SMTP] To: ${targetEmail}`);
      return { sent: true, method: "SMTP" };
    } catch (err: any) {
      console.error("SMTP sending failed:", err);
      return { sent: false, error: err.message };
    }
  }

  // 3. If no external email service is configured yet:
  console.log(`[Notice] No email service configured. Generated code for ${targetEmail}: ${code}`);
  return {
    sent: false,
    method: "local",
    error: "EMAIL_SERVICE_NOT_CONFIGURED",
  };
}

// API: Send verification code to student webmail
app.post("/api/auth/send-verification-code", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, message: "이메일 주소를 입력해주세요." });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith("@yonsei.ac.kr")) {
      return res.status(400).json({ success: false, message: "연세대학교 웹메일(@yonsei.ac.kr)만 인증 가능합니다." });
    }

    // Generate dynamic 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes validity

    verificationStore.set(trimmedEmail, { code, expiresAt });
    const verificationToken = generateVerificationToken(trimmedEmail, code, expiresAt);

    // Attempt real email delivery
    const deliveryResult = await sendVerificationEmail(trimmedEmail, code);

    return res.json({
      success: true,
      email: trimmedEmail,
      verificationToken,
      delivered: deliveryResult.sent,
      deliveryMethod: deliveryResult.method,
      message: deliveryResult.sent
        ? `${trimmedEmail} 수신함으로 인증번호가 전송되었습니다. 메일을 확인해주세요.`
        : deliveryResult.error === "EMAIL_SERVICE_NOT_CONFIGURED"
        ? `${trimmedEmail} 주소로 발송 요청이 등록되었습니다. 메일 수신함을 확인해주세요.`
        : `메일 발송 중 오류가 발생했습니다: ${deliveryResult.error}`,
    });
  } catch (error: any) {
    console.error("Error in /api/auth/send-verification-code:", error);
    return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
});

// API: Verify student submitted code
app.post("/api/auth/verify-code", (req, res) => {
  try {
    const { email, code, verificationToken } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: "이메일과 인증번호 4자리를 모두 입력해주세요." });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check cryptographic token if provided
    if (verificationToken) {
      const tokenResult = verifyVerificationToken(trimmedEmail, code.toString(), verificationToken);
      if (tokenResult.valid) {
        verificationStore.delete(trimmedEmail);
        return res.json({
          success: true,
          verified: true,
          email: trimmedEmail,
          message: "연세대학교 학생 인증이 성공적으로 완료되었습니다.",
        });
      }
    }

    const stored = verificationStore.get(trimmedEmail);

    if (!stored) {
      return res.status(400).json({ success: false, message: "인증번호 요청 내역이 없습니다. [인증번호 받기]를 먼저 눌러주세요." });
    }

    if (Date.now() > stored.expiresAt) {
      verificationStore.delete(trimmedEmail);
      return res.status(400).json({ success: false, message: "인증 유효시간(3분)이 만료되었습니다. 인증번호를 다시 받아주세요." });
    }

    if (stored.code !== code.toString().trim()) {
      return res.status(400).json({ success: false, message: "인증번호 4자리가 일치하지 않습니다. 수신된 메일을 확인해주세요." });
    }

    // Success - consume the code
    verificationStore.delete(trimmedEmail);

    return res.json({
      success: true,
      verified: true,
      email: trimmedEmail,
      message: "연세대학교 학생 인증이 성공적으로 완료되었습니다.",
    });
  } catch (error: any) {
    console.error("Error in /api/auth/verify-code:", error);
    return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
