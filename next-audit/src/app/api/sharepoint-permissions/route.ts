// app/api/sharepoint-permissions/route.ts
import { NextResponse } from 'next/server';
import { getSharePointPermissions } from '@/lib/db';

export async function GET() {
  const data = getSharePointPermissions();
  return NextResponse.json(data);
}