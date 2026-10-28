import type { IncomingMessage, ServerResponse } from "http";
import { sendVerificationEmail, generateVerificationToken } from "../_utils/mail";

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (body: any) => VercelResponse;
  send: (body: any) => VercelResponse;
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
    let body = req.body;
    if (typeof body === "string") {
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

    // Generate dynamic 4-digit verification code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes validity

    // Generate secure stateless HMAC token for Vercel Serverless
    const verificationToken = generateVerificationToken(trimmedEmail, code, expiresAt);

    // Send the real email via nodemailer SMTP
    const result = await sendVerificationEmail(trimmedEmail, code);

    if (result.sent) {
      return res.status(200).json({
        success: true,
        delivered: true,
        email: trimmedEmail,
        verificationToken,
        message: `${trimmedEmail} 메일함으로 인증번호 4자리를 발송했습니다. 수신함을 확인해주세요.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: `인증 메일 발송 실패: ${result.error || "메일 전송 중 문제가 발생했습니다."}`,
    });
  } catch (error: any) {
    console.error("Vercel send-verification-code error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "서버 내부 오류가 발생했습니다.",
    });
  }
}
