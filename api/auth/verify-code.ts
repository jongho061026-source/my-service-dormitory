import type { IncomingMessage, ServerResponse } from "http";
import { verifyVerificationToken } from "../_utils/mail.js";

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
    const code = body?.code;
    const verificationToken = body?.verificationToken;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "이메일과 인증번호 4자리를 모두 입력해주세요.",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    // Verify using cryptographic token
    const result = verifyVerificationToken(trimmedEmail, cleanCode, verificationToken);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.error || "인증번호가 일치하지 않습니다.",
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      email: trimmedEmail,
      message: "연세대학교 학생 인증이 성공적으로 완료되었습니다.",
    });
  } catch (error: any) {
    console.error("Vercel verify-code error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "서버 내부 오류가 발생했습니다.",
    });
  }
}
