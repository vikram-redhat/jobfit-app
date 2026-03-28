import './globals.css';

export const metadata = {
  title: 'JobFit — AI Job Application Tool',
  description: 'Paste a job description. Get a tailored resume and cover letter in seconds.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 min-h-screen">{children}</body>
    </html>
  );
}
