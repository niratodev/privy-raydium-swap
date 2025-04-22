import { ConnectionState } from "./ConnectionState";
import { PrivyDebug } from "./PrivyDebug";

export const App = () => {
  return (
    <div>
      <ConnectionState />
      <PrivyDebug />
    </div>
  );
};
