// apps/web/app/lib/session.ts
'use server';

import { cookies } from 'next/headers';
import { jwtVerify }_ from 'jose';
import { prisma } from '@/lib/prisma'; // Import the shared prisma client

// Define the expected shape of the JWT payload
// This MUST match the data set in your FastAPI login endpoint
// [cite: gepetointraining/cer-sevn-app/cer-sevn-app-14252c908971bf8d7c7f9bf7b1d34d38e99522a7/apps/api/auth/login.py]
interface UserPayload {
  sub: string; // User ID
  role: string; // Role Key (e.g., 'diretor', 'lider')
  school: string; // School Slug
  sector: string; // Sector Key
  exp: number;
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

export async function getUserSession() {
  const token = cookies().get('session_token')?.value;

  if (!token) {
    throw new Error('Não autenticado: Nenhum token encontrado.');
  }

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET_KEY não está configurado no servidor.');
  }

  try {
    const { payload } = await jwtVerify<UserPayload>(token, JWT_SECRET);

    // Fetch full organization and sector IDs from the database
    // This is more secure and robust than storing IDs in the token
    const organization = await prisma.organization.findUnique({
      where: { slug: payload.school },
      select: {
        id: true,
        sectors: { where: { key: payload.sector }, select: { id: true } },
      },
    });

    if (!organization) {
      throw new Error('Organização não encontrada.');
    }
    const sector = organization.sectors[0];
    if (!sector) {
      throw new Error('Setor não encontrado.');
    }

    return {
      userId: payload.sub,
      roleKey: payload.role,
      organizationId: organization.id,
      sectorId: sector.id,
    };
  } catch (error) {
    console.error('Falha ao verificar sessão:', error);
    throw new Error('Sessão inválida ou expirada.');
  }
}

