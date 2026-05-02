// src/components/results/KeywordsResult.js
// Renders the JSON returned by /api/tools/keywords.
// Used both inline (after the user submits) and on the shareable permalink page.

export default function KeywordsResult({ result }) {
  if (!result) return null;
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-gray-200 p-6">
        <p className="text-xs font-mono text-gray-400 uppercase tracking-wide mb-1">Role</p>
        <p className="text-lg font-semibold mb-1">{result.role || result.displayTitle}</p>
        {result.company && (
          <p className="text-sm text-gray-500">{result.company}</p>
        )}
        {result.summary && (
          <p className="mt-4 text-sm text-gray-700 leading-relaxed">{result.summary}</p>
        )}
      </div>

      <KeywordSection
        title="Must-have"
        accent="bg-blue-50 text-blue-800 border-blue-200"
        items={result.mustHave}
        helper="The hard requirements. Your resume must cover these."
      />
      <KeywordSection
        title="Nice-to-have"
        accent="bg-purple-50 text-purple-800 border-purple-200"
        items={result.niceToHave}
        helper="Bonuses. Worth mentioning if you have them."
      />
      <KeywordSection
        title="Soft skills"
        accent="bg-emerald-50 text-emerald-800 border-emerald-200"
        items={result.softSkills}
        helper="Show, don't tell — work these into your bullets."
      />
    </div>
  );
}

function KeywordSection({ title, accent, items, helper }) {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-xl font-bold">{title}</h2>
        <span className="text-xs text-gray-400 font-mono">{items.length}</span>
      </div>
      {helper && <p className="text-sm text-gray-500 mb-4">{helper}</p>}
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className={`mt-0.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${accent}`}>
              {item.keyword}
            </span>
            <span className="text-sm text-gray-700 flex-1">{item.why}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
