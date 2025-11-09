import "./globals.css";

export const metadata = {
  title: "Video → Text Transcriber",
  description: "Upload or paste a link and get TXT / SRT / VTT / JSON",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
