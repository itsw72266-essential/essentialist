import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET(request) {
  // Grab the path from the URL, or default to the homepage '/'
  const path = request.nextUrl.searchParams.get('path') || '/';
  
  // This tells Next.js 15 to instantly purge the Data Cache for this exact path
  revalidatePath(path, 'page');
  
  return NextResponse.json({ 
    revalidated: true, 
    path: path, 
    message: 'Next.js 15 cache successfully busted!' 
  });
}