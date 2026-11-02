import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-[var(--color-primary)]">404</p>
      <h1 className="mt-2 font-serif text-3xl font-bold text-[var(--color-on-surface)]">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-[var(--color-on-surface-variant)]">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-[var(--color-on-primary)] hover:bg-[var(--color-primary-container)]"
      >
        Back to home
      </Link>
    </div>
  );
}
