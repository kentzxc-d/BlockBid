import { z } from "zod";

// --- Custom Sanitizers & Reusable Types ---

const sanitizeHtml = (val: string) => val.replace(/<(script|iframe|object|embed|svg|math)[^>]*>.*?<\/\1>/gi, "").replace(/on\w+="[^"]*"/gi, "");

const createSanitizedString = (min?: number, max?: number) => {
  let schema = z.string();
  if (min !== undefined) schema = schema.min(min);
  if (max !== undefined) schema = schema.max(max);
  return schema.transform(sanitizeHtml);
};

const SanitizedString = createSanitizedString();
const EthereumAddress = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format");

// --- API Route Schemas ---

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["supplier", "agency", "admin", "ict_head"]),
  entity_type: z.enum(["individual", "company", "government"]).optional().nullable(),
  nickname: createSanitizedString(undefined, 100).optional().nullable(),
  wallet_address: EthereumAddress.optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  location: createSanitizedString(undefined, 200).optional().nullable(),
  contact_name: createSanitizedString(undefined, 100).optional().nullable(),
  contact_number: z.string().max(20).optional().nullable(),
});

export const IdQuerySchema = z.object({
  id: z.string().uuid().optional(),
  wallet_address: EthereumAddress.optional(),
});

export const AcquisitionSchema = z.object({
  requestor_id: z.string().uuid(),
  title: createSanitizedString(3, 255),
  description: SanitizedString.optional().nullable(),
  deadline: z.string().datetime(), // ISO 8601 string
  budget: z.number().positive().optional().nullable(),
  location: createSanitizedString(undefined, 200).optional().nullable(),
  contact_name: createSanitizedString(undefined, 100).optional().nullable(),
  contact_number: z.string().max(20).optional().nullable(),
  criteria: z.array(
    z.object({
      id: z.string(),
      description: SanitizedString,
      weight: z.number().min(0).max(100)
    })
  ).min(1, "At least one criterion is required")
});

export const BidSchema = z.object({
  project_id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  anonymous_alias: createSanitizedString(3, 100),
  on_chain_hash: z.string().min(10).optional().nullable(),
  bid_values: z.array(
    z.object({
      criterion_id: z.string(),
      proposed_value: SanitizedString
    })
  ).min(1, "Bid values are required")
});

export const EvaluateBidsSchema = z.object({
  procurementDetails: z.object({
    title: SanitizedString.optional(),
    description: SanitizedString.optional(),
    budget: z.number().optional().nullable()
  }).optional(),
  criteria: z.array(
    z.object({
      id: z.string(),
      description: SanitizedString,
      weight: z.number()
    })
  ),
  bids: z.array(
    z.object({
      id: z.string().uuid(),
      supplier_id: z.string().uuid(),
      anonymous_alias: SanitizedString,
      bid_values: z.record(z.string(), z.any()) // Flexible but structured
    })
  )
});

export const BenchmarkProposalSchema = z.object({
  supplier_id: z.string().uuid(),
  item_name: createSanitizedString(2),
  category: SanitizedString,
  subcategory: SanitizedString.optional().nullable(),
  specs_description: SanitizedString.optional().nullable(),
  proposed_price: z.number().positive(),
  proof_link: z.string().url().optional().nullable()
});

export const AdminUsersSchema = z.object({
  admin_id: z.string().uuid(),
  target_user_id: z.string().uuid(),
  new_role: z.enum(["supplier", "agency", "admin", "ict_head"])
});

export const AdminApproveSchema = z.object({
  project_id: z.string().uuid(),
  status: z.enum(["approve", "reject"])
});

export const CheckoutSchema = z.object({
  amount: z.number().positive(),
  userAddress: EthereumAddress
});

export const GasSponsorSchema = z.object({
  user_id: z.string().uuid(),
  wallet_address: EthereumAddress
});
