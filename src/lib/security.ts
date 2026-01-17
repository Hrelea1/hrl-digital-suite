import { z } from "zod";

// ==================== INPUT VALIDATION SCHEMAS ====================

// Email validation - strict format
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email-ul este obligatoriu")
  .email("Adresă de email invalidă")
  .max(255, "Email-ul este prea lung")
  .refine((email) => !email.includes(".."), "Format email invalid")
  .refine((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), "Format email invalid");

// Password validation - enterprise standards
export const passwordSchema = z
  .string()
  .min(8, "Parola trebuie să aibă cel puțin 8 caractere")
  .max(128, "Parola este prea lungă")
  .refine(
    (password) => /[A-Z]/.test(password),
    "Parola trebuie să conțină cel puțin o literă mare"
  )
  .refine(
    (password) => /[a-z]/.test(password),
    "Parola trebuie să conțină cel puțin o literă mică"
  )
  .refine(
    (password) => /[0-9]/.test(password),
    "Parola trebuie să conțină cel puțin o cifră"
  );

// Name validation
export const nameSchema = z
  .string()
  .trim()
  .min(2, "Numele trebuie să aibă cel puțin 2 caractere")
  .max(100, "Numele este prea lung")
  .refine(
    (name) => /^[a-zA-ZăâîșțĂÂÎȘȚ\s\-']+$/.test(name),
    "Numele conține caractere invalide"
  );

// Phone validation (optional, Romanian/international format)
export const phoneSchema = z
  .string()
  .optional()
  .refine(
    (phone) => {
      if (!phone || phone.trim() === "") return true;
      return /^\+?[0-9\s\-()]{8,20}$/.test(phone);
    },
    "Număr de telefon invalid"
  );

// Text area validation with sanitization
export const textAreaSchema = z
  .string()
  .trim()
  .min(10, "Descrierea trebuie să aibă cel puțin 10 caractere")
  .max(5000, "Descrierea este prea lungă")
  .transform((text) => sanitizeText(text));

// Project type validation (whitelist)
export const projectTypeSchema = z.enum(
  ["prezentare", "magazin", "aplicatie", "saas", "altele"],
  { errorMap: () => ({ message: "Selectează un tip de proiect valid" }) }
);

// Budget validation (whitelist)
export const budgetSchema = z.enum(
  ["<300", "300-800", "800-1700", ">1700"],
  { errorMap: () => ({ message: "Selectează un buget valid" }) }
);

// Timeline validation (whitelist)
export const timelineSchema = z.enum(
  ["1-2saptamani", "2-4saptamani", "1-2luni", ">2luni"],
  { errorMap: () => ({ message: "Selectează un termen valid" }) }
);

// GDPR consent validation
export const gdprConsentSchema = z
  .boolean()
  .refine((val) => val === true, "Trebuie să accepți politica de confidențialitate");

// ==================== FORM SCHEMAS ====================

// Complete form flow schema
export const formFlowSchema = z.object({
  projectType: projectTypeSchema,
  budget: budgetSchema,
  timeline: timelineSchema,
  details: textAreaSchema,
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  gdprConsent: gdprConsentSchema,
  // Honeypot fields (should be empty)
  website: z.string().max(0, ""),
  company_website: z.string().max(0, ""),
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Parola trebuie să aibă cel puțin 6 caractere"),
});

// Signup schema
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: nameSchema,
  gdprConsent: gdprConsentSchema,
});

// ==================== SANITIZATION FUNCTIONS ====================

/**
 * Sanitize text input - removes potential XSS vectors
 */
export function sanitizeText(input: string): string {
  if (!input) return "";
  
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .replace(/data:/gi, "") // Remove data: protocol
    .replace(/vbscript:/gi, "") // Remove vbscript: protocol
    .trim();
}

/**
 * Escape HTML entities for safe display
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==================== RATE LIMITING (Client-side tracking) ====================

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Client-side rate limit check (complements server-side)
 * Returns remaining attempts or 0 if blocked
 */
