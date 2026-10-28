import type { IncomingMessage, ServerResponse } from "http";
import nodemailer from "nodemailer";
import crypto from "crypto";

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (body: any) => VercelResponse;
  send: (body: any) => VercelResponse;
}

const SECRET_KEY = process.env.AUTH_SECRET || "yonsei-market-verification-secret-key-2026";

function generateVerificationToken(email: string, code: string, expiresAt: number): string {
  const payload = `${email.toLowerCase().trim()}:${code.trim()}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", SECRET_KEY).update(payload).digest("hex");
  return `${payload}:${signature}`;
}

function getVerificationEmailHtml(code: string): string {
  return `
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
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Setup CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "POST 메소드만 허용됩니다." });
  }

  try {
    // Parse request body for Vercel serverless environment
    let body = req.body;
    if (!body) {
      try {
        const chunks: any[] = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        if (chunks.length > 0) {
          const raw = Buffer.concat(chunks).toString("utf-8");
          body = JSON.parse(raw);
        }
      } catch {
        // ignore
      }
    } else if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        // ignore
      }
    }

    const email = body?.email;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, message: "이메일 주소를 입력해주세요." });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith("@yonsei.ac.kr")) {
      return res.status(400).json({
        success: false,
        message: "연세대학교 웹메일(@yonsei.ac.kr)만 인증 가능합니다.",
      });
    }

    // Read environment variables directly
    const smtpHost = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const isSecure = smtpPort === 465;
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, "");

    if (!smtpUser || !smtpPass) {
      console.error("[SMTP Config Error] Missing SMTP_USER or SMTP_PASS", {
        hasUser: !!smtpUser,
        hasPass: !!smtpPass,
      });
      return res.status(500).json({
        success: false,
        message: `[에러원인: Vercel 환경변수에 SMTP_USER 또는 SMTP_PASS가 설정되지 않았습니다. / USER설정여부: ${!!smtpUser} / PASS설정여부: ${!!smtpPass}]`,
      });
    }

    // Generate dynamic 4-digit verification code & validity
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes validity

    // Generate secure stateless HMAC token
    const verificationToken = generateVerificationToken(trimmedEmail, code, expiresAt);

    // Create Nodemailer transporter directly inline
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: `"연근마켓" <${smtpUser}>`,
      to: trimmedEmail,
      subject: `[연근마켓] 연세대학교 학생 웹메일 인증번호 [${code}]`,
      html: getVerificationEmailHtml(code),
    };

    console.log(`[SMTP Mail Sending] To: ${trimmedEmail}, Via: ${smtpHost}:${smtpPort}, User: ${smtpUser}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP Mail Success] MessageId: ${info.messageId}`);

    return res.status(200).json({
      success: true,
      delivered: true,
      email: trimmedEmail,
      verificationToken,
      message: "인증번호가 연세대 웹메일로 발송되었습니다.",
    });
  } catch (error: any) {
    console.error("Vercel send-verification-code error:", error);
    return res.status(500).json({
      success: false,
      message: `[에러원인: ${error?.message || "서버 내부 오류"} / USER설정여부: ${!!process.env.SMTP_USER}]`,
    });
  }
}
