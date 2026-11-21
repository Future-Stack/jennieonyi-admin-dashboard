import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";

const status = z.enum(["ACTIVE", "INACTIVE", "PENDING_APPROVAL", "SUSPEND", "REJECTED"]);
const meta = z.object({ total: z.number(), page: z.number(), limit: z.number(), totalPages: z.number(), stats: z.record(z.string(), z.number()).optional(), counts: z.record(z.string(), z.number()).optional() }).passthrough();
const person = z.object({ userId:z.string(),name:z.string(),email:z.string(),phone:z.string(),role:z.string(),status,avatar:z.string().nullable(),createdAt:z.string(),location:z.string().nullable(),isFlagged:z.boolean(),flagReason:z.string().nullable() });
const vendorBase = person.extend({ commissionRate:z.number().nullable(),refundRate:z.number(),risk:z.enum(["HEALTHY","WARNING","HIGH_RISK"]),categories:z.array(z.string()),productCount:z.number(),orderCount:z.number() });
// TASK-059: a complete vendor must carry every store fact; only an explicitly incomplete account (no vendor profile) may carry nulls.
// profileComplete is optional on complete rows for backward compatibility with older API builds.
const completeVendor = vendorBase.extend({ profileComplete:z.literal(true).default(true),vendorId:z.string(),storeName:z.string(),revenue:z.number(),rating:z.number() });
const incompleteVendor = vendorBase.extend({ profileComplete:z.literal(false),vendorId:z.null(),storeName:z.null(),revenue:z.null(),rating:z.null() });
export const vendorSchema = z.union([completeVendor, incompleteVendor]);
/** Store name, or the account name for a vendor whose profile is missing. */
export const vendorDisplayName = (vendor: { storeName: string | null; name: string }) => vendor.storeName ?? vendor.name;
export const agentSchema = person.extend({ agentId:z.string(),agentCode:z.string(),tier:z.enum(["Bronze","Silver","Gold","Platinum"]),referralsCount:z.number(),totalEarned:z.number(),pendingPayout:z.number() });
export const referralSchema = z.object({ id:z.string(),agentId:z.string(),agentName:z.string(),stylistId:z.string(),stylistName:z.string(),status,verifiedAt:z.string().nullable(),commissionEarned:z.number(),createdAt:z.string() });
export const qualitySchema = z.object({windowDays:z.number(),deliveredCount:z.number(),refundedCount:z.number(),vendorFaultRefundedCount:z.number(),refundRate:z.number(),risk:z.string(),totalReturns:z.number(),vendorFaultAmount:z.number(),returnShippingLiability:z.number(),outstandingPenalties:z.number()});
export const penaltySchema = z.object({id:z.string(),orderId:z.string().nullable(),amount:z.number(),reason:z.string(),status:z.enum(["OUTSTANDING","DEDUCTED","WAIVED"]),createdAt:z.string()});
export type Vendor = z.infer<typeof vendorSchema>;
export type Agent = z.infer<typeof agentSchema>;
export type Referral = z.infer<typeof referralSchema>;
export type Penalty = z.infer<typeof penaltySchema>;
export type DirectoryFilters = { page:number;limit:number;search:string;status?:string;tab?:string;risk?:string;tier?:string;agentId?:string };
export const providerKeys={ vendors:["admin","vendors"] as const,vendor:(id:string)=>["admin","vendors",id] as const,agents:["admin","agents"] as const,referrals:["admin","agents","referrals"] as const,quality:(id:string)=>["admin","vendors",id,"quality"] as const,penalties:(id:string)=>["admin","vendors",id,"penalties"] as const };
export function directoryPath(resource:"vendors"|"street-agents"|"street-agents/referrals", f:DirectoryFilters, format="json") { const p=new URLSearchParams({page:String(f.page),limit:String(f.limit),sortBy:"createdAt",sortOrder:"desc",format}); if(f.search.trim())p.set("search",f.search.trim()); if(f.status)p.set("status",f.status);if(f.tab)p.set("tab",f.tab);if(f.risk)p.set("risk",f.risk);if(f.tier)p.set("tier",f.tier);if(f.agentId)p.set("agentId",f.agentId);return `${resource}?${p}`; }
async function listing<T>(path:string,schema:z.ZodType<T,z.ZodTypeDef,unknown>,signal?:AbortSignal){const result=await apiClient.admin.request(path,{method:"GET",signal},data=>z.array(schema).parse(data));return {data:result.data,meta:meta.parse(result.meta)};}
export function useVendors(filters:DirectoryFilters){return useQuery({queryKey:[...providerKeys.vendors,filters],queryFn:({signal})=>listing(directoryPath("vendors",filters),vendorSchema,signal)});}
export function useAgents(filters:DirectoryFilters){return useQuery({queryKey:[...providerKeys.agents,filters],queryFn:({signal})=>listing(directoryPath("street-agents",filters),agentSchema,signal)});}
export function useReferrals(filters:DirectoryFilters){return useQuery({queryKey:[...providerKeys.referrals,filters],queryFn:({signal})=>listing(directoryPath("street-agents/referrals",filters),referralSchema,signal)});}
export function useVendorDetail(id:string|null){return useQuery({queryKey:providerKeys.vendor(id??""),enabled:!!id,queryFn:async({signal})=>(await apiClient.admin.request(`vendors/${encodeURIComponent(id!)}`,{method:"GET",signal},x=>z.record(z.string(),z.unknown()).parse(x))).data});}
export function useVendorQuality(id:string|null){return useQuery({queryKey:providerKeys.quality(id??""),enabled:!!id,queryFn:async({signal})=>(await apiClient.admin.request(`vendors/${encodeURIComponent(id!)}/quality`,{method:"GET",signal},x=>qualitySchema.parse(x))).data});}
export function useVendorPenalties(id:string|null,filters:DirectoryFilters){return useQuery({queryKey:[...providerKeys.penalties(id??""),filters],enabled:!!id,queryFn:({signal})=>listing(`vendors/${encodeURIComponent(id!)}/penalties?${new URLSearchParams({page:String(filters.page),limit:String(filters.limit),sortBy:"createdAt",sortOrder:"desc",format:"json",...(filters.status?{status:filters.status}:{}),...(filters.search?{search:filters.search}:{})})}`,penaltySchema,signal)});}
function useWrite<T>(key:string,method:"POST"|"PATCH",path:(input:T)=>string,body:(input:T)=>unknown){const client=useQueryClient();return useMutation({mutationFn:(input:T)=>apiClient.admin.request(path(input),{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body(input))},data=>data),onSuccess:()=>{void client.invalidateQueries({queryKey:["admin",key]});void client.invalidateQueries({queryKey:["admin","vendors"]});void client.invalidateQueries({queryKey:["admin","kyc"]});void client.invalidateQueries({queryKey:["admin","dashboard"]});}});}
export const useProviderAction=()=>useWrite<{id:string;action:"approve"|"reject"|"suspend"|"reinstate";reason?:string;notes?:string}>("providers","PATCH",x=>`actions/${encodeURIComponent(x.id)}/${x.action}`,x=>({reason:x.reason,notes:x.notes}));
export const useCommission=()=>useWrite<{id:string;commissionRate:number|null}>("vendors","PATCH",x=>`vendors/${encodeURIComponent(x.id)}/commission`,x=>({commissionRate:x.commissionRate}));
export const useIssuePenalty=()=>useWrite<{id:string;amount:number;reason:string;orderId?:string}>("vendors","POST",x=>`vendors/${encodeURIComponent(x.id)}/penalties`,x=>({amount:x.amount,reason:x.reason,...(x.orderId?{orderId:x.orderId}:{})}));
export const useWaivePenalty=()=>useWrite<{id:string;penaltyId:string;reason:string}>("vendors","PATCH",x=>`vendors/${encodeURIComponent(x.id)}/penalties/${encodeURIComponent(x.penaltyId)}/waive`,x=>({reason:x.reason}));

const kycEntry=z.object({user:z.object({userId:z.string()}).passthrough(),idDocumentUrl:z.string().nullable(),bank:z.object({bankName:z.string().nullable(),maskedAccount:z.string().nullable()})}).passthrough();
/** Registration documents for a vendor still waiting in the KYC queue (matched by userId within a name/email search). */
export function useVendorKyc(userId:string|null,email:string|null,enabled:boolean){return useQuery({queryKey:["admin","kyc","vendor",userId],enabled:enabled&&!!userId,queryFn:async({signal})=>{const result=await apiClient.admin.request(`kyc/pending?${new URLSearchParams({role:"VENDOR",limit:"20",page:"1",...(email?{search:email}:{})})}`,{method:"GET",signal},x=>z.array(kycEntry).parse(x));return result.data.find(entry=>entry.user.userId===userId)??null;}});}
export const useAgentTier=()=>useWrite<{id:string;tier:"Bronze"|"Silver"|"Gold"|"Platinum"}>("agents","PATCH",x=>`actions/street-agent/${encodeURIComponent(x.id)}/tier`,x=>({tier:x.tier}));
