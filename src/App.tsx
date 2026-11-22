import { RouteProvider } from "./state/RouteContext";
import { MapView } from "./components/MapView";
import { LocationSearch } from "./components/LocationSearch";
import { LocationList } from "./components/LocationList";
import { ModeToggle } from "./components/ModeToggle";
import { StopEndpoints } from "./components/StopEndpoints";
import { OptimizeButton } from "./components/OptimizeButton";
import { RouteSummary } from "./components/RouteSummary";
import { RouteActions } from "./components/RouteActions";

function App() {
  return (
    <RouteProvider>
      <div className="app-shell">
        <aside className="sidebar">
          <header className="sidebar__header">
            <h1>Route Optimizer</h1>
            <p>Add stops, choose a mode, and find the most efficient order to visit them.</p>
          </header>

          <LocationSearch />
          <LocationList />
          <ModeToggle />
          <StopEndpoints />
          <OptimizeButton />
          <RouteSummary />
          <RouteActions />
        </aside>
        <main className="map-pane">
          <MapView />
        </main>
      </div>
    </RouteProvider>
  );
}

export default App;
