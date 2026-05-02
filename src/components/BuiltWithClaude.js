// src/components/BuiltWithClaude.js
// Single source of truth for the JobFit attribution tagline.
// Rendered in the footer of every shared-layout page.
// One file = one wording. Change it here, change it everywhere.

export default function BuiltWithClaude({ className = '' }) {
  return (
    <span className={`text-xs text-gray-400 font-mono ${className}`}>
      Built with{' '}
      <a
        href="https://www.anthropic.com/claude"
        target="_blank"
        rel="noopener"
        className="hover:text-gray-600 underline-offset-2 hover:underline transition-colors"
      >
        Claude
      </a>
      . Guided by humans.
    </span>
  );
}
