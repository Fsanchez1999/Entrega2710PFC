import React, { useState, useEffect } from "react";
import { userService } from "../../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data.users || []);
    } catch (err) {
      alert("Erro ao carregar usuários: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await userService.createAdmin(form.username, form.email, form.password, form.name);
      alert("Usuário admin criado com sucesso!");
      setForm({ username: "", email: "", password: "", name: "" });
      loadUsers();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir este usuário?")) return;
    try {
      await userService.delete(id);
      loadUsers();
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  return (
    <div className="p-6">
      <h2>👤 Gerenciar Usuários</h2>

      <form onSubmit={handleCreate} className="mb-4">
        <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Senha" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <button type="submit">Criar Admin</button>
      </form>

      <h3>Lista de Usuários</h3>
      {loading ? <p>Carregando...</p> : (
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              {u.username} — {u.email} ({u.is_admin ? "Admin" : "Usuário"})
              <button onClick={() => handleDelete(u.id)}>Excluir</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
