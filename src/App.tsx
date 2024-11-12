import { useEffect, useRef, useState } from "react";
import "./App.css";
import { User } from "./types/user";

const URL = "https://randomuser.me/api/?results=100";

type CurrentFilter = "fisrt" | "last" | "country" | "";

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [isPaintedRows, setIsPaintedRows] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [usersSorted, setUsersSorted] = useState<User[]>([]);
  const [currentFilter, setCurrentFilter] = useState<CurrentFilter>("");

  const originalUsers = useRef<User[]>([]);

  const fetchUsers = async () => {
    const res = await fetch(URL);
    const usersResponse = await res.json();
    setUsers(usersResponse.results);
    originalUsers.current = usersResponse.results;
  };

  const handleTogglePaintRows = () => setIsPaintedRows(!isPaintedRows);

  const toggleOrderByCountry = () => {
    if (currentFilter === "country") return setCurrentFilter("");
    setCurrentFilter("country");
  };

  const handleDeleteUserByID = (uuid: string) => {
    const usersFiltered = users.filter((user) => user.login.uuid !== uuid);
    setUsers(usersFiltered);
  };

  const restoreOriginalUsers = () => setUsers(originalUsers.current);

  const usersRender = usersSorted.filter((user) =>
    user.location.country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleChangeCurrentFilter = (newCurrentFilter: CurrentFilter) => {
    if (newCurrentFilter === currentFilter) return setCurrentFilter("");
    setCurrentFilter(newCurrentFilter);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let newUsersSorted: User[] = [];
    if (currentFilter === "country") {
      const newUsers = [...users].sort((a, b) =>
        a.location.country.localeCompare(b.location.country)
      );
      newUsersSorted = newUsers;
    }

    if (currentFilter === "fisrt") {
      const newUsers = [...users].sort((a, b) =>
        a.name.first.localeCompare(b.name.first)
      );
      newUsersSorted = newUsers;
    }

    if (currentFilter === "last") {
      const newUsers = [...users].sort((a, b) =>
        a.name.last.localeCompare(b.name.last)
      );
      newUsersSorted = newUsers;
    }

    if (currentFilter === "") {
      setUsersSorted(users);
      return;
    }

    setUsersSorted(newUsersSorted);
  }, [currentFilter, users]);
  return (
    <>
      <h1>Lista de usuarios</h1>
      <div
        style={{
          margin: "1rem 0",
          display: "flex",
          gap: "2rem",
          justifyContent: "center",
        }}
      >
        <button onClick={handleTogglePaintRows}>Colorear filas</button>
        <button onClick={toggleOrderByCountry}>Ordenar por país</button>
        <button onClick={restoreOriginalUsers}>Restaurar estado inicial</button>
        <input
          value={countrySearch}
          onChange={(e) => setCountrySearch(e.target.value)}
          type="text"
          placeholder="Filtrar por país"
        />
        <span>Numero de usuarios: {usersRender.length}</span>
      </div>
      <table
        className={isPaintedRows ? "colorRows" : ""}
        style={{ width: "100%" }}
      >
        <thead
          style={{
            fontSize: "1.5rem",
            backgroundColor: "black",
          }}
        >
          <tr>
            <th>Foto</th>
            <th onClick={() => handleChangeCurrentFilter("fisrt")}>Nombre</th>
            <th onClick={() => handleChangeCurrentFilter("last")}>Apellido</th>
            <th onClick={() => handleChangeCurrentFilter("country")}>País</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usersRender.map((user) => (
            <tr key={user.login.uuid}>
              <td>
                <img
                  src={user.picture.thumbnail}
                  alt={`Usuario ${user.name.first + " " + user.name.last}`}
                />
              </td>
              <td>{user.name.first}</td>
              <td>{user.name.last}</td>
              <td>{user.location.country}</td>
              <td>
                <button onClick={() => handleDeleteUserByID(user.login.uuid)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default App;
