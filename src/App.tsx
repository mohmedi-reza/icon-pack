import "./App.css";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";

function App() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-6">Welcome to Icon Pack</h1>
        <p className="text-lg text-muted-foreground mb-4">Your SVG icon management toolkit</p>
        <Button onClick={() => alert("Hello World!")}>Get Started</Button>
      </div>
    </MainLayout>
  );
}

export default App;
