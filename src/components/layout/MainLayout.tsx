import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Toolbar } from "./Toolbar";
import { Footer } from "./Footer";
import Icon from "../icon/icon.component";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-svh">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center">
            <div className="mr-4 flex">
              <a href="/" className="flex items-center space-x-2">
                <Icon name="designtools" className="text-3xl" />
              </a>
            </div>
            <Toolbar />
          </div>
        </div>
      </header>

      <main className="flex-1 py-6">
        <div className={cn("container max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8", className)}>
          {children}
        </div>
      </main>

      <footer className="border-t py-4 bg-background">
        <div className="container max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Footer />
        </div>
      </footer>
    </div>
  );
}
