// app/api/sharepoint-sites/route.ts
import { NextResponse } from 'next/server';
import { getSharePointSites } from '@/lib/db';

export async function GET() {
  const sites = getSharePointSites();
  return NextResponse.json(sites);
}