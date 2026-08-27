import { redirect } from 'next/navigation';

export default async function DemosRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const queryString = new URLSearchParams();

  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (typeof value === 'string') {
      queryString.set(key, value);
    }
  });

  const query = queryString.toString();
  redirect(query ? `/portfolio?${query}` : '/portfolio');
}
