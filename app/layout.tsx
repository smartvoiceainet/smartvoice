import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Viewport } from "next";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import dynamic from "next/dynamic";
import "./globals.css";

// Dynamically import accessibility and performance components to avoid adding them to the main bundle
const FocusRing = dynamic(() => import("@/components/FocusRing"), { ssr: false });
const A11yChecker = dynamic(() => import("@/components/A11yChecker"), {
  ssr: false,
  loading: () => null,
});
const PerformanceMonitor = dynamic(() => import("@/components/PerformanceMonitor"), { 
  ssr: false,
  loading: () => null 
});

const font = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
	// Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
	themeColor: config.colors.main,
	width: "device-width",
	initialScale: 1,
};

// This adds default SEO tags to all pages in our app.
// You can override them in each page passing params to getSOTags() function.
export const metadata = getSEOTags();

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			data-theme={config.colors.theme}
			className={font.className}
		>
			<body>
				{/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
				<ClientLayout>
					{/* Add accessibility improvements */}
					<FocusRing />
					{/* Only show accessibility checker in development */}
					{process.env.NODE_ENV === "development" && <A11yChecker />}
					{/* Add performance monitoring */}
					<PerformanceMonitor />
					<main id="main-content">
						{children}
					</main>
				</ClientLayout>
			</body>
		</html>
	);
}
