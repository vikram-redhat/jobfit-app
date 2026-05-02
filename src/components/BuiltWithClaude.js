// src/components/BuiltWithClaude.js
// Single source of truth for the JobFit attribution tagline.
// Renders inline next to the footer copyright. Inherits font/color from
// its parent so it reads as part of the same muted credits group.
// One file = one wording. Change it here, change it everywhere.

export default function BuiltWithClaude() {
  return (
    <>
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
    </>
  );
}
