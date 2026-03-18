import './globals.css';

export const metadata = {
  title: 'Tourism Case Tracker',
  description: 'Tourism department case tracking and management system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
