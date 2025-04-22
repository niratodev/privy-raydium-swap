import { usePrivy } from "@privy-io/react-auth";

export const ConnectionState = () => {
  const { ready, user, login, authenticated, logout } = usePrivy();
  const isAuthenticated = ready && authenticated;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      {isAuthenticated ? (
        <button
          type="button"
          onClick={() => logout()}
          disabled={!isAuthenticated}
        >
          Logout
        </button>
      ) : (
        <button
          type="button"
          onClick={() => login()}
          disabled={isAuthenticated}
        >
          Login
        </button>
      )}
      {ready && authenticated && <p>{user?.wallet?.address}</p>}
    </div>
  );
};
