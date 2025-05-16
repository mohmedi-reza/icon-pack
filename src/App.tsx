import "./App.css";
import { MainLayout } from "@/components/layout/MainLayout";
import { SvgProvider } from "@/lib/svg-context";
import { IconUploader } from "@/components/svg/IconUploader";
import { IconList } from "@/components/svg/IconList";
import { IconDetails } from "@/components/svg/IconDetails";
import { CollectionManager } from "@/components/svg/CollectionManager";

function App() {
  return (
    <SvgProvider>
      <MainLayout className="pb-12 bg-gradient-to-b from-background to-muted/20">
        {/* Header section with gradient background */}
        <div className="mb-12 pt-10 pb-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="url(#header-pattern)" />
              <defs>
                <pattern id="header-pattern" patternUnits="userSpaceOnUse" width="30" height="30">
                  <path d="M 0,5 L 10,5 C 12.5,5 12.5,10 15,10 L 25,10" stroke="currentColor" fill="none" strokeWidth="0.5" />
                  <path d="M 0,15 L 10,15 C 12.5,15 12.5,20 15,20 L 25,20" stroke="currentColor" fill="none" strokeWidth="0.5" />
                  <path d="M 0,25 L 10,25 C 12.5,25 12.5,30 15,30 L 25,30" stroke="currentColor" fill="none" strokeWidth="0.5" />
                </pattern>
              </defs>
            </svg>
          </div>
          <div className="relative z-10">
            <div className="mx-auto mb-5 size-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl p-5 text-primary-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v12c0 1.1.9 2 2 2h4v4c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2h-4V4c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2z"/>
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Icon Pack</h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Create, manage, and export your SVG icon collections with ease
            </p>
          </div>
        </div>

        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left sidebar - Collections */}
            <div className="lg:col-span-3">
              <div className="sticky top-6">
                <CollectionManager />
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-6 space-y-8">
              {/* Icon uploader */}
              <section className="bg-card rounded-xl border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/>
                    <path d="M18 2v6h6"/>
                    <path d="M18 8 9 17"/>
                    <path d="m17 11 4 4"/>
                  </svg>
                  Upload SVG Icons
                </h2>
                <IconUploader />
              </section>

              {/* Icon list */}
              <section className="bg-card rounded-xl border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                    <path d="M9 14v1"/>
                    <path d="M9 19v2"/>
                    <path d="M9 3v2"/>
                    <path d="M9 9v1"/>
                    <path d="M15 14v1"/>
                    <path d="M15 19v2"/>
                    <path d="M15 3v2"/>
                    <path d="M15 9v1"/>
                  </svg>
                  Your Icons
                </h2>
                <IconList />
              </section>
            </div>

            {/* Right sidebar - Icon Details */}
            <div className="lg:col-span-3">
              <div className="sticky top-6">
                <section className="bg-card rounded-xl border shadow-sm">
                  <IconDetails />
                </section>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </SvgProvider>
  );
}

export default App;