export function checkClientRateLimit(
  action: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000, // 15 minutes
  blockMs = 30 * 60 * 1000 // 30 minutes
): { allowed: boolean; remaining: number; blockedUntil?: Date } {
  const now = Date.now();
  const key = action;
  const entry = rateLimitStore.get(key);

  // Check if blocked
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      blockedUntil: new Date(entry.blockedUntil),
    };
  }

  // Check if within window
  if (entry && entry.firstAttempt + windowMs > now) {
    if (entry.count >= maxAttempts) {
      // Block
      const blockedUntil = now + blockMs;
      rateLimitStore.set(key, { ...entry, blockedUntil });
      return {
        allowed: false,
        remaining: 0,
        blockedUntil: new Date(blockedUntil),
      };
    }

    // Increment
    rateLimitStore.set(key, { ...entry, count: entry.count + 1 });
    return {
      allowed: true,
      remaining: maxAttempts - entry.count - 1,
    };
  }

  // Start new window
  rateLimitStore.set(key, { count: 1, firstAttempt: now });
  return {
    allowed: true,
    remaining: maxAttempts - 1,
  };
}

/**
 * Reset rate limit for an action (e.g., after successful login)
 */
export function resetClientRateLimit(action: string): void {
  rateLimitStore.delete(action);
}

// ==================== SESSION SECURITY ====================

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const SESSION_WARNING_MS = 5 * 60 * 1000; // Warning 5 minutes before

let lastActivityTime = Date.now();
let sessionTimeoutCallback: (() => void) | null = null;
let sessionWarningCallback: (() => void) | null = null;
let sessionCheckInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Initialize session timeout monitoring
 */
export function initSessionTimeout(
  onTimeout: () => void,
  onWarning?: () => void
): void {
  sessionTimeoutCallback = onTimeout;
  sessionWarningCallback = onWarning || null;
  
  // Track user activity
  const updateActivity = () => {
    lastActivityTime = Date.now();
  };

  if (typeof window !== "undefined") {
    window.addEventListener("mousedown", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("touchstart", updateActivity);
    window.addEventListener("scroll", updateActivity);

    // Check session status periodically
    sessionCheckInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityTime;

      if (timeSinceActivity >= SESSION_TIMEOUT_MS) {
        sessionTimeoutCallback?.();
        clearSessionTimeout();
      } else if (
        timeSinceActivity >= SESSION_TIMEOUT_MS - SESSION_WARNING_MS &&
        sessionWarningCallback
      ) {
        sessionWarningCallback();
      }
    }, 60000); // Check every minute
  }
}

/**
 * Clear session timeout monitoring
 */
export function clearSessionTimeout(): void {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }
}

/**
 * Refresh session activity timestamp
 */
export function refreshSessionActivity(): void {
  lastActivityTime = Date.now();
}

// ==================== HONEYPOT DETECTION ====================

/**
 * Check if honeypot fields were filled (indicates bot)
 */
export function isHoneypotTriggered(data: Record<string, unknown>): boolean {
  const honeypotFields = ["website", "company_website", "url", "fax"];
  return honeypotFields.some(
    (field) => data[field] && String(data[field]).trim() !== ""
  );
}

// ==================== TIMING ATTACK PREVENTION ====================

/**
 * Add random delay to prevent timing attacks
 */
export async function addSecurityDelay(minMs = 100, maxMs = 500): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

// ==================== AUDIT LOGGING (Client-side) ====================

interface AuditLogEntry {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

const auditLogQueue: AuditLogEntry[] = [];

/**
 * Queue an audit log entry for sending to server
 */
export function queueAuditLog(
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, unknown>
): void {
  auditLogQueue.push({
    action,
    resourceType,
    resourceId,
    details,
    timestamp: new Date(),
  });
}

/**
 * Get pending audit logs
 */
export function getPendingAuditLogs(): AuditLogEntry[] {
  return [...auditLogQueue];
}

/**
 * Clear audit log queue after successful send
 */
export function clearAuditLogQueue(): void {
  auditLogQueue.length = 0;
}
