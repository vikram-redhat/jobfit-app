import { Resend } from 'resend';

let _resend;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const contactEmail = process.env.CONTACT_EMAIL || 'vikram@craftbits.com';

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response('Invalid email address', { status: 400 });
    }

    if (message.length > 2000) {
      return new Response('Message too long', { status: 400 });
    }

    await getResend().emails.send({
      from: 'JobFit Contact <onboarding@resend.dev>',
      to: contactEmail,
      reply_to: email,
      subject: `JobFit contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <hr />
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    });

    return Response.json({ ok: true });
  } catch (e) {
    console.error('Contact form error:', e);
    return new Response('Failed to send message', { status: 500 });
  }
}
