import useSWR from "swr";

async function fetchStatus(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  const response = useSWR("/api/v1/status", fetchStatus, {
    refreshInterval: 2000,
  });

  console.log(response.isLoading);

  return (
    <>
      <h1>Status Page</h1>;<pre>{JSON.stringify(response.data, null, 2)}</pre>
    </>
  );
}
