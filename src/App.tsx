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
      <MainLayout className="pb-12">
        {/* Header section */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-3">Icon Pack</h1>
          <p className="text-xl text-muted-foreground">
            Create, manage, and export your SVG icon collections
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar - Collections */}
          <div className="lg:col-span-1">
            <CollectionManager />
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Icon uploader */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Upload SVG Icons</h2>
              <IconUploader />
            </section>

            {/* Icon list */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Your Icons</h2>
              <IconList />
            </section>

            {/* Icon details */}
            <section className="mt-8">
              <IconDetails />
            </section>
          </div>
        </div>
      </MainLayout>
    </SvgProvider>
  );
}

export default App;
