import "./App.css";
import { Button } from "@/components/ui/button";

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh">
      <Button onClick={() => alert("Hello World!")}>Hello World!</Button>
    </div>
  );
}

export default App;
