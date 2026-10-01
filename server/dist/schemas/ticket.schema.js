import { z } from 'zod';
import { ALL_SERVICE_CODES } from '../constants/services.js';
export const createTicketSchema = z.object({
    serviceCode: z.enum(ALL_SERVICE_CODES, {
        errorMap: () => ({ message: 'Code de service invalide' })
    }),
    serviceName: z.string().min(2).max(100).optional(),
    isPriority: z.boolean().optional().default(false),
    customerPhone: z.string().regex(/^(\+228)?[0-9]{8}$/, 'Format téléphone Togo invalide (8 chiffres)').nullable().optional().or(z.literal('')),
    customerEmail: z.string().email('Email invalide').nullable().optional().or(z.literal(''))
});
export const callNextSchema = z.object({
    agentId: z.string().optional(),
    agentName: z.string().min(2).max(50),
    counterNumber: z.number().int().min(1).max(20),
    serviceFilter: z.string().optional()
});
export const updateStatusSchema = z.object({
    ticketId: z.string().uuid('ID ticket invalide'),
    status: z.enum(['WAITING', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW']),
    extra: z.object({
        satisfactionScore: z.number().int().min(1).max(5).optional(),
        customerName: z.string().max(100).optional(),
        customerPhone: z.string().max(30).optional(),
        customerEmail: z.string().email().optional(),
        counterNumber: z.number().int().min(1).max(20).optional(),
        agentName: z.string().max(50).optional()
    }).optional()
});
export const loginSchema = z.object({
    username: z.string().min(1).optional(),
    password: z.string().min(1, 'Le mot de passe ou code PIN est obligatoire'),
    role: z.enum(['ADMIN', 'AGENT', 'KIOSK']).optional()
});
