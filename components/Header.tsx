"use client";

import { useState, useEffect } from "react";
import type { JSX } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import ButtonSignin from "./ButtonSignin";
import ButtonAccount from "./ButtonAccount";
import VoiceAIMenu from "./VoiceAI/VoiceAIMenu";
import VoiceAINotifications from "./VoiceAI/VoiceAINotifications";
import config from "@/config";

const links: {
  href: string;
  label: string;
}[] = [
  {
    href: "/#pricing",
    label: "Pricing",
  },
  {
    href: "/#testimonials",
    label: "Reviews",
  },
  {
    href: "/#faq",
    label: "FAQ",
  },
];

const cta: JSX.Element = <ButtonSignin extraStyle="btn-primary" />;

// A header with a logo on the left, links in the center (like Pricing, etc...), and a CTA (like Get Started or Login) on the right.
// The header is responsive, and on mobile, the links are hidden behind a burger button.
const Header = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { data: session, status } = useSession();

  // setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <header className="bg-base-200">
      <nav
        className="container flex items-center justify-between px-8 py-4 mx-auto"
        aria-label="Global"
      >
        {/* Your logo/name on large screens */}
        <div className="flex lg:flex-1">
          <Link
            className="flex items-center gap-2 shrink-0 "
            href="/"
            title={`${config.appName} homepage`}
          >
            <Image
              src="/images/smartvoiceclearbackcropped.png"
              alt={`${config.appName} logo`}
              className="h-14 w-auto"
              priority={true}
              width={280}
              height={84}
              style={{objectFit: 'contain'} as React.CSSProperties}
            />
          </Link>
        </div>
        {/* Burger button to open menu on mobile */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setIsOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-base-content"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {/* Your links on large screens */}
        <div className="hidden lg:flex lg:justify-center lg:gap-12 lg:items-center">
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              className="link link-hover"
              title={link.label}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Links on the right */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-4">
          {status === "authenticated" ? (
            <>
              <VoiceAIMenu />
              <VoiceAINotifications />
              <ButtonAccount />
            </>
          ) : (
            cta
          )}
        </div>
      </nav>

      {/* Mobile menu, show/hide based on menu state. */}
      <div className={`relative z-50 ${isOpen ? "" : "hidden"}`}>
        <div
          className={`fixed inset-y-0 right-0 z-10 w-full px-8 py-4 overflow-y-auto bg-base-200 sm:max-w-sm sm:ring-1 sm:ring-neutral/10 transform origin-right transition ease-in-out duration-300`}
        >
          {/* Your logo/name on small screens */}
          <div className="flex items-center justify-between">
            <Link
              className="flex items-center gap-2 shrink-0 "
              title={`${config.appName} homepage`}
              href="/"
            >
              <Image
                src="/images/smartvoiceclearbackcropped.png"
                alt={`${config.appName} logo`}
                className="h-12 w-auto"
                priority={true}
                width={240}
                height={72}
                style={{objectFit: 'contain'} as React.CSSProperties}
              />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5"
              onClick={() => setIsOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Your links on small screens */}
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y">
              <div className="space-y-2 py-6">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium leading-7"
                    title={link.label}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {status === "authenticated" && (
                  <div className="pt-4 border-t border-base-300">
                    <VoiceAIMenu />
                  </div>
                )}
              </div>
              <div className="py-6">
                {status === "authenticated" ? (
                  <div className="space-y-4">
                    <VoiceAINotifications />
                    <ButtonAccount />
                  </div>
                ) : (
                  cta
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
