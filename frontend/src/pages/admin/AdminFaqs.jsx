import React, { useState, useEffect } from "react";
import { faqService } from "../../services/api";

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState({ question: "", answer: "" });

  const loadFaqs = async () => {
    try {
      const data = await faqService.getAll();
      setFaqs(data.faqs || []);
    } catch (err) {
      alert("Erro ao carregar FAQs: " + err.message);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await faqService.create(form.question, form.answer);
      alert("FAQ criada com sucesso!");
      setForm({ question: "", answer: "" });
      loadFaqs();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja excluir esta FAQ?")) return;
    try {
      await faqService.delete(id);
      loadFaqs();
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  return (
    <div className="p-6">
      <h2>❓ Gerenciar FAQs</h2>

      <form onSubmit={handleCreate}>
        <input placeholder="Pergunta" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
        <input placeholder="Resposta" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
        <button type="submit">Criar FAQ</button>
      </form>

      <h3>Lista de FAQs</h3>
      <ul>
        {faqs.map((f) => (
          <li key={f.id}>
            {f.question}
            <button onClick={() => handleDelete(f.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
