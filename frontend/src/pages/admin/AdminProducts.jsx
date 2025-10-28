// src/pages/admin/AdminProducts.jsx
import React, { useState, useEffect } from "react";
import { productService } from "../../services/api";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: ""});
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data.products || []);
    } catch (err) {
      alert("Erro ao carregar produtos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productService.update(editingId, form);
        alert("Produto atualizado com sucesso!");
      } else {
        await productService.create(form);
        alert("Produto criado com sucesso!");
      }
      setForm({ name: "", price: "", description: "" });
      setEditingId(null);
      loadProducts();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
    });
    setEditingId(product.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir este produto?")) return;
    try {
      await productService.delete(id);
      loadProducts();
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", price: "", description: "" });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        🛒 {editingId ? "Editar Produto" : "Gerenciar Produtos"}
      </h2>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
        <input
          placeholder="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Preço"
          type="number"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <input
          placeholder="Descrição"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        <div className="flex gap-2">
          <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">
            {editingId ? "Salvar Alterações" : "Criar Produto"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-400 text-white px-3 py-1 rounded"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h3 className="text-lg font-medium mb-2">Lista de Produtos</h3>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p.id} className="flex justify-between items-center mb-2">
              <span>
                {p.name} - R${p.price} <small>({p.description})</small>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="bg-yellow-400 text-black px-2 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
