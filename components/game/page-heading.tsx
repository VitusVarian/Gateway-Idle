export function PageHeading({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="mb-5">
      <h1 className="font-display text-2xl font-bold tracking-wide text-foreground text-balance sm:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
          {description}
        </p>
      ) : null}
    </div>
  )
}
