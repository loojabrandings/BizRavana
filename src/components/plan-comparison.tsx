import Reveal from "@/components/reveal";

/** The four paid columns, in card order (Standard = Most Popular). */
const PLAN_COLS = ["Basic", "Standard", "Premium", "Enterprise"] as const;

/** Row of usage limits — one value per plan column. */
type LimitRow = {
  label: string;
  values: [string, string, string, string];
};

const LIMITS: LimitRow[] = [
  { label: "Orders", values: ["100", "200", "500", "Unlimited"] },
  { label: "Expenses", values: ["100", "200", "500", "Unlimited"] },
  { label: "Products", values: ["10", "50", "100", "Unlimited"] },
  { label: "Quotations", values: ["100", "200", "500", "Unlimited"] },
  { label: "Inventory items", values: ["100", "200", "500", "Unlimited"] },
  { label: "File storage", values: ["5 MB", "250 MB", "1 GB", "Unlimited"] },
];

/** Row of feature availability — one flag per plan column. */
type FeatureRow = {
  label: string;
  yes: [boolean, boolean, boolean, boolean];
};

const FEATURES: FeatureRow[] = [
  { label: "Custom branding", yes: [true, true, true, true] },
  { label: "Shipping labels", yes: [true, true, true, true] },
  { label: "Image upload", yes: [true, true, true, true] },
  { label: "Bank transfers", yes: [true, true, true, true] },
  { label: "Bulk XLSX & CSV import", yes: [false, true, true, true] },
  { label: "Advanced analytics", yes: [false, false, true, true] },
  { label: "Custom roles", yes: [false, false, true, true] },
  { label: "AI assistant", yes: [false, false, false, true] },
  { label: "API access", yes: [false, false, false, true] },
  { label: "Custom integrations", yes: [false, false, false, true] },
  { label: "Dedicated environment", yes: [false, false, false, true] },
  { label: "Priority support", yes: [false, false, false, true] },
];

/** One table's header row — label column + the four plan columns. */
function PlanHeader() {
  return (
    <thead>
      <tr>
        <th scope="col">Feature</th>
        {PLAN_COLS.map((name, i) => (
          <th
            key={name}
            scope="col"
            className={i === 1 ? "pricing-compare__plan--popular" : undefined}
          >
            {name}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/**
 * Plan comparison section — two side-by-side tables (usage limits and
 * feature availability) that put the four plans in one view. Static content,
 * so this is a plain server component; the tables scroll horizontally on
 * narrow screens.
 */
export default function PlanComparison() {
  return (
    <section className="about-section pricing-compare" aria-labelledby="pricing-compare-heading">
      <div className="about-section__inner about-section__inner--wide">
        <Reveal className="pricing-compare__head">
          <p className="about-eyebrow">Compare</p>
          <h2 id="pricing-compare-heading" className="about-lead">
            Every plan, side by side
          </h2>
          <p className="about-body pricing-compare__desc">
            The same limits and features across Basic, Standard, Premium and
            Enterprise — so you can pick the plan that fits your business.
          </p>
        </Reveal>

        <Reveal delay={80}>
          {/* Usage limits — the caps per plan, in the card order. */}
          <h3 className="pricing-compare__label">Usage limits</h3>
          <div className="pricing-compare__table-wrap">
            <table className="pricing-compare__table">
              <PlanHeader />
              <tbody>
                {LIMITS.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {row.values.map((value, i) => (
                      <td key={i}>
                        {value === "Unlimited" ? (
                          <span className="pricing-compare__unlimited">
                            {value}
                          </span>
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Feature availability — checkmark vs cross. */}
          <h3 className="pricing-compare__label">Features &amp; access</h3>
          <div className="pricing-compare__table-wrap">
            <table className="pricing-compare__table">
              <PlanHeader />
              <tbody>
                {FEATURES.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {row.yes.map((included, i) => (
                      <td key={i}>
                        <span
                          className={
                            included
                              ? "pricing-compare__yes"
                              : "pricing-compare__no"
                          }
                          role="img"
                          aria-label={included ? "Included" : "Not included"}
                        >
                          {included ? "✓" : "✕"}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
