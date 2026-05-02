// src/components/results/ResumeGradeResult.js
// Renders the JSON returned by /api/tools/grade-resume.

export default function ResumeGradeResult({ result }) {
  if (!result) return null;

  const grade = result.overallGrade || '—';
  const score = typeof result.overallScore === 'number' ? result.overallScore : null;
  const gradeColor = gradeToColor(grade);

  return (
    <div className="space-y-8">
      {/* Headline grade */}
      <div className="rounded-2xl border border-gray-200 p-6 flex items-center gap-6">
        <div className={`flex-shrink-0 w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black ${gradeColor.bg} ${gradeColor.text}`}>
          {grade}
        </div>
        <div className="flex-1">
          <p className="text-xs font-mono text-gray-400 uppercase tracking-wide mb-1">Overall</p>
          <p className="text-lg font-semibold mb-1">{result.oneLineVerdict || '—'}</p>
          {score !== null && (
            <p className="text-sm text-gray-500">{score} / 100</p>
          )}
        </div>
      </div>

      {/* Sub-scores */}
      {result.scores && (
        <section>
          <h2 className="text-xl font-bold mb-4">Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(result.scores).map(([key, val]) => (
              <ScoreBar key={key} label={prettyLabel(key)} score={val.score} note={val.note} />
            ))}
          </div>
        </section>
      )}

      {/* Top fixes */}
      {result.topFixes && result.topFixes.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Top fixes</h2>
          <ol className="space-y-4">
            {result.topFixes.map((fix, i) => (
              <li key={i} className="rounded-xl border border-gray-200 p-5">
                <p className="text-sm font-mono text-gray-400 mb-1">Fix {i + 1}</p>
                <p className="text-base font-semibold mb-2">{fix.title}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{fix.detail}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Strengths */}
      {result.strengths && result.strengths.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">What's working</h2>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ScoreBar({ label, score, note }) {
  const pct = Math.max(0, Math.min(100, score || 0));
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-sm font-mono text-gray-500">{pct} / 100</p>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-1">
        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      {note && <p className="text-xs text-gray-500">{note}</p>}
    </div>
  );
}

function prettyLabel(k) {
  return ({
    clarity: 'Clarity',
    impact: 'Impact',
    atsReadiness: 'ATS readiness',
    actionVerbs: 'Action verbs',
    metrics: 'Metrics & numbers',
  })[k] || k;
}

function gradeToColor(grade) {
  const g = (grade || '').toUpperCase();
  if (g.startsWith('A')) return { bg: 'bg-emerald-50',  text: 'text-emerald-700' };
  if (g.startsWith('B')) return { bg: 'bg-blue-50',     text: 'text-blue-700' };
  if (g.startsWith('C')) return { bg: 'bg-amber-50',    text: 'text-amber-700' };
  return { bg: 'bg-rose-50', text: 'text-rose-700' };
}
