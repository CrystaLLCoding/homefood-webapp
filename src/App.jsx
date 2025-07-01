import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0);
  const [tgUser, setTgUser] = useState(null);

  useEffect(() => {
    WebApp.ready();
    if (WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
      setTgUser(WebApp.initDataUnsafe.user);
    }
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold underline">Hello HomeFood!</h1>
      <p>Добро пожаловать в Telegram Web App!</p>
      {tgUser && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <div>👤 Пользователь: {tgUser.first_name} {tgUser.last_name}</div>
          <div>id: {tgUser.id}</div>
          <div>username: @{tgUser.username}</div>
        </div>
      )}
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
