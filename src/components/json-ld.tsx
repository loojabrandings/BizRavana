/**
 * Renders a JSON-LD structured-data block (schema.org). Server component —
 * the object is serialized once at render time into a script tag.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
