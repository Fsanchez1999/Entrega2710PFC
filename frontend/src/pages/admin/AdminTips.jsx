import React, { useState, useEffect } from "react";
import { tipService } from "../../services/api";

export default function AdminTips() {
  const [tips, setTips] = useState([]);
  const [form, setForm] = useState({ title: "", content: "", category: "" });

  const loadTips = async () => {
    try {
      const data = await tipService.getAll();
      setTips(data.tips || []);
    } catch (err) {
      alert("Erro ao carregar dicas: " + err.message);
    }
  };

  useEffect(() => {
    loadTips();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await tipService.create(form.title, form.content, form.category);
      alert("Dica criada com sucesso!");
      setForm({ title: "", content: "", category: "" });
      loadTips();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta dica?")) return;
    try {
      await tipService.delete(id);
      loadTips();
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  return (
    <div className="p-6">
      <h2>💡 Gerenciar Dicas</h2>

      <form onSubmit={handleCreate}>
        <input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Conteúdo" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <input placeholder="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <button type="submit">Criar Dica</button>
      </form>

      <h3>Lista de Dicas</h3>
      <ul>
        {tips.map((t) => (
          <li key={t.id}>
            {t.title} — {t.category}
            <button onClick={() => handleDelete(t.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
