import Link from 'next/link';

type Props = {
  title: string;
  description: string;
  homeLabel: string;
  homeHref: string;
};

export function NotFoundContent({
  title,
  description,
  homeLabel,
  homeHref,
}: Props) {
  return (
    <div className="mx-auto max-w-175 px-5 py-24 text-center space-y-5">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p>{description}</p>
      <Link href={homeHref} className="inline-block underline focus-access">
        {homeLabel}
      </Link>
    </div>
  );
}
