import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

// Bust caches on demand:
//   /revalidate?path=/blog        → purge a route's cache
//   /revalidate?tag=blog-list     → purge a cache tag (repeatable: ?tag=a&tag=b)
// With neither, defaults to revalidating the homepage.
export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const tags = searchParams.getAll('tag').filter(Boolean);
  const path = searchParams.get('path');

  for (const tag of tags) {
    revalidateTag(tag);
  }

  if (path || tags.length === 0) {
    revalidatePath(path || '/', 'page');
  }

  return NextResponse.json({
    revalidated: true,
    tags,
    path: path || (tags.length === 0 ? '/' : null),
    message: 'Cache revalidated.',
  });
}
